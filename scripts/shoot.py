import sys, time
from playwright.sync_api import sync_playwright
url = sys.argv[1]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    for name, vp in [('d', {'width':1440,'height':900}), ('m', {'width':390,'height':844})]:
        pg = b.new_page(viewport=vp)
        errs=[]
        pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(url, wait_until='networkidle', timeout=30000)
        time.sleep(2.5)
        H = pg.evaluate('document.documentElement.scrollHeight')
        print(name, 'height', H, 'errors', errs)
        stops = [0, 0.1, 0.2, 0.3, 0.38, 0.46, 0.55, 0.7, 0.85, 1.0] if name=='d' else [0, 0.15, 0.3, 0.5, 0.7, 1.0]
        for s in stops:
            y = int((H - vp['height']) * s)
            pg.mouse.wheel(0, 0)
            pg.evaluate(f'window.scrollTo(0,{y})')
            time.sleep(1.8)
            pg.screenshot(path=f'/tmp/shots/{name}_{int(s*100):03d}.png')
    b.close()
