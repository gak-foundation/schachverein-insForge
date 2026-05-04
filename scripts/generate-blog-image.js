const https = require('https');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

const BASE_URL = '4d3rbpyx.eu-central.insforge.app';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MTY3NjN9.-pgDMvo2MWub6Jy-80tmNVgSQD3gm89Ooz5NvCsN-rI';

function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: BASE_URL,
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function generateImage() {
  console.log('Generiere Bild mit AI...');
  
  const body = JSON.stringify({
    model: 'google/gemini-3-pro-image-preview',
    prompt: 'A modern, professional illustration showing a chess club transitioning to digital. A chess board with elegant pieces on the left side transforms into glowing digital pixels and website interface elements on the right side. Clean corporate design with blue and white colors, modern tech aesthetic, no text. Professional marketing illustration style.',
    size: '1024x1024',
    quality: 'hd'
  });

  const result = await makeRequest({
    method: 'POST',
    path: '/ai/v1/images/generations',
    headers: { 'Content-Length': Buffer.byteLength(body) }
  }, body);

  if (result.status !== 200 || !result.data.data || !result.data.data[0]) {
    console.error('Fehler bei Bildgenerierung:', JSON.stringify(result, null, 2));
    throw new Error('Bildgenerierung fehlgeschlagen');
  }

  const base64Image = result.data.data[0].b64_json;
  if (!base64Image) {
    throw new Error('Kein Base64-Bild im Response');
  }

  console.log('Bild erfolgreich generiert!');
  return Buffer.from(base64Image, 'base64');
}

async function uploadToStorage(buffer, filename) {
  console.log('Lade Bild in Storage hoch...');

  // Use multipart upload via REST
  const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
  
  const pre = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
    `Content-Type: image/png\r\n\r\n`
  );
  const post = Buffer.from(`\r\n--${boundary}--\r\n`);
  
  const body = Buffer.concat([pre, buffer, post]);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: BASE_URL,
      method: 'POST',
      path: `/storage/v1/object/blog-images/${filename}`,
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
        'x-upsert': 'true'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`Upload fehlgeschlagen: ${res.statusCode} ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ Key: `blog-images/${filename}` });
          } else {
            reject(new Error(`Upload fehlgeschlagen: ${res.statusCode} ${data}`));
          }
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function updateDatabase(imageUrl) {
  console.log('Aktualisiere Datenbank...');
  
  const body = JSON.stringify({
    cover_image: imageUrl
  });

  const result = await makeRequest({
    method: 'PATCH',
    path: '/rest/v1/blog_posts?slug=eq.5-grunde-eigene-website',
    headers: { 
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Prefer': 'return=representation'
    }
  }, body);

  if (result.status !== 200) {
    console.error('DB Update Fehler:', JSON.stringify(result, null, 2));
    throw new Error('Datenbankaktualisierung fehlgeschlagen');
  }

  console.log('Datenbank aktualisiert:', result.data);
}

async function main() {
  try {
    // 1. Bild generieren
    const imageBuffer = await generateImage();
    
    // 2. Temporär speichern
    const tempPath = path.join(require('os').tmpdir(), 'blog-cover.png');
    fs.writeFileSync(tempPath, imageBuffer);
    console.log('Temporär gespeichert:', tempPath, `(${imageBuffer.length} Bytes)`);

    // 3. In Storage hochladen
    const filename = '5-grunde-eigene-website-cover.png';
    await uploadToStorage(imageBuffer, filename);

    // 4. Public URL erstellen
    const publicUrl = `https://${BASE_URL}/storage/v1/object/public/blog-images/${filename}`;
    console.log('Public URL:', publicUrl);

    // 5. Datenbank aktualisieren
    await updateDatabase(publicUrl);

    console.log('\n✅ Alles erledigt!');
    console.log('Bild URL:', publicUrl);
  } catch (err) {
    console.error('❌ Fehler:', err.message);
    process.exit(1);
  }
}

main();
