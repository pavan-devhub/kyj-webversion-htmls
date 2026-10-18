# KYJ · Krushi Yeva Jayate — HTML version

The KYJ farmer export journey as a plain HTML / CSS / JavaScript site, inside the FEED site's
navbar and footer. It needs no server, build step or editor extension: open `index.html` in
any modern browser (Chrome, Edge, Firefox, Safari) — double-clicking it is enough. It can also
be put on any static web host (or a backend's static folder) exactly as it is.

## Pages

| File | Page |
| --- | --- |
| `index.html` | KYJ home: the project overview and every stage with its steps (search, stage filters) |
| `screens/<id>.html` | One page per step, e.g. `screens/1.html` (EPM QR Landing) … `screens/27.html` (KYJ-1 Platinum Certification) |

The step pages are named after the screens' file numbers: `1`–`17`, `8a`, `11a`, `13a`,
`s18`–`s21`, `22`, `22a`, `23`–`25` and `27`. On a step page, ← / → move to the previous /
next step.

## Folders

```
index.html                  KYJ home
screens/                    one page per step
assets/
  css/
    main.css                shared styles (imports the folders below, in order)
    base/                   design tokens, reset, typography
    layout/                 app shell (sidebar, top bar, pager), page and grid layout
    components/             cards, buttons, badges, forms, stage list, …
    utilities/              tones and small helper classes
    stage/                  colour theme for each stage
    site/                   FEED navbar and footer (navbar.css, footer.css, …) and frame.css,
                            which fits the KYJ pages under the fixed navbar
    pages/                  one stylesheet per page (home.css, screen-<id>.css)
  js/
    config.js               settings — see below
    site/navbar.js          navbar: Services menu, notifications, mobile menu, hide on scroll
    site/footer.js          footer: back-to-top button
    pages/home.js           home: search, stage filters, journey wheel
    pages/screen.js         step pages: stage drawer, ← / → keys, sidebar position
    data/screens.js         the stages and steps the home search runs over
  images/                   photos and illustrations; images/feed/ holds the FEED logos and
                            the Services menu icons
  icons/favicon.svg
```

Each page links `main.css`, the `site/` styles, `components/stage-journey.css` and then its own
sheet from `pages/`, and loads the scripts it needs with `defer`. All paths are relative, so
the folder can be moved or renamed freely.

## Settings

`assets/js/config.js`:

- `feedSiteUrl` — where the main FEED site is hosted. The navbar's links to the FEED site's
  other pages (Home, How Feed Works, FPO, Exports, Contact Us, My Account / Login, Register)
  open it. Left empty, the logo and Home open the KYJ home page and the other links do nothing.
  Services → Krushi Yeva Jayate always opens the KYJ home page.

## Notes

- Fonts (Google Sans Flex, Inter, Outfit, Plus Jakarta Sans, JetBrains Mono, Noto Sans Telugu)
  load from Google Fonts, so pages show them when online; offline they fall back to system fonts.
- These pages are generated from the KYJ React app (`npm run export:html` there). Changes made
  in the app can be exported again; changes made here by hand are overwritten by a new export.
