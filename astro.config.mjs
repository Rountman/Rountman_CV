import { defineConfig } from 'astro/config';

// GitHub Pages:
// - vlastní doména (apecka.com) nebo repo <user>.github.io → BASE_PATH nenastavuj ("/")
// - projektová stránka <user>.github.io/<repo> → BASE_PATH=/<repo>/ (nastavuje workflow)
export default defineConfig({
  site: process.env.SITE_URL || 'https://apecka.com',
  base: process.env.BASE_PATH || '/',
  build: { inlineStylesheets: 'auto', assets: 'assets' },
});
