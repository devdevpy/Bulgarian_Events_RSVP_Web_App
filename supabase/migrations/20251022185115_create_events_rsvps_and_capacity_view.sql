/*
  # Създаване на таблици за събития и RSVP

  1. Нови таблици
    - `events` - Събития
      - `id` (uuid, primary key) - Уникален идентификатор
      - `title` (text, not null) - Заглавие на събитието
      - `description` (text) - Описание
      - `date` (timestamptz, not null) - Дата и час на събитието
      - `location` (text, not null) - Локация
      - `capacity` (integer, not null) - Максимален капацитет >= 0
      - `created_by` (uuid, foreign key) - Създател (потребител)
      - `created_at` (timestamptz, not null) - Дата на създаване
    
    - `rsvps` - RSVP потвърждения
      - `id` (uuid, primary key) - Уникален идентификатор
      - `event_id` (uuid, foreign key) - ID на събитието
      - `name` (text, not null) - Име на участника
      - `email` (text, not null) - Email на участника
      - `status` (text, not null) - Статус: attending, maybe, declined
      - `created_at` (timestamptz, not null) - Дата на създаване

  2. Индекси
    - events: индекс по дата и създател
    - rsvps: индекс по event_id, уникално ограничение (event_id, email)

  3. VIEW
    - `event_capacity_view` - Изглед за капацитет на събития
      - Показва event_id, capacity, attending_count, remaining

  4. Сигурност
    - Активиране на RLS за двете таблици (без политики засега)
*/

-- Изтриване на съществуващи обекти ако има такива
DROP VIEW IF EXISTS event_capacity_view;
DROP TABLE IF EXISTS rsvps;
DROP TABLE IF EXISTS events;

-- Създаване на таблица events
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date timestamptz NOT NULL,
  location text NOT NULL,
  capacity integer NOT NULL CHECK (capacity >= 0),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Индекси за events
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_created_by ON events(created_by);

-- Създаване на таблица rsvps
CREATE TABLE rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  status text NOT NULL CHECK (status IN ('attending', 'maybe', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Индекси за rsvps
CREATE INDEX idx_rsvps_event_id ON rsvps(event_id);
CREATE UNIQUE INDEX idx_rsvps_event_email ON rsvps(event_id, email);

-- Активиране на RLS (без политики засега)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Създаване на VIEW за капацитет на събития
CREATE VIEW event_capacity_view AS
SELECT 
  e.id AS event_id,
  e.capacity,
  COALESCE(COUNT(r.id) FILTER (WHERE r.status = 'attending'), 0)::integer AS attending_count,
  (e.capacity - COALESCE(COUNT(r.id) FILTER (WHERE r.status = 'attending'), 0))::integer AS remaining
FROM events e
LEFT JOIN rsvps r ON e.id = r.event_id
GROUP BY e.id, e.capacity;