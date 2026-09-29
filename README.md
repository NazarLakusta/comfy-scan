# Comfy Floor Map

Неофіційна **школа менеджера-консультанта Comfy**: навчання з нуля, серйозні іспити, порівняння, каталог і карта офіційних категорій сайту.

> Не офіційний продукт Comfy і не заміна Digital Assistant.

**Живий сайт:** https://nazarlakusta.github.io/comfy-scan/

## Що вміє

- **Навчання** `/learn` — глибокі теми (процесор, ОЗП, Герци, IPS/VA/OLED, інвертор, ANC, мікрофони…)
- **Іспити** `/exam/[секція]` — складність 1–3, прохідний орієнтир 80%
- **Порівняння**, сценарії клієнта, шпаргалка-тренажер
- **Каталог** навчальних хітів + **Comfy карта** 700+ офіційних категорій сайту
- Темна тема в тонах Comfy

## Запуск локально

```bash
npm install
npm run dev
```

http://127.0.0.1:43127

```bash
npm run seed:knowledge   # банк знань + іспити
npm run seed:catalog     # навчальні товари
npm run parse:comfy      # live з comfy.ua (краще з домашнього WSL)
```

## GitHub Pages (якщо бачиш README замість додатку)

У Settings → Pages у тебе зараз **Source: Deploy from a branch** і **Branch: main /(root)**.  
Папка `/(root)` — це сирий репозиторій (README), а не зібраний сайт.

### Варіант A — найпростіший (залишаєш «Deploy from a branch»)

1. Settings → Pages → **Branch**
2. Залиш `main`, але папку зміни з **`/(root)`** на **`/docs`**
3. Save
4. Зачекай 1–2 хв, онови сторінку з Ctrl+Shift+R

У репо вже лежить зібраний сайт у папці `docs/` (з `index.html`).

### Варіант B — GitHub Actions (краще надовго)

1. Settings → Pages → **Source** → вибери **GitHub Actions** (не «Deploy from a branch»)
2. Actions → **Deploy GitHub Pages** → Run workflow (або зроби `git push`)
3. Дочекайся зеленої галочки

## Оновити статику в `docs/` після змін

```bash
npm run build:pages
rm -rf docs && mkdir docs && cp -a out/. docs/ && touch docs/.nojekyll
git add docs && git commit -m "chore: refresh GitHub Pages docs/" && git push
```

## Чесно про «всі товари Comfy»

- Дерево категорій сайту — так (публічний API категорій).
- Повні live-SKU з хмари часто ріже Cloudflare; парсер розрахований на запуск у тебе в WSL.
- Навчальний каталог + знання покривають залу для стажера з нуля навіть без live-парсу.
