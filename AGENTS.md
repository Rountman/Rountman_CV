# Projekt: scroll-driven web (Astro + GSAP + Lenis)

Čti nejdřív `BRIEF.md`. Je to zadání tohoto webu: cíl, obsah, art direction, storyboard.

## Stack
- Astro (statický build → GitHub Pages), TypeScript, čisté CSS s tokeny v `src/styles/global.css`
- GSAP 3.13+ (ScrollTrigger, SplitText, zdarma i komerčně), Lenis (smooth scroll, jen desktop)
- Obsah jen v `src/data/*.ts`, nikdy natvrdo v komponentách

## Knihovna efektů (`src/scripts/motion/`)
Efekty se zapínají data-atributy. **Nové efekty nevymýšlej, dokud to jde složit z existujících.**
Když nový efekt opravdu chybí, přidej ho do `effects.ts` jako funkci + data-atribut + komentář v hlavičce souboru.

| Atribut | Efekt |
|---|---|
| `data-intro` | nadpis vyjede po znacích při načtení (max. 1 na stránku) |
| `data-intro-fade` | objeví se po intru |
| `data-hero-out` | při odscrollování hero se rozostří a odjede |
| `data-scrub-words` | slova odstavce se rozsvěcují podle scrollu |
| `data-horizontal` + `.h-track` | pin + horizontální pás; `data-year-counter`, `data-progress`, karty s `data-year` |
| `data-rule` | linka se narýsuje při scrollu |
| `data-speed="0.8"` | parallax |
| `data-frames="…/frame-{i}.webp"` + `<canvas>` | sekvence snímků řízená scrollem (viz `frameScrubber.ts`, snímky přes `npm run frames`) |

## Motion pravidla
- Easing: reveal `power4.out`, měkké `power2.out`, scrub `none`. Délky: micro 0.3 s, reveal 1.1 s, stagger 0.02–0.06
- Animuj jen `transform`, `opacity`, `filter`. Nikdy width/height/top/left
- Jeden orchestrovaný moment při načtení, jeden hlavní scroll moment na stránku. Žádné fade-up na každé sekci
- Všechno jde přes `initMotion()` → `gsap.matchMedia()`:
  - `prefers-reduced-motion: reduce` → žádné animace, obsah viditelný a čitelný
  - mobil (<900 px) → bez Lenisu, bez pinování horizontálních pásů, bez parallaxu
- Důležitý text (jména, ceny, CTA) je vždy HTML, nikdy zapečený v obrázku nebo canvasu

## Design pravidla
- Tokeny (barvy, písma, škála) jen v `:root` v `global.css`
- Odvážnost na jednom místě, zbytek klidný
- Vyhni se generickým AI tellům: krémové pozadí + terakota, all-caps eyebrow labely, `→` za každým odkazem, stejné zakulacené karty se stínem

## Postup práce
1. Přečti `BRIEF.md`, napiš krátký plán sekcí a efektů, počkej na schválení
2. Stav **jednu sekci po druhé**
3. Po každé sekci: `npm run build` a screenshoty (Playwright MCP nebo `scripts/shoot.py`) na 0/25/50/75/100 % scrollu, desktop 1440×900 a mobil 390×844
4. Zkontroluj: konzole bez chyb, text čitelný, nic nepřetéká, reduced motion funguje
5. Commit po každé hotové sekci

## Deploy
GitHub Pages přes `.github/workflows/deploy.yml`. Vlastní doména nebo `<user>.github.io` → `BASE_PATH=/`, projektová stránka → `BASE_PATH=/<repo>/`.
