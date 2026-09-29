#!/usr/bin/env node
/**
 * Seeds a large educational store catalog for Comfy Floor Map.
 * Run: node scripts/seed-catalog.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "data", "catalog");
fs.mkdirSync(outDir, { recursive: true });

/** @typedef {{ id: string, sectionId: string, bandId: 'budget'|'mid'|'premium', brand: string, name: string, price: number, tags: string[], forWhom: string, pros: string[], con: string, upsell: string[], pitch: string, specs: Record<string,string>, isHit: boolean, relatedIds: string[], sourceUrl?: string }} CatProduct */

const catalogs = {
  smartphones: {
    bands: { budget: [4500, 11999], mid: [12000, 24999], premium: [25000, 69999] },
    keys: ["display", "memory", "camera", "battery", "chip"],
    items: [
      ["Xiaomi", "Redmi 13C", "budget", 5999, ["для мами", "перший"], "Базовий щодень", { display: "6.74\" HD+", memory: "128/4", camera: "50 Мп", battery: "5000", chip: "Helio G85" }],
      ["Samsung", "Galaxy A16", "budget", 8999, ["samsung", "для мами"], "Звичний Samsung", { display: "6.7\" AMOLED", memory: "128/4", camera: "50 Мп", battery: "5000", chip: "Helio G99" }],
      ["Motorola", "Moto G24", "budget", 7499, ["чистий android"], "Простий Android", { display: "6.56\"", memory: "128/8", camera: "50 Мп", battery: "5000", chip: "Helio G85" }],
      ["Nokia", "G22", "budget", 6999, ["надійний"], "Запасний / батькам", { display: "6.5\"", memory: "128/4", camera: "50 Мп", battery: "5050", chip: "Unisoc" }],
      ["Xiaomi", "Redmi Note 13", "mid", 12999, ["ціна/якість", "екран"], "Максимум за гроші", { display: "AMOLED 120Гц", memory: "256/8", camera: "108 Мп", battery: "5000", chip: "Snap 685" }],
      ["Samsung", "Galaxy A35", "mid", 16999, ["камера", "щодня"], "Універсал на 2–3 роки", { display: "AMOLED 120Гц", memory: "256/8", camera: "50 Мп OIS", battery: "5000", chip: "Exynos 1380" }],
      ["Samsung", "Galaxy A55", "mid", 19999, ["samsung", "флагман mid"], "Сильний середній", { display: "AMOLED 120Гц", memory: "256/8", camera: "50 Мп", battery: "5000", chip: "Exynos 1480" }],
      ["POCO", "X6 Pro", "mid", 15999, ["ігри", "потужність"], "Ігри без переплати", { display: "120Гц", memory: "256/8", camera: "64 Мп", battery: "5000", chip: "Dimensity 8300" }],
      ["Google", "Pixel 8a", "mid", 21999, ["камера", "фото"], "Фото з розумним софтом", { display: "OLED 120Гц", memory: "128/8", camera: "64 Мп AI", battery: "4492", chip: "Tensor G3" }],
      ["Nothing", "Phone (2a)", "mid", 17999, ["дизайн"], "Унікальний вигляд", { display: "AMOLED 120Гц", memory: "256/8", camera: "50 Мп", battery: "5000", chip: "Dimensity 7200" }],
      ["Apple", "iPhone 16", "premium", 42999, ["apple", "екосистема"], "Екосистема Apple", { display: "6.1\" OLED", memory: "128", camera: "48 Мп", battery: "День+", chip: "A18" }],
      ["Apple", "iPhone 16 Pro", "premium", 54999, ["apple", "pro"], "Топова камера Apple", { display: "6.3\" ProMotion", memory: "256", camera: "48 Мп Pro", battery: "Сильна", chip: "A18 Pro" }],
      ["Samsung", "Galaxy S24", "premium", 34999, ["флагман", "екран"], "Преміум Android", { display: "Dynamic AMOLED 120", memory: "256/8", camera: "50 Мп", battery: "4000+", chip: "Snap 8 Gen 3" }],
      ["Samsung", "Galaxy S24 Ultra", "premium", 52999, ["s-pen", "камера"], "Максимум Samsung", { display: "QHD+ 120", memory: "256/12", camera: "200 Мп", battery: "5000", chip: "Snap 8 Gen 3" }],
      ["Xiaomi", "14T Pro", "premium", 27999, ["зарядка", "камера"], "Потужний Xiaomi", { display: "AMOLED 144Гц", memory: "512/12", camera: "Leica 50", battery: "5000", chip: "Dimensity 9300+" }],
    ],
  },
  laptops: {
    bands: { budget: [12999, 19999], mid: [20000, 39999], premium: [40000, 99999] },
    keys: ["cpu", "ram", "ssd", "display", "battery", "weight"],
    items: [
      ["Lenovo", "IdeaPad 3 15", "budget", 16999, ["універ", "excel"], "Навчання і Zoom", { cpu: "Intel i3 / Ryzen 3", ram: "8 ГБ", ssd: "256–512", display: "15.6 FHD", battery: "5–7 год", weight: "1.8 кг" }],
      ["Acer", "Aspire 3", "budget", 15499, ["універ"], "Браузер і документи", { cpu: "Intel i3", ram: "8 ГБ", ssd: "512", display: "15.6 FHD", battery: "5 год", weight: "1.9 кг" }],
      ["ASUS", "Vivobook 15", "budget", 18999, ["навчання"], "Комфортний офіс", { cpu: "Intel i5 U", ram: "8–16", ssd: "512", display: "15.6 FHD", battery: "6–8", weight: "1.7 кг" }],
      ["HP", "15s", "budget", 17499, ["офіс"], "Домашній офіс", { cpu: "Ryzen 5", ram: "8–16", ssd: "512", display: "15.6", battery: "6 год", weight: "1.75 кг" }],
      ["Lenovo", "IdeaPad Slim 5", "mid", 28999, ["16гб", "робота"], "Щодень без гальм", { cpu: "Ryzen 5/7", ram: "16 ГБ", ssd: "512", display: "14–16 IPS", battery: "8–10", weight: "1.5 кг" }],
      ["ASUS", "Zenbook 14", "mid", 34999, ["легкий", "в дорогу"], "Носити щодня", { cpu: "Intel Ultra / AMD", ram: "16", ssd: "512–1TB", display: "14 OLED/IPS", battery: "10–14", weight: "1.3 кг" }],
      ["HP", "Pavilion Plus", "mid", 31999, ["фото", "екран"], "Легкий креатив", { cpu: "Intel i5/i7", ram: "16", ssd: "512", display: "14 OLED", battery: "8–10", weight: "1.4 кг" }],
      ["Dell", "Inspiron 14", "mid", 27499, ["офіс"], "Стабільна робота", { cpu: "Intel i5", ram: "16", ssd: "512", display: "14 FHD", battery: "8 год", weight: "1.5 кг" }],
      ["ASUS", "TUF Gaming A15", "premium", 45999, ["ігри", "rtx"], "Ігри Full HD+", { cpu: "Ryzen 7 H", ram: "16–32", ssd: "512–1TB", display: "15.6 144Гц", battery: "коротша", weight: "2.2 кг" }],
      ["Lenovo", "LOQ 15", "premium", 42999, ["ігри"], "Ігровий вхід", { cpu: "Intel i5 H", ram: "16", ssd: "512", display: "15.6 144Гц", battery: "середня", weight: "2.4 кг" }],
      ["Apple", "MacBook Air 13 M3", "premium", 52999, ["apple", "тихо"], "Тиша і батарея", { cpu: "Apple M3", ram: "8–16", ssd: "256–512", display: "Liquid Retina", battery: "до 18 год", weight: "1.24 кг" }],
      ["Apple", "MacBook Pro 14", "premium", 79999, ["pro", "монтаж"], "Серйозний креатив", { cpu: "M3 Pro/Max", ram: "18+", ssd: "512+", display: "Liquid XDR", battery: "довга", weight: "1.6 кг" }],
      ["MSI", "Thin 15", "premium", 40999, ["ігри"], "Компактний ігровий", { cpu: "Intel i5/i7 H", ram: "16", ssd: "512", display: "144Гц", battery: "коротша", weight: "1.9 кг" }],
    ],
  },
  tvs: {
    bands: { budget: [7999, 14999], mid: [15000, 34999], premium: [35000, 120000] },
    keys: ["size", "panel", "hz", "smart", "hdmi"],
    items: [
      ["Hisense", "43A6K", "budget", 10999, ["кухня", "дача"], "Кухня / перший ТВ", { size: "43\"", panel: "LCD", hz: "60", smart: "VIDAA", hdmi: "3" }],
      ["Xiaomi", "A Pro 43", "budget", 11999, ["google tv"], "Smart на кухню", { size: "43\"", panel: "LCD", hz: "60", smart: "Google TV", hdmi: "3" }],
      ["TCL", "50V6B", "budget", 13999, ["4k"], "Невелика вітальня", { size: "50\"", panel: "VA", hz: "60", smart: "Google TV", hdmi: "3" }],
      ["Samsung", "CU7100 50", "mid", 18999, ["вітальня", "4k"], "Сімейна вітальня", { size: "50\"", panel: "LCD", hz: "60", smart: "Tizen", hdmi: "3" }],
      ["Samsung", "DU8000 55", "mid", 24999, ["спорт"], "Спорт і серіали", { size: "55\"", panel: "LCD", hz: "100/120", smart: "Tizen", hdmi: "3 eARC" }],
      ["LG", "UT80 55", "mid", 23999, ["webos"], "Стабільний Smart", { size: "55\"", panel: "LCD", hz: "60–120", smart: "webOS", hdmi: "3" }],
      ["Xiaomi", "S Mini LED 55", "mid", 27999, ["яскравий"], "Яскрава вітальня", { size: "55\"", panel: "MiniLED", hz: "144", smart: "Google TV", hdmi: "4" }],
      ["Hisense", "U7N 55", "mid", 29999, ["міні led"], "Кіно і спорт", { size: "55\"", panel: "MiniLED", hz: "144", smart: "VIDAA", hdmi: "4" }],
      ["Samsung", "Q60D 55", "premium", 35999, ["qled", "день"], "Світла кімната", { size: "55\"", panel: "QLED", hz: "60–120", smart: "Tizen", hdmi: "3" }],
      ["Samsung", "QN90D 65", "premium", 69999, ["neo qled"], "Преміум яскравість", { size: "65\"", panel: "Neo QLED", hz: "120", smart: "Tizen", hdmi: "4 HDMI2.1" }],
      ["LG", "C4 OLED 55", "premium", 54999, ["oled", "кино"], "Кіно ввечері", { size: "55\"", panel: "OLED", hz: "120", smart: "webOS", hdmi: "4 HDMI2.1" }],
      ["LG", "G4 OLED 65", "premium", 99999, ["gallery", "oled"], "Топовий OLED", { size: "65\"", panel: "OLED evo", hz: "144", smart: "webOS", hdmi: "4" }],
      ["Sony", "Bravia 7 55", "premium", 64999, ["sony", "кино"], "Кінематограф Sony", { size: "55\"", panel: "MiniLED", hz: "120", smart: "Google TV", hdmi: "4" }],
    ],
  },
  washers: {
    bands: { budget: [9999, 14999], mid: [15000, 27999], premium: [28000, 59999] },
    keys: ["load", "type", "rpm", "inverter", "programs"],
    items: [
      ["Indesit", "IWME 6", "budget", 11999, ["1-2 особи"], "Мала сім’я", { load: "6 кг", type: "Фронт", rpm: "1000", inverter: "Ні", programs: "Базові" }],
      ["Beko", "WUE6511", "budget", 12999, ["бюджет"], "Старт", { load: "6 кг", type: "Фронт", rpm: "1000", inverter: "Ні", programs: "Швидка" }],
      ["Saturn", "ST-WM061", "budget", 10999, ["дешево"], "Оренда / старт", { load: "5–6 кг", type: "Фронт", rpm: "1000", inverter: "Ні", programs: "Базові" }],
      ["LG", "F2J3NS0W", "mid", 18999, ["інвертор", "сімʼя"], "Сім’я 3 особи", { load: "7 кг", type: "Фронт", rpm: "1200", inverter: "Так", programs: "Steam / дитячі" }],
      ["Samsung", "WW70T", "mid", 19999, ["інвертор"], "Тихіше щодня", { load: "7 кг", type: "Фронт", rpm: "1200", inverter: "Так", programs: "Eco Bubble" }],
      ["Beko", "B3WFR", "mid", 16999, ["сімʼя"], "Сімейний середній", { load: "8 кг", type: "Фронт", rpm: "1200", inverter: "Так", programs: "SteamCure" }],
      ["Whirlpool", "FWG712", "mid", 17999, ["надійний"], "Регулярні прання", { load: "7 кг", type: "Фронт", rpm: "1200", inverter: "Так", programs: "6th Sense" }],
      ["LG", "F4V5VR", "premium", 28999, ["пар", "ai"], "Велика сім’я", { load: "9 кг", type: "Фронт", rpm: "1400", inverter: "Так", programs: "Steam + AI" }],
      ["Samsung", "WW90T", "premium", 31999, ["addwash"], "Зручність преміум", { load: "9 кг", type: "Фронт", rpm: "1400", inverter: "Так", programs: "AddWash / пар" }],
      ["Bosch", "WAN282", "premium", 34999, ["тихо", "bosch"], "Тиша і ресурс", { load: "8–9 кг", type: "Фронт", rpm: "1400", inverter: "Так", programs: "EcoSilence" }],
    ],
  },
  fridges: {
    bands: { budget: [8999, 15999], mid: [16000, 31999], premium: [32000, 89999] },
    keys: ["volume", "frost", "energy", "zones", "noise"],
    items: [
      ["Nord", "NR 403", "budget", 9999, ["оренда"], "1–2 особи", { volume: "180 л", frost: "Крапельна", energy: "A+", zones: "2", noise: "середній" }],
      ["Saturn", "ST-CF", "budget", 10999, ["компакт"], "Мала кухня", { volume: "150–200", frost: "Крапельна", energy: "A+", zones: "2", noise: "середній" }],
      ["Beko", "RDSA240", "budget", 13999, ["вузький"], "Вузька ніша", { volume: "223 л", frost: "LowFrost", energy: "A++", zones: "2", noise: "середній" }],
      ["Indesit", "DF 4180", "budget", 14999, ["сімʼя мала"], "Старт NoFrost-like", { volume: "300-", frost: "No Frost частк.", energy: "A+", zones: "2", noise: "середній" }],
      ["Samsung", "RB33", "mid", 22999, ["no frost", "сімʼя"], "Сім’я 3–4", { volume: "328 л", frost: "No Frost", energy: "A++", zones: "свіжість", noise: "тихіший" }],
      ["LG", "GA-B459", "mid", 24999, ["інвертор"], "Тихий сімейний", { volume: "341 л", frost: "No Frost", energy: "A++", zones: "DoorCooling", noise: "низький" }],
      ["Beko", "RCNA366", "mid", 19999, ["no frost"], "Оптимальний об’єм", { volume: "324 л", frost: "No Frost", energy: "A++", zones: "HarvestFresh", noise: "середній" }],
      ["Whirlpool", "W7X", "mid", 26999, ["зони"], "Зручні полиці", { volume: "350+", frost: "No Frost", energy: "A++", zones: "6th Sense", noise: "тихий" }],
      ["Samsung", "RB38A", "premium", 35999, ["spaceMax"], "Великий об’єм", { volume: "390 л", frost: "No Frost", energy: "A+++", zones: "багато", noise: "низький" }],
      ["LG", "GC-B459", "premium", 38999, ["instaview"], "Преміум зручність", { volume: "400+", frost: "No Frost", energy: "A+++", zones: "InstaView", noise: "дуже тихий" }],
      ["Bosch", "KGN39", "premium", 42999, ["vitaFresh"], "Зони свіжості", { volume: "368 л", frost: "No Frost", energy: "A+++", zones: "VitaFresh", noise: "низький" }],
    ],
  },
  acs: {
    bands: { budget: [11999, 17999], mid: [18000, 31999], premium: [32000, 79999] },
    keys: ["area", "inverter", "energy", "noise", "wifi"],
    items: [
      ["Olmo", "OSH-09AH", "budget", 13999, ["20м2"], "Невелика кімната", { area: "~20 м² / 09", inverter: "On/Off", energy: "A", noise: "середній", wifi: "Ні" }],
      ["Osaka", "STH-09", "budget", 14999, ["спальня"], "Бюджет у спальню", { area: "20 м²", inverter: "On/Off", energy: "A", noise: "середній", wifi: "Ні" }],
      ["Cooper&Hunter", "CH-S09", "budget", 16999, ["ch"], "Популярний 09", { area: "20–25", inverter: "інколи інвертор", energy: "A+", noise: "нижчий", wifi: "опція" }],
      ["Samsung", "AR09", "mid", 22999, ["інвертор"], "Дім тихіше", { area: "25 м² / 09-12", inverter: "Так", energy: "A++", noise: "низький", wifi: "опція" }],
      ["LG", "PC12SQ", "mid", 24999, ["dualcool"], "Спальня комфорт", { area: "35 м² / 12", inverter: "Так", energy: "A++", noise: "дуже низький", wifi: "ThinQ" }],
      ["Cooper&Hunter", "CH-S12FTXAM", "mid", 26999, ["wifi"], "Основна кімната", { area: "35 м²", inverter: "Так", energy: "A+++", noise: "низький", wifi: "Так" }],
      ["Daikin", "Sensira 35", "premium", 42999, ["тихо", "daikin"], "Преміум тиша", { area: "35 м²", inverter: "Так", energy: "A+++", noise: "мінімум", wifi: "опція" }],
      ["Mitsubishi", "MSZ-HR35", "premium", 39999, ["надійність"], "Довгий ресурс", { area: "35 м²", inverter: "Так", energy: "A++", noise: "низький", wifi: "опція" }],
      ["LG", "ARTCOOL 18", "premium", 45999, ["дизайн", "18"], "Велика кімната", { area: "50 м² / 18", inverter: "Так", energy: "A+++", noise: "низький", wifi: "Так" }],
    ],
  },
  microwaves: {
    bands: { budget: [1499, 2999], mid: [3000, 6999], premium: [7000, 15999] },
    keys: ["volume", "power", "mode", "controls"],
    items: [
      ["Saturn", "ST-MW7159", "budget", 1799, ["підігрів"], "Тільки гріти", { volume: "20 л", power: "700 Вт", mode: "Соло", controls: "Механіка" }],
      ["Liberton", "LMW 2050", "budget", 1999, ["розморозка"], "Старт", { volume: "20 л", power: "700", mode: "Соло", controls: "Механіка" }],
      ["Gorenje", "MO20A", "budget", 2499, ["надійний"], "Базовий бренд", { volume: "20 л", power: "800", mode: "Соло", controls: "Механіка" }],
      ["Samsung", "MS23K", "mid", 3999, ["гриль"], "Сім’я + гриль", { volume: "23 л", power: "800", mode: "Гриль", controls: "Електроніка" }],
      ["LG", "MS2042", "mid", 3799, ["програми"], "Зручні програми", { volume: "20–23", power: "800", mode: "Соло/гриль", controls: "Кнопки" }],
      ["Whirlpool", "MWP 253", "mid", 5499, ["grill"], "Гриль комфорт", { volume: "25 л", power: "900", mode: "Гриль", controls: "Електроніка" }],
      ["Samsung", "MC28H", "premium", 8999, ["конвекція"], "Міні-духовка", { volume: "28 л", power: "900", mode: "Конвекція", controls: "Сенсор" }],
      ["LG", "MJ3965", "premium", 10999, ["neo chef"], "Преміум конвекція", { volume: "39 л", power: "1100", mode: "Конвекція", controls: "Smart Inverter" }],
      ["Bosch", "FFL023", "premium", 7999, ["вбудова"], "Вбудований стиль", { volume: "20 л", power: "800", mode: "Соло", controls: "Електроніка" }],
    ],
  },
  vacuums: {
    bands: { budget: [1499, 3999], mid: [4000, 11999], premium: [12000, 39999] },
    keys: ["type", "suction", "bin", "attachments"],
    items: [
      ["Saturn", "ST-VC0262", "budget", 1999, ["класика"], "Базове прибирання", { type: "Класичний", suction: "дост.", bin: "Мішок", attachments: "підлога" }],
      ["Rowenta", "RO3122", "budget", 2999, ["килими"], "Килими вдома", { type: "Класичний", suction: "сильне", bin: "Мішок", attachments: "щілинна" }],
      ["Bosch", "BGLS2", "budget", 3499, ["надійний"], "Звична класика", { type: "Класичний", suction: "сильне", bin: "Мішок", attachments: "набір" }],
      ["Xiaomi", "G20 Lite", "mid", 4999, ["вертикаль"], "Швидко щодня", { type: "Вертикальний", suction: "середнє+", bin: "Контейнер", attachments: "меблі" }],
      ["Rowenta", "X-Pert 7.60", "mid", 7999, ["без дроту"], "Без розетки", { type: "Вертикальний", suction: "сильне", bin: "Контейнер", attachments: "повний" }],
      ["Philips", "XC3031", "mid", 8999, ["speedpro"], "Тверда підлога", { type: "Вертикальний", suction: "сильне", bin: "Контейнер", attachments: "360" }],
      ["Xiaomi", "Robot Vacuum S10", "premium", 12999, ["робот", "шерсть"], "Підтримка чистоти", { type: "Робот", suction: "4000Па", bin: "Контейнер", attachments: "карта" }],
      ["Roborock", "Q Revo", "premium", 24999, ["станція"], "Мало обслуговування", { type: "Робот+станція", suction: "високе", bin: "Станція", attachments: "мийка" }],
      ["Dyson", "V15 Detect", "premium", 29999, ["dyson"], "Преміум вертикаль", { type: "Вертикальний", suction: "топ", bin: "Контейнер", attachments: "laser" }],
    ],
  },
  "hair-dryers": {
    bands: { budget: [499, 1499], mid: [1500, 4999], premium: [5000, 24999] },
    keys: ["power", "speeds", "ions", "nozzles"],
    items: [
      ["Vitek", "VT-2267", "budget", 699, ["сушка"], "Просто висушити", { power: "2000 Вт", speeds: "2/3", ions: "Ні", nozzles: "Концентратор" }],
      ["Philips", "BHD274", "budget", 1299, ["базовий"], "На щодень", { power: "2100", speeds: "6 комбінацій", ions: "Так", nozzles: "Концентратор" }],
      ["Rowenta", "CV4110", "budget", 999, ["потужний"], "Швидка сушка", { power: "2100", speeds: "2", ions: "Ні", nozzles: "1" }],
      ["Philips", "BHD360", "mid", 2199, ["іонізація"], "Менше пушіння", { power: "2100", speeds: "6", ions: "Так", nozzles: "2" }],
      ["Remington", "AC9140", "mid", 2799, ["кераміка"], "Дбайливіше", { power: "2400", speeds: "3", ions: "Так", nozzles: "дифузор" }],
      ["BaByliss", "D572DE", "mid", 3499, ["салон mid"], "Швидко і рівно", { power: "2200", speeds: "2/3", ions: "Так", nozzles: "набір" }],
      ["Dyson", "Supersonic", "premium", 18999, ["салон", "тихо"], "Салон удома", { power: "висок. потік", speeds: "точний", ions: "Так", nozzles: "повний набір" }],
      ["BaByliss", "Pro Falco", "premium", 6999, ["pro"], "Салонний клас", { power: "2000+", speeds: "багато", ions: "Так", nozzles: "pro" }],
      ["Rowenta", "CV9920", "premium", 8999, ["kartridge"], "Преміум догляд", { power: "високий", speeds: "багато", ions: "Так", nozzles: "набір" }],
    ],
  },
  stylers: {
    bands: { budget: [499, 1499], mid: [1500, 4999], premium: [5000, 24999] },
    keys: ["plates", "temp", "ions", "attachments"],
    items: [
      ["Vitek", "VT-8403", "budget", 799, ["вирівняти"], "Рідко вирівняти", { plates: "Кераміка", temp: "фікс", ions: "Ні", attachments: "немає" }],
      ["Philips", "BHS375", "budget", 1199, ["кераміка"], "Базовий випрямляч", { plates: "ThermoProtect", temp: "мало режимів", ions: "Так", attachments: "немає" }],
      ["Rowenta", "SF1512", "budget", 999, ["подарунок"], "Швидкий подарунок", { plates: "Кераміка", temp: "фікс", ions: "Ні", attachments: "немає" }],
      ["Philips", "BHS510", "mid", 2499, ["температура"], "Регулярні укладки", { plates: "Titanium", temp: "регульована", ions: "Так", attachments: "немає" }],
      ["Remington", "S8500", "mid", 2199, ["pearl"], "Гладкість", { plates: "Pearl", temp: "150–230", ions: "Так", attachments: "немає" }],
      ["BaByliss", "ST393E", "mid", 2999, ["широкі"], "Довге волосся", { plates: "Ceramic", temp: "регульована", ions: "Так", attachments: "немає" }],
      ["Dyson", "Airwrap", "premium", 22999, ["мульти", "локони"], "Різні укладки", { plates: "насадки", temp: "розумний контроль", ions: "Так", attachments: "повний набір" }],
      ["BaByliss", "StylePro", "premium", 7999, ["насадки"], "Мультистайлер mid-pro", { plates: "різні", temp: "контроль", ions: "Так", attachments: "набір" }],
      ["Philips", "BHA710", "premium", 5999, ["air styler"], "Об’єм і локони", { plates: "air", temp: "контроль", ions: "Так", attachments: "кілька" }],
    ],
  },
};

// Extra lighter sections
const light = {
  tablets: [["Lenovo", "Tab M11", "budget", 7999], ["Samsung", "Galaxy Tab A9+", "mid", 12999], ["Apple", "iPad 10", "premium", 18999]],
  wearables: [["Xiaomi", "Redmi Watch 4", "budget", 1999], ["Amazfit", "Bip 5", "mid", 3499], ["Apple", "Watch SE", "premium", 11999]],
  "mobile-accessories": [["Comfy", "Чохол+скло mid", "mid", 599], ["Anker", "Powerbank 20k", "mid", 1499], ["Samsung", "25W зарядка", "premium", 1299]],
  desktops: [["Artline", "Office i5", "budget", 15999], ["Artline", "Gaming RTX4060", "mid", 34999], ["iMac", "24 M3", "premium", 69999]],
  monitors: [["Xiaomi", "A24i", "budget", 3499], ["Philips", "27E1N", "mid", 6999], ["LG", "27GP850", "premium", 14999]],
  peripherals: [["Logitech", "MK270", "budget", 999], ["Logitech", "MX Keys Mini", "mid", 4499], ["Razer", "DeathAdder V3", "premium", 2999]],
  soundbars: [["Xiaomi", "Soundbar 2.0", "budget", 2499], ["Samsung", "HW-B450", "mid", 6999], ["Sony", "HT-S400", "premium", 9999]],
  headphones: [["Xiaomi", "Buds 5", "budget", 1299], ["Sony", "WH-CH720N", "mid", 4499], ["Sony", "WH-1000XM5", "premium", 14999]],
  dryers: [["Beko", "DF7412", "mid", 22999], ["Samsung", "DV90T", "premium", 34999], ["LG", "RC90V", "premium", 38999]],
  dishwashers: [["Beko", "DVN0532", "budget", 11999], ["Bosch", "SMS2HT", "mid", 19999], ["Electrolux", "ESM4830", "premium", 27999]],
  cooking: [["Gorenje", "BO6737", "mid", 14999], ["Electrolux", "EOF3S40", "mid", 12999], ["Bosch", "HBA574B", "premium", 24999]],
  hoods: [["Eleyus", "Storm 60", "budget", 2999], ["Faber", "Flexa 60", "mid", 6999], ["Bosch", "DWB67", "premium", 12999]],
  heaters: [["Ballu", "BOH/CM", "budget", 999], ["Electrolux", "EIH/AG2", "mid", 2499], ["Xiaomi", "Smart Heater", "premium", 4999]],
  air: [["Xiaomi", "Smart Humidifier 2", "mid", 2499], ["Levoit", "Core 300S", "mid", 4999], ["Philips", "AC2936", "premium", 9999]],
  coffee: [["Philips", "HD7462", "budget", 1499], ["DeLonghi", "Magnifica S", "mid", 12999], ["Philips", "EP2220", "premium", 15999]],
  blenders: [["Tefal", "HB65", "budget", 999], ["Philips", "HR2652", "mid", 2499], ["Bosch", "MSM6", "premium", 3999]],
  kettles: [["Philips", "HD9306", "budget", 799], ["Xiaomi", "Electric Kettle", "mid", 1299], ["Bosch", "TWK861", "premium", 2499]],
  irons: [["Philips", "DST3030", "budget", 999], ["Tefal", "FV5640", "mid", 1999], ["Braun", "CareStyle 5", "premium", 7999]],
  grooming: [["Xiaomi", "Hair Clipper", "budget", 799], ["Philips", "MG3740", "mid", 1999], ["Braun", "Series 7", "premium", 4999]],
};

const lightSpecs = {
  tablets: { display: "10–11\"", memory: "64–128", battery: "день+", pen: "залежить" },
  wearables: { battery: "7–14 днів", sport: "базовий", water: "5 ATM", calls: "залежить" },
  "mobile-accessories": { type: "аксесуар", compat: "універс/модель", power: "залежить" },
  desktops: { cpu: "залежить", gpu: "залежить", ram: "16+", storage: "SSD" },
  monitors: { size: "24–27\"", res: "FHD/QHD", hz: "75–165", panel: "IPS" },
  peripherals: { type: "периферія", conn: "USB/BT", feature: "комфорт" },
  soundbars: { channels: "2.0/2.1", power: "кімната", sub: "опція" },
  headphones: { type: "TWS/накладні", anc: "залежить", battery: "20–40", fit: "критично" },
  dryers: { load: "7–9 кг", type: "конденсаційна", heatpump: "бажано" },
  dishwashers: { sets: "10–14", install: "60 см", water: "економ", noise: "тихо+" },
  cooking: { fuel: "електро", volume: "60–70л", functions: "конвекція" },
  hoods: { width: "60–90", power: "під кухню", noise: "дБ" },
  heaters: { type: "конвектор", power: "1–2кВт", safety: "перегрів" },
  air: { type: "очищувач/зволожувач", area: "кімната", filter: "HEPA" },
  coffee: { type: "крап/авто", pressure: "еспресо", milk: "залежить" },
  blenders: { power: "600–1200", bowl: "тип", mode: "пульс" },
  kettles: { type: "чайник", power: "висока", material: "метал/скло" },
  irons: { steam: "пара", sole: "кераміка", tank: "зручний" },
  grooming: { runtime: "60–120", blades: "насадки", wet: "мокро/сухо" },
};

/** @type {CatProduct[]} */
const products = [];
let n = 0;

function slug(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9а-яіїєґ]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function pushItem(sectionId, brand, name, bandId, price, tags, forWhom, specs, keys) {
  n += 1;
  const id = `cat-${sectionId}-${slug(brand)}-${slug(name)}-${n}`;
  const pros = [
    `Сильний варіант у полиці «${bandId === "budget" ? "бюджет" : bandId === "mid" ? "середній" : "преміум"}»`,
    `Зрозумілий сценарій: ${forWhom}`,
    tags[0] ? `Тег клієнта: ${tags[0]}` : "Легко пояснити різницю",
  ];
  products.push({
    id,
    sectionId,
    bandId,
    brand,
    name,
    price,
    tags,
    forWhom,
    pros,
    con: bandId === "budget" ? "Менше преміум-функцій і запасу на роки" : bandId === "mid" ? "За ті ж гроші інколи є альтернатива сильніша в одній фішці" : "Ціна вища — продавай сценарієм, не статусом",
    upsell: sectionId === "smartphones" ? ["Чохол", "Скло", "Зарядка"] : sectionId === "laptops" ? ["Миша", "Сумка", "Хаб"] : sectionId === "tvs" ? ["Кріплення", "Саундбар", "HDMI"] : ["Гарантія", "Супутні аксесуари", "Підключення/монтаж"],
    pitch: `${brand} ${name} — ${forWhom}. Орієнтовно ${price.toLocaleString("uk-UA")} ₴.`,
    specs,
    isHit: n % 3 !== 0,
    relatedIds: [],
    sourceUrl: `https://comfy.ua/ua/search/?q=${encodeURIComponent(brand + " " + name)}`,
  });
}

for (const [sectionId, conf] of Object.entries(catalogs)) {
  for (const row of conf.items) {
    const [brand, name, bandId, price, tags, forWhom, specs] = row;
    pushItem(sectionId, brand, name, bandId, price, tags, forWhom, specs, conf.keys);
  }
}

for (const [sectionId, rows] of Object.entries(light)) {
  for (const row of rows) {
    const [brand, name, bandId, price] = row;
    const forWhom =
      bandId === "budget" ? "Старт / базовий сценарій" : bandId === "mid" ? "Щоденне використання" : "Максимум комфорту";
    pushItem(sectionId, brand, name, bandId, price, [bandId, sectionId], forWhom, lightSpecs[sectionId] || { note: "див. картку" }, []);
  }
}

// link related within section
const bySection = Map.groupBy ? Map.groupBy(products, (p) => p.sectionId) : null;
const sectionMap = {};
for (const p of products) {
  (sectionMap[p.sectionId] ||= []).push(p);
}
for (const list of Object.values(sectionMap)) {
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    const b = list[(i + 1) % list.length];
    const c = list[(i + 2) % list.length];
    a.relatedIds = [b.id, c.id].filter((x) => x !== a.id).slice(0, 2);
  }
}

const index = {
  generatedAt: new Date().toISOString(),
  source: "seed-educational",
  count: products.length,
  sections: Object.keys(sectionMap),
};

fs.writeFileSync(path.join(outDir, "products.json"), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(outDir, "index.json"), JSON.stringify(index, null, 2));

// Also emit TS module for Next bundling without fs
const ts = `/* auto-generated by scripts/seed-catalog.mjs — do not edit by hand */
import type { Product } from "./types";

export type CatalogProduct = Product & { price?: number; sourceUrl?: string };

export const catalogProducts: CatalogProduct[] = ${JSON.stringify(products, null, 2)} as CatalogProduct[];

export const catalogMeta = ${JSON.stringify(index, null, 2)} as const;
`;
fs.writeFileSync(path.join(__dirname, "..", "src", "content", "catalog-seed.ts"), ts);

console.log(`Seeded ${products.length} products → data/catalog + src/content/catalog-seed.ts`);
