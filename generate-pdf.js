const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

function toB64(file, mime) {
  return `data:${mime};base64,` + fs.readFileSync(path.resolve(__dirname, file)).toString('base64');
}

(async () => {
  let html = fs.readFileSync(path.resolve(__dirname, 'volante-final.html'), 'utf8');

  // Embed all images as base64
  const imgs = {
    'aguacate-hass-2.jpg':  toB64('aguacate-hass-2.jpg',  'image/jpeg'),
    'logo-berahass.png':    toB64('logo-berahass.png',    'image/png'),
    'cultivo-panorama.jpg': toB64('cultivo-panorama.jpg', 'image/jpeg'),
    'garrafa-clean.png':    toB64('garrafa-clean.png',    'image/png'),
    'refinado-clean.png':   toB64('refinado-clean.png',   'image/png'),
    'extravirgen-clean.png':toB64('extravirgen-clean.png','image/png'),
  };
  for (const [f, d] of Object.entries(imgs)) {
    html = html.replace(new RegExp(`src="${f.replace('.','\\.')}"`, 'g'), `src="${d}"`);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox','--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1122 });
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1200));

  await page.pdf({
    path: path.resolve(__dirname, 'volante-berahass.pdf'),
    width: '794px',
    height: '1122px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    pageRanges: '1'
  });

  console.log('✅ PDF listo: volante-berahass.pdf');
  await browser.close();
})();
