# Платформа за управление на събития

Модерно уеб приложение за създаване, управление и присъствие на събития, изградено с React, TypeScript, Vite и Supabase.

## 🚀 Функционалности

### За публични посетители:
- 📅 Разглеждане на предстоящи събития
- ✉️ RSVP без регистрация
- 🔍 Търсене и филтриране на събития
- 📱 Responsive дизайн

### За организатори:
- ➕ Създаване и управление на събития
- 👥 Преглед на RSVPs и статистики
- 📊 Export на данни в CSV
- 📧 Копиране на email списъци
- 🎨 Demo функции за тестване

## 🛡️ Сигурност

- ✅ Row Level Security (RLS) активиран
- ✅ Потребителите виждат само свои събития
- ✅ RSVPs са видими само за организатора
- ✅ Сигурна автентикация с Supabase

## 🎨 UI/UX функции

- 🌓 Dark mode
- ⚡ Плавни анимации
- ⌨️ Keyboard shortcuts
- 📱 Mobile-first дизайн
- ♿ Accessibility support

## 📋 Технологичен стек

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Icons**: Lucide React

## 🏁 Бързо стартиране

### Предварителни изисквания:
- Node.js 18+
- npm или yarn
- Supabase акаунт

### Инсталация:

```bash
# Клониране на проекта
git clone <repository-url>
cd project

# Инсталиране на dependencies
npm install

# Конфигуриране на environment variables
# Създайте .env файл с вашите Supabase credentials:
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Стартиране на dev server
npm run dev
```

Приложението ще е достъпно на `http://localhost:5173`

## 📦 Build за production

```bash
npm run build
```

Optimized файловете ще бъдат в `dist/` директорията.

## 🚢 Deployment

Вижте [DEPLOYMENT.md](./DEPLOYMENT.md) за подробни инструкции за публикуване на:
- Netlify
- Vercel
- GitHub Pages
- Railway

## 🧪 Тестване

Вижте [TESTING_RESULTS.md](./TESTING_RESULTS.md) за подробни резултати от тестването, включително:
- RLS policies проверка
- Функционални тестове
- Сигурностни тестове
- Multi-user сценарии

## 📖 Структура на проекта

```
project/
├── src/
│   ├── components/        # React компоненти
│   │   ├── AboutPage.tsx
│   │   ├── AuthForm.tsx
│   │   ├── EventDetailsPage.tsx
│   │   ├── EventManagementPage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── LoadingButton.tsx
│   │   ├── MyEventsPage.tsx
│   │   └── Navbar.tsx
│   ├── contexts/          # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── lib/               # Utilities и helpers
│   │   ├── database.types.ts
│   │   ├── dateUtils.ts
│   │   └── supabase.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── migrations/        # Database migrations
│       ├── 20251022185115_create_events_rsvps_and_capacity_view.sql
│       └── 20251022190300_add_rls_policies_and_capacity_trigger.sql
├── DEPLOYMENT.md          # Deployment инструкции
├── TESTING_RESULTS.md     # Тестови резултати
└── README.md
```

## 🔧 Скриптове

```bash
npm run dev       # Стартира development server
npm run build     # Build за production
npm run preview   # Preview на production build
npm run lint      # ESLint проверка
npm run typecheck # TypeScript проверка
```

## 🎯 Основни функции

### Публични потребители:
1. Разгледай всички събития без вход
2. Подай RSVP директно чрез форма
3. Виж детайли за всяко събитие

### Автентикирани потребители:
1. Създай нови събития
2. Редактирай/изтрий свои събития
3. Виж RSVPs за своите събития
4. Експортирай данни
5. Използвай demo функции

## 🔐 RLS Policies (Supabase)

### Events таблица:
- **SELECT**: Всички (public)
- **INSERT**: Само authenticated + owner check
- **UPDATE**: Само owner
- **DELETE**: Само owner

### RSVPs таблица:
- **SELECT**: Само event owner
- **INSERT**: Всички (public)
- **UPDATE**: Само event owner
- **DELETE**: Само event owner

## 🌟 Демо функции

### "Създай примерни събития"
Създава 3 тестови събития с различни дати и капацитет.

### "Генерирай примерни RSVP"
Генерира до 10 произволни RSVPs със смесени статуси, като спазва капацитета.

## 📝 Database Schema

### events таблица:
- `id` (uuid, primary key)
- `title` (text)
- `description` (text, nullable)
- `date` (timestamptz)
- `location` (text)
- `capacity` (integer)
- `created_by` (uuid, foreign key към auth.users)
- `created_at` (timestamptz)

### rsvps таблица:
- `id` (uuid, primary key)
- `event_id` (uuid, foreign key към events)
- `name` (text)
- `email` (text)
- `status` (text: 'attending' | 'maybe' | 'declined')
- `guests` (integer)
- `dietary_restrictions` (text, nullable)
- `created_at` (timestamptz)

### event_capacity view:
- `event_id`
- `capacity`
- `attending_count`
- `remaining`

## 🐛 Troubleshooting

### Build грешки:
```bash
# Изчистете node_modules и reinstall
rm -rf node_modules package-lock.json
npm install
```

### Supabase connection грешки:
- Проверете `.env` файла
- Уверете се че API keys са правилни
- Проверете Supabase project status

### RLS грешки:
- Проверете дали migrations са приложени
- Проверете Supabase logs
- Тествайте policies чрез SQL editor

## 📄 Лиценз

MIT

## 👥 Контрибуции

Приемаме pull requests! За големи промени, моля първо отворете issue за дискусия.

## 📞 Поддръжка

За въпроси и проблеми:
- Отворете issue в GitHub
- Проверете DEPLOYMENT.md за deployment проблеми
- Проверете TESTING_RESULTS.md за expected behavior

---

Изградено с ❤️ използвайки React, TypeScript и Supabase
