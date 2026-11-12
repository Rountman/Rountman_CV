# Projekt: scroll-driven web (Astro + GSAP + Lenis)

Čti nejdřív `BRIEF.md`. Je to zadání tohoto webu: cíl, obsah, art direction, storyboard.

## Stack
- Astro (statický build → GitHub Pages), TypeScript, čisté CSS s tokeny v `src/styles/global.css`
- GSAP 3.13+ (ScrollTrigger, SplitText, zdarma i komerčně), Lenis (smooth scroll, jen desktop)
- Obsah jen v `src/data/*.ts`, nikdy natvrdo v komponentách
- Písmo Archivo je self-hostované (`@fontsource-variable/archivo`, `@font-face` + preload v `Base.astro` přes import `?url`). Žádné externí fonty

## Knihovna efektů (`src/scripts/motion/`)
Efekty se zapínají data-atributy. **Nové efekty nevymýšlej, dokud to jde složit z existujících.**
Když nový efekt opravdu chybí, přidej ho do `effects.ts` jako funkci + data-atribut + komentář v hlavičce souboru.

| Atribut | Efekt |
|---|---|
| `data-intro` | nadpis vyjede po znacích při načtení (max. 1 na stránku) |
| `data-intro-fade` | objeví se po intru |
| `data-intro-rise` | vidět hned (LCP), intro ho jen posune o 14 px nahoru; pro hlavní text hera |
| `data-hero-zoom` | pin +80 %, animace +180 % (dojezd při odjezdu): jméno `[data-zoom-name]` se zvětší (3.2, mobil 1.8) a rozšíří (wdth 62 → 125), divák jím „proletí“; `[data-zoom-fade]` zmizí v prvních 20 % |
| `data-scrub-words` | slova odstavce se rozsvěcují podle scrollu |
| `data-horizontal` + `.h-track` | levý sloupec + okno (rodič tracku, maska); pin + horizontální pás, dokud levá hrana poslední karty nedojede do fokusu (okno + 4vw), pak držení 25 % délky; aktivní karta = levá hrana nejblíž fokusu; `data-year-counter`, `data-progress`, karty s `data-year` |
| `data-rule` | linka se narýsuje při scrollu |
| `data-depth-scenes` + `.scene` | JS přidá `.depth-on`, scény jsou na středu přes sebe; animace počet scén × 80 % (pin o 100 % kratší, zbytek dojíždí), každá přiletí z hloubky, drží, odletí k divákovi; `[data-scene-counter]` „03 / 05“ |
| `data-tunnel` + `[data-z]` | JS přidá `.tunnel-on`; animace +320 % (pin +220 % + 100 % dojezd), 3D tunel (perspective 900px, zlatý úhel, z krok 350px / mobil 300px), kamera = proxy `camZ`; `[data-tunnel-group]` = skupina nejbližší položky (`data-group`) |
| `data-assemble` + `[data-assemble-group]` | JS přidá `.depth-on`; pin +120 % (pinWithTail), posledních 25 % pinu držení se složenou mřížkou; položky `[data-assemble-item]` přiletí z `translate3d(±40vw, ±30vh, −2000…−4000px)` + blur 6px (seed podle indexu, perspective 1000px), skupiny po 0.08, uvnitř stagger 0.02; `[data-assemble-rule]` se narýsuje, když dosedne první položka skupiny. Mobil: bez pinu, skupina vyjede při `top 85%` |
| `data-speed="0.8"` | parallax |
| `data-frames="…/frame-{i}.webp"` + `<canvas>` | sekvence snímků řízená scrollem (viz `frameScrubber.ts`, snímky přes `npm run frames`) |

## Motion pravidla
- Easing: reveal `power4.out`, měkké `power2.out`, scrub `none`. Délky: micro 0.3 s, reveal 1.1 s, stagger 0.02–0.06
- Animuj jen `transform`, `opacity`, `filter`. Nikdy width/height/top/left. Jediná výjimka: `fontStretch` (osa wdth) u hero nadpisu v `data-hero-zoom`
- Jeden orchestrovaný moment při načtení. Žádné fade-up na každé sekci
- Rozpočet scrollu: max. 4 pinnuté momenty, celkem max. ~10 obrazovek pinnutého scrollu. Po každé změně změř výšku stránky
- Pinnutá sekce nesmí po odpinování nechat prázdnou obrazovku. Délku scrollu dává jen end/pinSpacing.
  Pinnutá sekce (`.depth-on`) má přesně 100svh, bez padding-block a min-height (padding jen ve fallbacku).
  Hloubkové efekty používají `pinWithTail()` v `effects.ts`: pin skončí o 100 % dřív a animace dojede, zatímco sekce odjíždí
- Piny registruj v `index.ts` v pořadí, v jakém jsou na stránce (jinak nesedí start/end následujících sekcí)
- 3D / absolutní rozvržení zapíná až JS třídou (`.depth-on`, `.tunnel-on`); bez JS zůstává normální seznam
- UI navázané na pinnutou animaci (počítadla, aktivní stav) aktualizuj v `onUpdate` tweenu/timeline, ne ScrollTriggeru
- Všechno jde přes `initMotion()` → `gsap.matchMedia()`:
  - `prefers-reduced-motion: reduce` → žádné animace, obsah viditelný a čitelný
  - mobil (<800 px) → bez Lenisu, bez pinování horizontálních pásů, bez parallaxu, bez `filter: blur` (jen scale + opacity), scale max. 1.8. Svislé piny (hero, scény, tunel) běží
- Důležitý text (jména, ceny, CTA) je vždy HTML, nikdy zapečený v obrázku nebo canvasu

## Design pravidla
- Tokeny (barvy, písma, škála) jen v `:root` v `global.css`
- Odvážnost na jednom místě, zbytek klidný
- Vyhni se generickým AI tellům: krémové pozadí + terakota, all-caps eyebrow labely, `→` za každým odkazem, stejné zakulacené karty se stínem

## Postup práce
1. Přečti `BRIEF.md`, napiš krátký plán sekcí a efektů, počkej na schválení
2. Stav **jednu sekci po druhé**
3. Po každé sekci: `npm run build`, `npm run preview` a ověření přes **Playwright MCP** (jiný nástroj na screenshoty v repu není):
   desktop 1440×900 a mobil 390×844, scroll 0/20/40/60/80/100 %, po každém scrollu počkej ~1,8 s (scrub).
   U pinnutých sekcí navíc snímek hned po konci pinu (nesmí být prázdná obrazovka) a konzole přes `browser_console_messages`
4. Zkontroluj: konzole bez chyb, text čitelný, nic nepřetéká, reduced motion funguje
5. Commit po každé hotové sekci

## Deploy
GitHub Pages přes `.github/workflows/deploy.yml`. Vlastní doména nebo `<user>.github.io` → `BASE_PATH=/`, projektová stránka → `BASE_PATH=/<repo>/`.
