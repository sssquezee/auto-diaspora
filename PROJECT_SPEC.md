# Auto Diaspora — Технічна специфікація проєкту

> **Маркетплейс перевірених авто з Європи для української та російськомовної діаспори.**
>
> Дизайн: монохромний (чорно-білий) + кобальтовий акцент. Щільна сітка в стилі AUTO.RIA, типографський brutalist-підхід.
>
> **Термін розробки MVP:** 7 днів (реалістично 10-14).

---

## 1. Загальна інформація

| Параметр | Значення |
|---|---|
| **Назва** | Auto Diaspora |
| **Логотип** | AUTO**DIASPORA** (з акцентним блоком на «DIASPORA») |
| **Домени** | autodiaspora.com (основний), autodiaspora.eu (резерв) |
| **Аудиторія** | Українці та російськомовні в ЄС |
| **Географія** | Вся Європа (фокус: DE, PL, NL, CZ, BE, FR) |
| **Мови** | UK, RU, EN |
| **Модель** | Безкоштовна подача 1-3 оголошень + платні апгрейди |
| **Юр. особа** | eenmanszaak (NL, KVK) |
| **Формат** | Веб-сайт (desktop + mobile responsive) |

---

## 2. Дизайн-система

### Філософія

**Brutalist editorial** — щільність, чорно-білий контраст, грубі границі, типографський акцент. Натхнення: AUTO.RIA, газети, аукціонні каталоги. Без скруглень, без soft shadows, без градієнтів-на-білому. Кожен елемент має чіткі границі і своє місце.

### Палітра

```css
:root {
  /* Monochrome base */
  --bg: #f5f5f5;
  --bg-card: #ffffff;
  --bg-elevated: #ffffff;
  --bg-subtle: #ededed;
  --bg-dark: #0a0a0a;

  --ink: #0a0a0a;
  --ink-2: #1a1a1a;
  --ink-muted: #555555;
  --ink-faded: #888888;
  --ink-subtle: #bbbbbb;

  --line: #e2e2e2;
  --line-strong: #c8c8c8;

  /* SIGNATURE ACCENT — Cobalt */
  --accent: #0052ff;
  --accent-2: #0042cc;
  --accent-soft: #e6efff;
}
```

**Правило:** акцент використовується тільки для:
- CTA-кнопки (Шукати, Застосувати)
- Ціни в логотипі-блоку DIASPORA
- Підкреслення активного пункту меню
- Бейджі «TOP», «NEW», «URGENT»
- Тіні preview-карток (drop shadow)
- Hover-стани

**Заборонено:** градієнти, синій фон сторінки, синій текст у тілі контенту.

### Радіуси

**Без border-radius на більшості елементів.** Жорсткі прямокутні форми — це і є brutalist editorial. Виняток: округлі іконки повідомлень, статусні точки.

### Типографіка

**Display + UI:** **Archivo** (Google Fonts) — щільний гротеск з виразним 900 вагою для заголовків. Використання:
- Logo: 900 weight, uppercase, letter-spacing -1.5px
- H1 (Hero): 900 weight, 44px, uppercase, letter-spacing -1.8px
- Titles в картках: 700 weight, uppercase
- Body: 400-600 weight

**Mono (числа, метрики):** **IBM Plex Mono** — для всього технічного:
- Ціни (`€38,900`)
- Підзаголовки карток (`2020 · 87 000 км · 3.0 TDI`)
- Лічильники, час публікації
- Локації, коди країн
- Бейджі

**Контраст:** жирний Archivo + інженерний IBM Plex Mono = brutalist editorial. Відрізняє від конкурентів, що юзають Inter/Roboto/Open Sans.

### Логотип

```html
<a class="logo" href="#">
  <span class="logo-text">AUTO<span class="accent-block">DIASPORA</span></span>
</a>
```

```css
.logo-text {
  font-family: 'Archivo', sans-serif;
  font-weight: 900;
  font-size: 26px;
  letter-spacing: -1.5px;
  text-transform: uppercase;
}
.logo-text .accent-block {
  background: var(--accent);
  color: #fff;
  padding: 2px 6px 1px;
  margin-left: 2px;
}
```

### Картки оголошень

**Жорсткі границі 1.5px чорні**, без скруглень.

**Hover-ефект (фірмова деталь):**
```css
.card:hover {
  transform: translate(-3px, -3px);
  box-shadow: 6px 6px 0 var(--accent);
}
```

Картка зсувається вліво-вгору, з'являється груба синя тінь зі зміщенням. Цей ефект — підпис бренду.

**Premium-картки:** мають вже існуючу зміщену тінь `3px 3px 0 var(--accent)`, при hover вона збільшується. Вверху-справа стрічка `PREMIUM` у акценті.

### Кнопки

Тільки два типи, обидва прямокутні без скруглень:

**Primary (CTA):** акцентний фон, білий текст, uppercase, letter-spacing 1px
**Secondary (action):** чорна обводка 2px, білий фон, чорний текст, при hover інверсія (чорний фон, білий текст)

### Бейджі

Прямокутні, моноширинний шрифт, uppercase:
- `★ TOP` — акцентний фон
- `NEW` — чорний фон, акцентний текст
- `URGENT` — біла обводка з акцентного контуру
- `✓ Verified` — білий фон, чорний текст

### Деталі brutalist editorial

- Hero-блок з **діагональними полосами** на половині (repeating-linear-gradient, прозорість 2.5%)
- Великий **акцентний круг 300×300px** в правому верхньому куті hero, прозорість 18%
- **Пунктирний роздільник** між ціною та характеристиками в картках
- Лічильники результатів: `6,842` у акцентному блоці з білим текстом, як стікер
- Заголовки секцій: `текст` + жирне підкреслення з offset 3px
- Footer: чорний з акцентними hover на лінках

---

## 3. Технологічний стек

### Frontend
- **Next.js 14** (App Router, Server Components)
- **TypeScript**
- **Tailwind CSS** з кастомним конфігом палітри
- **Archivo, IBM Plex Mono** — через `next/font/google`
- **next-intl** — UK/RU/EN
- **react-hook-form + zod** — форми
- **shadcn/ui** — як база, перевизначити стилі під brutalist (зняти скруглення)

### Backend / БД
- **Supabase** (Postgres, Auth, Storage, Realtime, RLS)

### Сервіси
- **Mollie** — оплата (iDEAL, картки, Bancontact)
- **Telegram Bot API** — сповіщення
- **Resend** — транзакційний email
- **Vercel** — хостинг
- **Sentry** — моніторинг

---

## 4. Структура БД (Supabase Postgres)

### Таблиця `profiles`

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  username text unique,
  full_name text,
  phone text,
  telegram_id bigint unique,
  telegram_username text,
  avatar_url text,
  country text,
  city text,
  language text default 'uk',
  is_verified boolean default false,
  is_dealer boolean default false,
  free_listings_used int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Таблиця `listings`

```sql
create table public.listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,

  -- Базова
  title text not null,
  description text,

  -- Технічні
  brand text not null,
  model text not null,
  year int not null,
  mileage int not null,
  fuel_type text not null,
  transmission text not null,
  body_type text,
  drive_type text,
  engine_volume numeric(3,1),
  power_hp int,
  color text,
  vin text,

  -- Локація
  country text not null,
  city text not null,

  -- Ціна
  price numeric(10,2) not null,
  currency text default 'EUR',
  price_negotiable boolean default false,

  -- Стан
  condition text default 'used',
  damaged_description text,
  customs_cleared boolean default false,

  -- Контакти
  contact_name text,
  contact_phone text,

  -- Статус
  status text default 'active',
  is_premium boolean default false,
  premium_until timestamptz,
  is_top boolean default false,
  top_until timestamptz,
  is_urgent boolean default false,
  is_verified boolean default false,

  -- Метрики
  views_count int default 0,
  favorites_count int default 0,

  -- Дати
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '60 days'),
  bumped_at timestamptz default now()
);

create index idx_listings_status on listings(status);
create index idx_listings_brand_model on listings(brand, model);
create index idx_listings_price on listings(price);
create index idx_listings_country on listings(country);
create index idx_listings_premium on listings(is_premium, premium_until);
create index idx_listings_bumped on listings(bumped_at desc);
```

### Інші таблиці

- **`listing_photos`** — фото з порядком, головне фото
- **`favorites`** — обране (user_id + listing_id)
- **`chats`** + **`messages`** — Realtime чат
- **`saved_searches`** — збережені пошуки з фільтрами в jsonb
- **`payments`** — Mollie платежі (pending, paid, failed)
- **`reports`** — скарги

### RLS Policies

```sql
create policy "Active listings are viewable by everyone"
  on listings for select using (status = 'active');

create policy "Users can insert own listings"
  on listings for insert with check (auth.uid() = user_id);

create policy "Users can update own listings"
  on listings for update using (auth.uid() = user_id);

-- Аналогічно для photos, chats, messages, favorites, saved_searches
```

---

## 5. Структура сторінок

```
app/
├── [locale]/                          # uk, ru, en
│   ├── page.tsx                       # Головна (каталог + hero)
│   ├── search/page.tsx                # Розширений пошук
│   ├── listing/[id]/page.tsx          # Картка авто
│   ├── new/page.tsx                   # Подати оголошення
│   ├── new/payment/page.tsx           # Оплата
│   ├── account/
│   │   ├── page.tsx
│   │   ├── listings/page.tsx
│   │   ├── favorites/page.tsx
│   │   ├── messages/page.tsx
│   │   ├── messages/[chatId]/page.tsx
│   │   ├── searches/page.tsx
│   │   └── settings/page.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── callback/route.ts
│   ├── (static)/
│   │   ├── about/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── how-it-works/page.tsx
│   └── admin/
│       ├── page.tsx
│       ├── listings/page.tsx
│       └── reports/page.tsx
├── api/
│   ├── mollie/
│   │   ├── create/route.ts
│   │   └── webhook/route.ts
│   ├── telegram/
│   │   ├── webhook/route.ts
│   │   └── notify/route.ts
│   ├── upload/route.ts
│   └── cron/
│       ├── expire-listings/route.ts
│       ├── notify-searches/route.ts
│       └── expire-premium/route.ts
└── layout.tsx
```

---

## 6. Функціональні модулі

### 6.1 Авторизація
- Email + пароль, Google OAuth
- Підтвердження email, скидання пароля
- При першому вході — заповнення профілю

### 6.2 Каталог і пошук

**Sidebar-фільтри:** марка → модель, рік, ціна, пробіг, країна, тип палива, КПП, тип кузова, привід, об'єм двигуна, верифіковані, розмитнені.

**Сортування:** преміум перші → нові → ціна → пробіг.

**Текстовий пошук:** Postgres full-text по `title + description + brand + model`.

**Пагінація:** 24 на сторінку, URL-based.

### 6.3 Подача оголошення

Multi-step форма:
1. Основна (марка, модель, рік, пробіг)
2. Технічні (паливо, КПП, кузов, привід)
3. Локація + стан
4. Ціна + опис
5. Фото (до 15 шт, ресайз клієнтом)
6. Преміум-апгрейди (опц.)

### 6.4 Картка авто
- Галерея фото (Embla Carousel)
- Технічні характеристики (таблиця)
- Інфо про продавця
- Кнопки: написати, показати телефон, обране, скарга
- Лічильник переглядів
- Схожі оголошення

### 6.5 Особистий кабінет
- Мої оголошення (фільтр за статусом)
- Обране
- Чати (Supabase Realtime)
- Збережені пошуки
- Налаштування + прив'язка Telegram

### 6.6 Платежі (Mollie)

| Послуга | Ціна |
|---|---|
| Bump (підняття) | €4.99 |
| Premium 14 днів | €9.99 |
| Premium 30 днів | €19.99 |
| Додаткове оголошення | €2.99 |
| Verified seller | €15.00 |

**Потік:** вибір → `/api/mollie/create` → редірект на Mollie → webhook → активація послуги.

### 6.7 Telegram-бот @AutoDiasporaBot

Окремий сервіс на Railway (Node.js + grammY).

**Команди:** `/start`, `/link <code>`, `/searches`, `/listings`, `/help`, `/unsubscribe`

**Сповіщення:**
1. Нове повідомлення в чаті (миттєво)
2. Нове оголошення по збереженому пошуку (кожні 30 хв)
3. Зміна ціни в обраному (миттєво)
4. Закінчення преміуму (за 24 год)

### 6.8 Модерація

**Автоматична:** стоп-слова, дублі фото (phash), ліміти.

**Ручна:** адмін-панель з модерацією, скаргами, банами.

### 6.9 Мультимовність

`next-intl` з UK/RU/EN, URL-based (`/uk/listing/123`), hreflang SEO.

---

## 7. План розробки по днях

### День 1: Фундамент
- [ ] `npx create-next-app@latest auto-diaspora --typescript --tailwind --app`
- [ ] Supabase: проект, схема БД, RLS, auth
- [ ] Підключити Archivo + IBM Plex Mono через `next/font/google`
- [ ] Налаштувати Tailwind config з monochrome + cobalt палітрою
- [ ] `next-intl` для UK/RU/EN
- [ ] Базовий layout (Header з мегапошуком, Footer)
- [ ] Деплой на Vercel

### День 2: Каталог + картка
- [ ] Головна з sidebar-фільтрами + grid 3-в-ряд
- [ ] Компонент `<ListingCard>` з brutalist hover-ефектом
- [ ] Сторінка `/listing/[id]`
- [ ] Галерея фото (Embla)
- [ ] Довідник брендів/моделей

### День 3: Подача оголошення
- [ ] Multi-step форма
- [ ] Завантаження фото в Supabase Storage
- [ ] Resize клієнтом (`browser-image-compression`)
- [ ] Валідація лімітів (3 безкоштовні)

### День 4: Особистий кабінет
- [ ] `/account/listings`, `/account/favorites`
- [ ] Чат через Supabase Realtime
- [ ] Збережені пошуки

### День 5: Платежі (Mollie)
- [ ] Реєстрація в Mollie, test key
- [ ] `/api/mollie/create`, `/api/mollie/webhook`
- [ ] UI вибору тарифу
- [ ] Активація послуг після оплати

### День 6: Telegram-бот
- [ ] @AutoDiasporaBot через @BotFather
- [ ] Окремий сервіс на Railway + grammY
- [ ] Прив'язка через 6-значний код
- [ ] Сповіщення про нові повідомлення та оголошення
- [ ] Cron для saved searches

### День 7: Полірування + запуск
- [ ] Адмін-панель
- [ ] Скарги, кнопка «Поскаржитись»
- [ ] Юридичні сторінки (через iubenda)
- [ ] SEO: sitemap, robots, OG, hreflang
- [ ] Sentry, Plausible
- [ ] 30+ тестових оголошень
- [ ] Production-деплой

---

## 8. Змінні середовища

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Mollie
MOLLIE_API_KEY=test_xxxx

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
TELEGRAM_BOT_USERNAME=AutoDiasporaBot

# Email
RESEND_API_KEY=
EMAIL_FROM=noreply@autodiaspora.com

# Cron
CRON_SECRET=random_string

# Site
NEXT_PUBLIC_SITE_URL=https://autodiaspora.com
NEXT_PUBLIC_SITE_NAME="Auto Diaspora"
```

---

## 9. Юридичні аспекти

- **Terms of Service** — через iubenda (€27/рік)
- **Privacy Policy** — GDPR-compliant
- **Cookie Policy** + банер
- **Impressum (NL):** KVK номер, контакти
- **Disclaimer:** платформа не несе відповідальності за угоди

---

## 10. Що відкладено на post-MVP

- VIN-перевірка через API
- Верифікація продавців (паспорт + селфі)
- Мобільні додатки
- Рейтинги та відгуки
- Багатовалютність з конвертацією
- Інтеграція з доставкою в Україну
- Аналітика для дилерів
- API для імпорту дилерських стоків
- Escrow (потребує фін. ліцензії)
- AI-оцінка вартості

---

## 11. Ключові ризики

| Ризик | Ймовірність | Мітигація |
|---|---|---|
| Спам-оголошення | Висока | Капча, ліміти, ручна модерація 24/7 |
| Шахраї | Висока | Verified-бейдж, скарги |
| Slow growth | Висока | Активне залучення продавців |
| Перегин по часу | **Висока** | Буфер 7 днів, відсікати фічі |

---

## 12. Метрики успіху (перший місяць)

| Метрика | Ціль | Критично |
|---|---|---|
| Реєстрації | 800-1500 | >500 |
| Оголошення | 300-500 | >150 |
| Унікальні відвідувачі/добу | 500-1500 | >200 |
| Виручка | €200-500 | >€50 |
| Платних послуг | 30-80 | >15 |
| TG-бот підписки | 200-400 | >100 |
| LCP | <2.5s | <4s |

---

## 13. Корисні ресурси

- [Supabase Docs](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Mollie API](https://docs.mollie.com)
- [grammY](https://grammy.dev)
- [shadcn/ui](https://ui.shadcn.com) (зняти скруглення)
- [Lucide icons](https://lucide.dev)
- [Archivo](https://fonts.google.com/specimen/Archivo)
- [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono)
- [Car brands/models data](https://github.com/abhionlyone/us-car-models-data)

---

## 14. Чек-лист на день перед стартом

- [ ] Купити домен `autodiaspora.com`
- [ ] Перевірити торгову марку на euipo.europa.eu
- [ ] Створити email `noreply@autodiaspora.com`
- [ ] Зареєструвати @AutoDiasporaBot у @BotFather
- [ ] Створити проект у Supabase
- [ ] Створити аккаунт у Mollie (test mode)
- [ ] Створити аккаунт у Vercel
- [ ] Створити аккаунт у Railway
- [ ] Створити GitHub repo `auto-diaspora`
- [ ] Зберегти `PROJECT_SPEC.md` в корені repo
- [ ] Зберегти `auto-diaspora-mono.html` як референс дизайну (показати Claude під час кодинга)

---

## 15. Tailwind config (готовий шматок)

```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#f5f5f5', card: '#ffffff', subtle: '#ededed', dark: '#0a0a0a' },
        ink: { DEFAULT: '#0a0a0a', 2: '#1a1a1a', muted: '#555555', faded: '#888888', subtle: '#bbbbbb' },
        line: { DEFAULT: '#e2e2e2', strong: '#c8c8c8' },
        accent: { DEFAULT: '#0052ff', 2: '#0042cc', soft: '#e6efff' },
      },
      fontFamily: {
        sans: ['var(--font-archivo)', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
      borderRadius: {
        none: '0',
      },
    },
  },
}
export default config
```

---

**Версія:** 4.0 (фінальна — Monochrome + Cobalt, brutalist editorial)
**Дата:** травень 2026
**Автор:** Sasha + Claude
