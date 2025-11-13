# Local Video Widget / Локальный видео-виджет

English text follows Russian version.

## RU Обзор
- Видео-виджет с эффектами стекла, плавным масштабированием при наведении и увеличением до карточки-вставки формата сториз.
- Локальное воспроизведение нескольких роликов по кругу (playlist), автозапуск без звука, ручное включение звука после разворачивания.
- Интерактивный CTA-блок с задержкой появления, поддержка привязки к якорю страницы или переходу на внешний URL.
- Управление с клавиатуры (Tab, Enter, Esc, M, C), фокус-ловушка и live-сообщения для экранных дикторов.

## EN Overview
- Glassmorphic floating mini player that scales on hover and expands into a story-like card.
- Local multi-video playlist with autoplay (muted) and manual unmute while expanded.
- Delayed CTA block that can scroll to an in-page target or navigate to an external link.
- Keyboard and assistive-tech friendly: focus trap, shortcuts (Enter/Space, Esc, M, C), ARIA live status updates.

## Design Highlights / Дизайн
- **Glassmorphism shell:** двойная рамка, размытие `backdrop-filter`, светящиеся границы при активном состоянии.
- **Компакт -> расширенный режим:** размеры для десктопа и мобайла на CSS-переменных, корректная точка масштабирования из угла.
- **Chip с автором/аватаром:** прозрачный бейдж с аватаром и подписью, плавно скрывается без данных.
- **Кнопки управления:** стеклянные круглые контролы, бейдж времени, скрываемая кнопка закрытия в свернутом виде.

## Подключение / Getting Started

1. Скопируйте `local-video-widget.js` в публичную директорию сайта или подключите через собственный CDN.
2. Перед подключением скрипта задайте глобальную конфигурацию:

```html
<script>
  window.LocalVideoWidgetConfig = {
    position: 'bottom-left', // or 'bottom-right'
    hoverScale: 1.18,
    videos: [
      { src: '/media/teaser-1.mp4', caption: 'Новинка недели', avatar: '/img/manager.png' },
      { src: '/media/teaser-2.mp4', caption: 'Live-демо' }
    ],
    ctaText: 'Записаться на консультацию',
    ctaHref: '#book-demo',
    ctaDelay: 2000
  };
</script>
<script src="/assets/local-video-widget.js" async></script>
```

3. Добавьте необходимые медиа-файлы (MP4/HLS) рядом со страницей или настройте абсолютные ссылки.

## Настройки / Configuration

| Option | Тип / Type | Описание |
| --- | --- | --- |
| `videos` | `Array<string | { src, caption?, avatar?, poster? }>` | Список роликов и метаданных. При отсутствии берётся запасной `videoSrc`. |
| `videoSrc` | `string` | Запасной CSV-список ссылок (например `"one.mp4, two.mp4"`). |
| `position` | `'bottom-left' \| 'bottom-right'` | Угол привязки, влияет на transform-origin. |
| `gutter` | `number` | Отступ от края окна в пикселях. |
| `hoverScale` | `number` | Коэффициент увеличения карточки при наведении. |
| `smallSize`, `expandedSize` | `{ width, height }` | Размеры для десктопа в свернутом и раскрытом состояниях. |
| `smallSizeMobile`, `expandedSizeMobile` | `{ width, height }` | Аналогичные размеры для мобильных устройств. |
| `smallRadius`, `largeRadius` | `number` | Скругления в компактном и расширенном видах. |
| `glassBorderColor`, `glassBorderColorActive` | `string` | Цвета рамки/свечения. |
| `controlsGlass` | `string` | Градиент фона для стека кнопок управления. |
| `ctaText` / `ctaHref` / `ctaDelay` | `string / string / number` | Текст, ссылка и задержка появления call-to-action. Поддерживает якоря `#id`. |
| `ctaAriaLabel` | `string` | Пользовательская озвучка CTA. |
| `accessibleLabel` | `string` | Общий `aria-label` для виджета. |

## Поведение / Behavior Notes
- При первом рендере виджет воспроизводит первое видео без звука и показывает только мини-карточку.
- Клик/Enter расширяет блок, воспроизведение продолжается, становится доступен звук и кнопки.
- CTA показывается после `ctaDelay` миллисекунд только в расширенном состоянии.
- Плеер циклически проходит по плейлисту, сохраняя состояние звука при переходах.
- Кнопки/хоткеи: `Esc` / `C` сворачивают, `M` переключает звук, `x` скрывает виджет до обновления страницы.

## Публикация на GitHub / Publishing to GitHub
1. Инициализируйте репозиторий в каталоге проекта: `git init`.
2. Добавьте файлы и зафиксируйте первую версию: `git add . && git commit -m "Add local video widget"`.
3. Создайте репозиторий на GitHub (например `boostclicks/local-video-widget`) и скопируйте URL SSH/HTTPS.
4. Привяжите удалённый origin и отправьте код: `git branch -M main`, `git remote add origin <URL>`, `git push -u origin main`.

## Автор / Author
- BoostClicks - Евгений Леонтьев - https://t.me/boostclicks  
- BoostClicks - https://boostclicks.ru/
