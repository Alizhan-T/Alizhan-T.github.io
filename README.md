# Alizhan Toleukhan · M5 Showroom

Интерактивное портфолио с четырьмя ракурсами BMW M5 F90 и проектами из профиля [Alizhan-T](https://github.com/Alizhan-T). Интерфейс на русском языке.

## Локальный запуск

Требуется Node.js 22.12 или новее.

```sh
npm ci
npm run dev
```

Для проверки TypeScript выполните `npm run check`. Команда `npm run build` создаёт автономный сайт в `dist/` и обновляет скомпилированную точку входа и ассеты в корне для GitHub Pages. Исходный HTML находится в `index.dev.html`. Разворачивайте содержимое каталога в корне домена. Модель, декодер Draco и шрифты загружаются с того же домена.

## Где вносить изменения

- `src/data/portfolio.ts` — проекты, ссылки, контакты и палитры. Здесь же задаётся адрес для кнопки копирования email. При отказе браузера в доступе к буферу адрес можно выделить вручную.
- `src/components/scene` — модель, материалы, освещение, положение камеры и резервный просмотр. Начальный кадр — постановочное изображение. При взаимодействии или прокрутке сцена переходит в WebGL. На устройствах без аппаратного WebGL доступен 24-кадровый осмотр с масками краски и оптики.
- `src/components/sections` — четыре раздела портфолио. Компоненты в `src/components/projects` рисуют интерактивные превью на основе репозиториев FireWatch-AI, KitchenApp, MultiverseWiki и ALIZHMARKET. Каждая карточка ведёт к исходникам и отдельному мини-демо. Например, `/#demo/multiversewiki` открывает интерактивный макет справочника.
- `src/components/HUD.tsx` и `src/style.css` — управление шоурумом, адаптивные состояния, типографика и цвета.

## 3D-ассеты

В `models/bmw_m5_f90.glb` лежит готовая Draco-сжатая авторская модель. Для сборки сайта достаточно закоммиченных ассетов. Чтобы изменить геометрию, отредактируйте `scripts/model_f90.py`. Для повторной генерации нужны Python с NumPy, SciPy и Pillow, Blender 4.x и FFmpeg.

```sh
mkdir -p scripts/model/build
python scripts/model_f90.py scripts/model/build/vehicle.glb
npm ci --prefix scripts/model
node scripts/model/compress.mjs scripts/model/build/vehicle.glb models/bmw_m5_f90.glb
blender -b -P scripts/model/render_orbit.py
blender -b -P scripts/model/masks.py
python scripts/model/encode_frames.py
```

Модель использует метры, ось Y направлена вверх, нос автомобиля смотрит в +Z. Материалы Paint, Glass, DRL, Tail, Brake и Indicator связаны с управлением в шоуруме.

## Интро-видео

Интро (`public/videos/intro_code_gt_1080p.mp4`) отрисовано кодом: сцена на Three.js лежит в `scripts/intro/scene.js` — вихрь частиц и символов кода, сборка в оригинальный седан без логотипов (варианты кузова: `?car=gt|executive|fastback|sport`, по умолчанию gt), вспышка фар, рывок мимо камеры. Чтобы перерендерить (нужны Python с Playwright, Google Chrome и FFmpeg):

```sh
npm ci
python3 scripts/intro/render.py preview 1.0 2.5 3.5   # контрольные кадры в /tmp/intro_preview
python3 scripts/intro/render.py full public/videos/intro_code_gt_1080p.mp4
```

Тайминг затухания оверлея задаётся в `src/components/introTiming.ts` (`INTRO_END_TIME`).
