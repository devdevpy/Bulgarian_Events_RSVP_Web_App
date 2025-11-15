/*
  # Добавяне на RLS политики и тригер за капацитет

  1. RLS Политики за events
    - SELECT: Разрешен за всички (включително анонимни потребители)
    - INSERT: Разрешен само за автентикирани потребители, created_by трябва да е auth.uid()
    - UPDATE: Разрешен само за собственика (created_by = auth.uid())
    - DELETE: Разрешен само за собственика (created_by = auth.uid())

  2. RLS Политики за rsvps
    - SELECT: Разрешен само за организатора на събитието (чрез join към events)
    - INSERT: Разрешен за всички (включително анонимни) - публична форма
    - UPDATE: Разрешен само за организатора на събитието
    - DELETE: Разрешен само за организатора на събитието

  3. Тригер за контрол на капацитет
    - Функция: check_event_capacity()
    - Проверява дали има свободни места преди INSERT на 'attending' RSVP
    - Блокира INSERT ако capacity е запълнен
    - Позволява 'maybe' и 'declined' без ограничение
*/

-- ============================================
-- RLS ПОЛИТИКИ ЗА EVENTS
-- ============================================

-- SELECT: Всички могат да виждат събитията (включително анонимни)
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (true);

-- INSERT: Само автентикирани потребители, created_by трябва да е auth.uid()
CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- UPDATE: Само собственикът може да променя събитието
CREATE POLICY "Event owners can update their events"
  ON events FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- DELETE: Само собственикът може да изтрие събитието
CREATE POLICY "Event owners can delete their events"
  ON events FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- ============================================
-- RLS ПОЛИТИКИ ЗА RSVPS
-- ============================================

-- SELECT: Само организаторът на събитието може да вижда RSVP
CREATE POLICY "Event owners can view RSVPs for their events"
  ON rsvps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = rsvps.event_id
      AND events.created_by = auth.uid()
    )
  );

-- INSERT: Всички могат да създават RSVP (публична форма)
CREATE POLICY "Anyone can create RSVP"
  ON rsvps FOR INSERT
  WITH CHECK (true);

-- UPDATE: Само организаторът на събитието може да променя RSVP
CREATE POLICY "Event owners can update RSVPs for their events"
  ON rsvps FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = rsvps.event_id
      AND events.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = rsvps.event_id
      AND events.created_by = auth.uid()
    )
  );

-- DELETE: Само организаторът на събитието може да изтрие RSVP
CREATE POLICY "Event owners can delete RSVPs for their events"
  ON rsvps FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = rsvps.event_id
      AND events.created_by = auth.uid()
    )
  );

-- ============================================
-- ФУНКЦИЯ И ТРИГЕР ЗА КОНТРОЛ НА КАПАЦИТЕТ
-- ============================================

-- Функция за проверка на капацитета преди INSERT на RSVP
CREATE OR REPLACE FUNCTION check_event_capacity()
RETURNS TRIGGER AS $$
DECLARE
  event_capacity integer;
  current_attending integer;
BEGIN
  -- Проверяваме само ако новият статус е 'attending'
  IF NEW.status = 'attending' THEN
    -- Вземаме капацитета на събитието
    SELECT capacity INTO event_capacity
    FROM events
    WHERE id = NEW.event_id;

    -- Броим текущите 'attending' RSVP
    SELECT COUNT(*) INTO current_attending
    FROM rsvps
    WHERE event_id = NEW.event_id
    AND status = 'attending';

    -- Проверяваме дали има свободни места
    IF current_attending >= event_capacity THEN
      RAISE EXCEPTION 'Няма свободни места';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер за проверка преди INSERT
CREATE TRIGGER trigger_check_event_capacity
  BEFORE INSERT ON rsvps
  FOR EACH ROW
  EXECUTE FUNCTION check_event_capacity();