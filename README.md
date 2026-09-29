# Comfy Floor Map

Неофіційний особистий тренажер для менеджера-консультанта **Comfy**: карта залу, каталог, цінові полиці, хіти, порівняння і навчання по черзі.

> Це не офіційний продукт Comfy і не заміна Digital Assistant.

Повне ТЗ: [TZ.md](./TZ.md)

## Що вміє

- Карта всього залу (департаменти → секції)
- **Каталог** з фільтрами: секція / полиця / бренд / хіти / пошук
- У кожній секції: бюджет / середній / преміум + тренажер
- Порівняння 2–3 моделей, сценарії «Клиент сказав…», повторення слабких
- Темна тема в тонах Comfy

## Запуск локально

```bash
npm install
npm run dev
```

Відкрий http://127.0.0.1:43127

## GitHub Pages (сайт будь-де)

Додаток збирається в статику (`out/`) і деплоїться Actions-ом.

### 1) Створи репо на GitHub

Наприклад назва: `comfy-scan` (або `comfy-floor-map`).

### 2) Запуш код з WSL

```bash
cd ~/comfy-scan
git pull

# додай GitHub remote (підстав свій нік і назву репо)
git remote add github https://github.com/ТВІЙ_НІК/comfy-scan.git
# якщо remote вже є:
# git remote set-url github https://github.com/ТВІЙ_НІК/comfy-scan.git

git push -u github main
```

Якщо GitHub просить логін — краще Personal Access Token або `gh auth login` у WSL.

### 3) Увімкни Pages

1. GitHub → твоє репо → **Settings → Pages**
2. **Source**: GitHub Actions
3. Дочекайся зеленого workflow **Deploy GitHub Pages**

Сайт буде тут:

`https://ТВІЙ_НІК.github.io/comfy-scan/`

(останній сегмент = назва репо)

### Локальна перевірка статичної збірки

```bash
npm run build:pages
npm run preview:static
```

## Каталог і парсер

```bash
npm run seed:catalog
npm run parse:comfy   # з домашнього WSL; Cloudflare часто ріже хмарні IP
```

## Структура

- `src/content` — секції, seed/live каталог, тренажер
- `src/app` — сторінки
- `.github/workflows/deploy-pages.yml` — деплой на GitHub Pages
- `scripts/` — seed і парсер
