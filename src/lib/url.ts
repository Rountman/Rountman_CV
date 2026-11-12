/** Cesta k souboru v public/ s ohledem na BASE_PATH (např. "/" nebo "/repo/"). */
export const withBase = (path: string) =>
  import.meta.env.BASE_URL.replace(/\/?$/, '/') + path.replace(/^\//, '');
