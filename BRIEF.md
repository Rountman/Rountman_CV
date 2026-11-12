# BRIEF

> Šablona: pro každý nový web zkopíruj starter, přepiš tento soubor a obsah v `src/data/`. Pak Claudovi řekni: „Postav web podle BRIEF.md.“

## 1. Cíl
- **Co je to za web:** osobní CV / portfolio (EN `/`, CS `/cs/`)
- **Pro koho:** tech recruiteři, klienti pro freelance zakázky
- **Hlavní akce (CTA):** napsat e-mail
- **Jak poznám úspěch:** návštěvník do 30 s ví, že jsem full-stack web developer, a najde kontakt

## 2. Obsah
- Zdroj obsahu: `src/data/cv.ts` (EN + CS). Texty Work a Projects jsou doslovně z CV, nepřepisovat
- **Intro (hero)**
  - EN: „Full-stack web developer. I build web applications in React and TypeScript and connect them to backends and external services.“
  - CS: „Full-stack webový vývojář. Stavím webové aplikace v Reactu a TypeScriptu a napojuji je na backendy a externí služby.“
- **About**
  - EN: „Five years of hands-on development. I started with C#, .NET and WPF, moved to JavaScript with a Discord bot for MADMONQ that I still maintain today, and now I build full-stack web apps. I am into innovative development.“
  - CS: „Pět let praxe. Začínal jsem s C#, .NET a WPF, pak přešel na JavaScript s Discord botem pro MADMONQ, kterého udržuji dodnes, a dnes stavím full-stack webové aplikace. Baví mě inovativní vývoj.“
  - První věta jasná, zbytek ztlumenou barvou (`--muted`)
- **Projects:** Chalupuj (https://chalupuj.cz, React, EN „React frontend of the Chalupuj accommodation portal.“ / CS „React frontend ubytovacího portálu Chalupuj.“), MCDM, Blendscan, ARAdventure, UHK-HelicopterAR. **Discord bot odebrat** (soukromé repo)
- **Contact:** EN „Open to collaborations. Write to me:“ / CS „Jsem otevřený spolupráci. Napište mi:“ + e-mail, GitHub, LinkedIn, CV PDF (EN/CS)

## 3. Art direction: D „Skleněné jádro“
- **Koncept:** jeden 3D objekt, iridescentní skleněno-kovové jádro, provází celou stránku. V sekci Work se přetaví podle etapy kariéry: koule → čip → telefon → okno prohlížeče. Barvu na stránce nese jen objekt
- **Reference:** `reference/prototype-d.html` = schválený prototyp. Vzor vzhledu, textů a chování objektu. Kód je prototyp (CDN, inline), do produkce se přepisuje
- **Paleta:** pozadí `#0B0D12`, text `#E8EAF0`, ztlumený text `#A9B0BF`, linky `rgba(232,234,240,.14)`. Duhové barvy objektu (`#7FD6E8`, `#9C8CFF`, `#F2A7D8`, `#FFE3A3`) jen v objektu a v 2px progress baru
- **Písma (self-host, latin + latin-ext, ověřit českou diakritiku):**
  - Syne 600/800: jméno, nadpisy sekcí, názvy rolí a projektů, e-mail
  - Geist 400/500: text, navigace, metadata
- **3D objekt (Three.js):**
  - `MeshPhysicalMaterial`: color `#DFE3FF`, metalness 0.9, roughness 0.2, iridescence 1, iridescenceIOR 1.8, iridescenceThicknessRange [100, 1400] (spodní hodnota pomalu kolísá ±80), clearcoat 1, clearcoatRoughness 0.05, envMapIntensity 1.1, prostředí `RoomEnvironment`
  - světla: PointLight `#6F8CFF` (−4, 2, 4), PointLight `#FF8FD0` (4, −2, 3)
  - tvary = superelipsoidy z jedné `SphereGeometry` (desktop 140 segmentů, mobil 96): koule (1, 1, 1, n=2), čip (0.95, 0.95, 0.14, n=14), telefon (0.58, 1.15, 0.12, n=9), prohlížeč (1.45, 0.92, 0.1, n=9)
  - morph tvaru přímo podle scrollu (bez zpoždění). Pozice, scale a opacity dojíždějí lerpem 0.08 za snímek
  - rotace: koule pomalu kolem Y (0.15 rad/s), ploché tvary jen kývání ±0.25 rad. Myš natáčí o max. 0.5 / 0.3 rad
- **Nechci:** nic ze starého směru (rýsovací mřížka, kobalt, kusovník, Archivo), neonový akcent na textu, glassmorphism karty, all-caps labely, šipky za odkazy

## 4. Storyboard (scroll)
Objekt: x a y jsou podíly poloviny šířky a výšky okna (0 = střed), s = scale, o = opacity. Mezi sekcemi interpolace se smoothstep(0.2, 0.8), takže objekt u každé sekce chvíli drží.

| Sekce | Co se děje | Rozsah scrollu | Objekt |
|---|---|---|---|
| Hero | jméno vlevo dole (Syne 800, clamp 64–168px), intro vpravo, 3 tenké soustředné kružnice, nápověda „Scroll“ dole | 100svh, bez pinu | x 0, y 0.12, s 1.25, o 1, koule |
| About | velký text vlevo (max. 22ch), objekt vpravo | ~110vh, bez pinu | x 0.55, y 0, s 0.75, o 0.9, koule |
| Work | **hlavní moment.** Sticky 100vh: vlevo nadpis a panel se 2 rolemi, vpravo objekt. 3 etapy: čip (MIKROKLIMA, AR), telefon (Blendlens, PMI), prohlížeč (PekneWeby, freelance). Kroky dole | sekce 330vh, sticky (≈2,3 obrazovky) | x 0.5, y 0, s 0.95–1, o 1, tvar podle etapy |
| Projects | nadpis vlevo, seznam vpravo, objekt malý vlevo dole | bez pinu | x −0.68, y −0.38, s 0.45, o 0.8, koule |
| Tools | skupiny dovedností jako čitelná mřížka (`data-assemble`, tmavé barvy) | pin +120 % | x 0.7, y 0.3, s 0.35, o 0.25, koule |
| Studies | klidný seznam | bez pinu | stejně jako Tools |
| Contact | e-mail na 1 řádek přes celou šířku (`min(5.2vw, 88px)`, nowrap; mobil zalomit jen před „@“), objekt ztlumený za textem | min. 100vh | x 0, y 0.05, s 1.5, o 0.22, koule |

- **Rozpočet:** pinnutý/sticky scroll ≈ 3,5 obrazovky, stránka ≈ 11–12 obrazovek
- **Odpadá:** hero zoom, horizontální pás Work, scény Projects (efekty zůstávají v knihovně, na této stránce se nepoužijí)
- **Vždy:** 2px progress bar nahoře, nápověda „Scroll“ (zmizí po 40 px scrollu)

## 5. Assety
- Žádné obrázky. Objekt je generovaný v Three.js. CV PDF v `public/`

## 6. Technické
- Hosting: GitHub Pages, doména apecka.com, EN `/` + CS `/cs/`
- Three.js z npm, dynamický import až po prvním vykreslení (vlastní chunk, hero text nečeká na 3D)
- Výkon: DPR max. 1.5, normály přepočítat jen při změně tvaru, render pauza při skrytém tabu, cíl Lighthouse mobil ≥ 90
- Mobil (<800 px, vyhodnocovat průběžně přes matchMedia listener): objekt na středu za textem (x 0, y +0.25, s × 0.7, o × 0.6), Work: text dole, objekt nahoře
- Reduced motion: objekt bez rotace a lerpu, tvary se mění skokem, nápověda bez animace
- Bez WebGL: CSS koule (radial + conic gradient, opacity 0.5)
