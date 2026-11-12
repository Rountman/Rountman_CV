// Rozseká video na snímky pro FrameScrubber (desktop + mobil).
// Použití: npm run frames -- video.mp4 [název] [počet_desktop] [počet_mobil]
// Výstup: public/frames/<název>/desktop/frame-001.webp …, public/frames/<název>/mobile/…
// Vyžaduje ffmpeg v PATH.
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [video, name = 'sequence', nDesk = '120', nMob = '60'] = process.argv.slice(2);
if (!video) { console.error('Použití: npm run frames -- video.mp4 [název] [počet_desktop] [počet_mobil]'); process.exit(1); }

const dur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${video}"`).toString());
const run = (dir, count, filter) => {
  const out = `public/frames/${name}/${dir}`;
  mkdirSync(out, { recursive: true });
  const fps = (Number(count) / dur).toFixed(4);
  execSync(`ffmpeg -y -loglevel error -i "${video}" -vf "fps=${fps},${filter}" -frames:v ${count} -c:v libwebp -quality 80 "${out}/frame-%03d.webp"`, { stdio: 'inherit' });
  console.log(`✓ ${count} snímků → ${out}`);
};
run('desktop', nDesk, 'scale=1920:-2');
run('mobile', nMob, 'crop=ih*9/16:ih,scale=900:-2'); // výřez na výšku ze středu
