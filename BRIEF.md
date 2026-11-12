# BRIEF

> Šablona: pro každý nový web zkopíruj starter, přepiš tento soubor a obsah v `src/data/`. Pak Claudovi řekni: „Postav web podle BRIEF.md.“

## 1. Cíl
- **Co je to za web:** osobní CV / portfolio
- **Pro koho:** tech recruiteři, klienti pro freelance zakázky
- **Hlavní akce (CTA):** napsat e-mail
- **Jak poznám úspěch:** návštěvník do 30 s ví, co dělám, a najde kontakt

## 2. Obsah
- Zdroj obsahu: `src/data/cv.ts` (texty piš sám, AI je jen učeše)
- Jazyk: angličtina (CZ verze později)

## 3. Art direction
- **Koncept:** CV jako technický výkres / kusovník (BOM). Kariéra vede od řízení strojů k webu
- **Paleta:** studený rýsovací papír `#e4e7ea`, indigo inkoust `#1a1f3a`, jediný akcent kobalt `#2b45e0`
- **Písmo:** jedna variabilní rodina Archivo (Google Fonts, wdth 62–125, wght 100–900), tokeny `--display` a `--text`
  - Hero jméno: verzálky, wdth 62, wght 800, line-height 0.85, na středu obrazovky
  - Nadpisy sekcí: wdth 75, wght 700
  - Text: wdth 100, wght 400
- **Textury / motivy:** jemná rýsovací mřížka, kótovací čára, projekty jako tabulka kusovníku
- **Reference:** (sem vlož 3–5 screenshotů nebo snímků z videí a ke každému, co se ti na něm líbí)
- **Nechci:** krémové pozadí s terakotou, karty se stíny, all-caps labely

## 4. Storyboard (scroll)
| Sekce | Co se děje | Rozsah scrollu | Efekt |
|---|---|---|---|
| Hero | jméno vyjede po znacích; při odscrollování se rozostří | 0–100 vh | `data-intro`, `data-hero-out` |
| About | slova odstavce se rozsvěcují | při průjezdu | `data-scrub-words` |
| Work | **hlavní moment**: horizontální pás kariéry, velký letopočet 2020 → 2026 | pin, délka = šířka pásu | `data-horizontal` |
| Projects | kusovník, linka se narýsuje | při průjezdu | `data-rule` |
| Tools, Studies | klidné | – | – |
| Contact | velký e-mail | – | hover podtržení |

## 5. Assety
- Žádné (typografický web). Pro promo weby sem: fotky, AI obrázky, video průletu → `npm run frames -- video.mp4 nazev`

## 6. Technické
- Hosting: GitHub Pages, doména apecka.com
- Mobil: bez pinování, karty pod sebou
- Reduced motion: statický, plně čitelný web
