# Bubble Memory — Telegram Mini App

Трекер памяти по заданиям ЕГЭ Информатика. Реализовано по ТЗ v3 (см. `docs/ТЗ.md`).

## Структура (Feature-Sliced Design)

```
src/
  app/        — Next.js App Router: layout, страница, глобальные стили
  widgets/    — крупные блоки экрана (панель бablов, недельный пузырь, история роста)
  entities/   — бизнес-логика и модели (task-memory: ReviewAlgorithm, цвет памяти; user: тиры)
  shared/     — конфиг (пороги/лестница/тиры), UI-примитивы (Bubble), утилиты
  features/   — точки роста под конкретные пользовательские действия (review-task — заглушка)
prisma/
  schema.prisma — все сущности из ТЗ: User, TaskType, TaskMemory, ReviewLog,
                  WeeklyBubble, MonthlyBubble, YearBubble
```

Сделан только первый экран на моках (`getMockTaskBubbles`) — реальная запись
в БД, API route'ы, валидация Telegram `initData`, бот и cron из ТЗ **ещё не
реализованы**, это следующий шаг.

## Что нужно настроить руками

### 1. Node.js и зависимости

Версии зафиксированы в ТЗ: Node.js v22.22.2, npm 10.9.7.

```bash
node -v   # должно быть v22.22.2 (или используйте nvm/fnm для переключения)
npm -v    # 10.9.7

cd bubble-memory
npm install
```

### 2. Переменные окружения

```bash
cp .env.example .env
```

Заполните:
- `DATABASE_URL` — строка подключения к PostgreSQL (хостинг в РФ, см. ТЗ).
- `TELEGRAM_BOT_TOKEN` — токен бота из @BotFather.
- `REDIS_URL` — если будете поднимать BullMQ для cron/уведомлений.

### 3. Локальный запуск

```bash
npm run dev
# http://localhost:3000
```

Первый экран откроется и без БД — он на моках.

### 4. Prisma / база данных

Когда поднимете PostgreSQL (в РФ) и впишете `DATABASE_URL`:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Git

```bash
cd bubble-memory
git init
git add .
git commit -m "feat: initial FSD skeleton + first screen (Bubble Memory v3)"

# создайте пустой репозиторий на GitHub/GitLab заранее, затем:
git branch -M main
git remote add origin git@github.com:<ваш-аккаунт>/bubble-memory.git
git push -u origin main
```

### 6. Vercel

Вариант через CLI:

```bash
npm i -g vercel
vercel login
cd bubble-memory
vercel            # первый деплой, привяжет проект
vercel env add DATABASE_URL
vercel env add TELEGRAM_BOT_TOKEN
vercel env add REDIS_URL       # если используется
vercel --prod
```

Или через сайт vercel.com: Import Git Repository → выбрать репозиторий →
Framework Preset определится как Next.js автоматически → добавить те же
переменные окружения в Project Settings → Environment Variables → Deploy.

**Важно:** т.к. по ТЗ хостинг БД — в РФ, а Vercel — нет, `DATABASE_URL`
должен указывать на внешний (РФ) PostgreSQL, доступный из интернета
(с ограничением по IP/паролю). Сам фронтенд/API на Vercel может быть где
угодно — требование ТЗ касалось хранения персональных данных, то есть БД.
Если это принципиально, альтернатива — не использовать Vercel для прода,
а держать всё вместе на РФ-хостинге (см. пункт ниже).

### 7. Telegram-бот

- Создайте бота через @BotFather, получите токен → `TELEGRAM_BOT_TOKEN`.
- Настройте Menu Button / Web App URL на адрес вашего деплоя (Vercel URL или домен).
- Бот-фреймворк (grammY/Telegraf), валидация `initData`, cron на BullMQ+Redis
  и рассылка уведомлений — по плану из ТЗ, в этом скелете ещё не реализованы.

## Дальнейшие шаги (не входят в этот срез)

- API route'ы для `POST /api/review` (клик по баблу → ReviewAlgorithm → запись в БД,
  антиспам "раз в день" через `ReviewLog`).
- Валидация Telegram `initData` (HMAC-SHA256).
- Экран рейтинга/профиля.
- Cron-перенос недели/месяца/года.
- Экран согласия на обработку персональных данных (последним, перед публичным запуском).
