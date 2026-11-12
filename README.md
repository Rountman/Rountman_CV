# apecka.com: scroll-driven CV (Astro + GSAP + Lenis)

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/
```

- Obsah: `src/data/cv.ts`
- Vzhled: `src/styles/global.css` (tokeny v `:root`)
- Animace: `src/scripts/motion/` (efekty přes data-atributy, viz `CLAUDE.md`)
- Zadání webu: `BRIEF.md`
- Sekvence snímků z videa: `npm run frames -- video.mp4 nazev` (potřebuje ffmpeg)
- Screenshoty pro kontrolu: `python3 scripts/shoot.py http://localhost:4321/` (Playwright)

## Nasazení na GitHub Pages
1. Pushni do repa na větev `main`.
2. Repo → Settings → Pages → Source: **GitHub Actions**.
3. Vlastní doména apecka.com: v Settings → Pages vyplň Custom domain (nebo přidej `public/CNAME` s `apecka.com`).
   Pokud web běží na `<user>.github.io/<repo>`, změň v `.github/workflows/deploy.yml` `BASE_PATH` na `/<repo>/`.
