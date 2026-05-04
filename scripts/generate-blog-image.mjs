import fs from 'fs';
import path from 'path';
import os from 'os';
import sharp from 'sharp';
import { createClient } from '@insforge/sdk';

const client = createClient({
  baseUrl: 'https://4d3rbpyx.eu-central.insforge.app',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MTY3NjN9.-pgDMvo2MWub6Jy-80tmNVgSQD3gm89Ooz5NvCsN-rI'
});

const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradient Background -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#1e3a5f;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </linearGradient>
    
    <!-- Glow Effect -->
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- Stronger Glow -->
    <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- Chess Board Pattern -->
    <pattern id="chessBoard" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="80" height="80" fill="#1e293b" />
      <rect x="0" y="0" width="40" height="40" fill="#334155" />
      <rect x="40" y="40" width="40" height="40" fill="#334155" />
    </pattern>
    
    <!-- Grid Pattern for Digital Side -->
    <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" stroke-width="0.5" opacity="0.3"/>
    </pattern>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />
  
  <!-- Subtle geometric shapes -->
  <circle cx="100" cy="100" r="300" fill="#3b82f6" opacity="0.05" />
  <circle cx="1100" cy="530" r="250" fill="#60a5fa" opacity="0.05" />
  
  <!-- Left Side: Chess Board -->
  <g transform="translate(100, 115)">
    <!-- Board Shadow -->
    <rect x="10" y="10" width="320" height="320" rx="12" fill="#000" opacity="0.3" />
    <!-- Board -->
    <rect x="0" y="0" width="320" height="320" rx="12" fill="url(#chessBoard)" stroke="#475569" stroke-width="2" />
    
    <!-- Chess Pieces (simplified) -->
    <!-- White King -->
    <g transform="translate(120, 40)" filter="url(#glow)">
      <circle cx="20" cy="25" r="18" fill="#f8fafc" />
      <rect x="17" y="5" width="6" height="20" fill="#f8fafc" />
      <rect x="10" y="10" width="20" height="5" fill="#f8fafc" />
      <rect x="14" y="42" width="12" height="4" fill="#f8fafc" rx="2" />
    </g>
    
    <!-- White Queen -->
    <g transform="translate(40, 40)" filter="url(#glow)">
      <circle cx="20" cy="25" r="16" fill="#f8fafc" />
      <polygon points="20,5 24,15 16,15" fill="#f8fafc" />
      <circle cx="14" cy="12" r="3" fill="#f8fafc" />
      <circle cx="26" cy="12" r="3" fill="#f8fafc" />
      <rect x="14" y="40" width="12" height="4" fill="#f8fafc" rx="2" />
    </g>
    
    <!-- Black Knight -->
    <g transform="translate(200, 40)" filter="url(#glow)">
      <path d="M 10 42 L 30 42 L 28 25 Q 28 15 20 10 Q 15 8 12 12 L 12 25 Z" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5" />
      <circle cx="18" cy="16" r="2" fill="#94a3b8" />
    </g>
    
    <!-- White Pawn -->
    <g transform="translate(40, 120)" filter="url(#glow)">
      <circle cx="20" cy="20" r="14" fill="#f8fafc" />
      <rect x="15" y="34" width="10" height="4" fill="#f8fafc" rx="2" />
    </g>
    
    <!-- Black Pawn -->
    <g transform="translate(200, 120)" filter="url(#glow)">
      <circle cx="20" cy="20" r="14" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5" />
      <rect x="15" y="34" width="10" height="4" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5" rx="2" />
    </g>
    
    <!-- White Rook -->
    <g transform="translate(280, 40)" filter="url(#glow)">
      <rect x="10" y="15" width="20" height="22" rx="3" fill="#f8fafc" />
      <rect x="8" y="10" width="24" height="6" rx="2" fill="#f8fafc" />
      <rect x="14" y="37" width="12" height="4" fill="#f8fafc" rx="2" />
    </g>
  </g>
  
  <!-- Transformation Arrow -->
  <g transform="translate(480, 270)">
    <path d="M 0 0 L 140 0" stroke="url(#bgGrad)" stroke-width="0" />
    <path d="M 0 0 Q 70 -30 140 0" fill="none" stroke="#3b82f6" stroke-width="3" opacity="0.6" filter="url(#glow)" />
    <path d="M 0 0 Q 70 30 140 0" fill="none" stroke="#60a5fa" stroke-width="3" opacity="0.6" filter="url(#glow)" />
    <!-- Arrow head -->
    <polygon points="130,-8 150,0 130,8" fill="#3b82f6" filter="url(#glow)" />
    
    <!-- Digital particles -->
    <circle cx="30" cy="-15" r="2" fill="#60a5fa" opacity="0.8">
      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="70" cy="-25" r="1.5" fill="#3b82f6" opacity="0.6">
      <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="100" cy="-10" r="2" fill="#60a5fa" opacity="0.7">
      <animate attributeName="opacity" values="0;1;0" dur="2s" begin="1s" repeatCount="indefinite" />
    </circle>
  </g>
  
  <!-- Right Side: Digital/Website Interface -->
  <g transform="translate(680, 115)">
    <!-- Browser Window Shadow -->
    <rect x="10" y="10" width="420" height="320" rx="16" fill="#000" opacity="0.3" />
    
    <!-- Browser Window -->
    <rect x="0" y="0" width="420" height="320" rx="16" fill="#0f172a" stroke="#334155" stroke-width="2" />
    
    <!-- Browser Header -->
    <rect x="0" y="0" width="420" height="40" rx="16" fill="#1e293b" />
    <rect x="0" y="20" width="420" height="20" fill="#1e293b" />
    
    <!-- Window Controls -->
    <circle cx="25" cy="20" r="6" fill="#ef4444" opacity="0.8" />
    <circle cx="45" cy="20" r="6" fill="#f59e0b" opacity="0.8" />
    <circle cx="65" cy="20" r="6" fill="#22c55e" opacity="0.8" />
    
    <!-- Address Bar -->
    <rect x="90" y="12" width="310" height="16" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1" />
    <text x="105" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="9" fill="#64748b">schachverein.de</text>
    <rect x="385" y="15" width="8" height="10" rx="1" fill="#3b82f6" opacity="0.6" />
    
    <!-- Website Content -->
    <!-- Header -->
    <rect x="20" y="55" width="380" height="50" rx="4" fill="#1e3a5f" opacity="0.6" />
    <rect x="35" y="70" width="120" height="20" rx="2" fill="#3b82f6" opacity="0.5" />
    <rect x="280" y="75" width="50" height="10" rx="2" fill="#64748b" opacity="0.4" />
    <rect x="340" y="75" width="50" height="10" rx="2" fill="#64748b" opacity="0.4" />
    
    <!-- Hero Section -->
    <rect x="20" y="115" width="380" height="90" rx="6" fill="#1e3a5f" opacity="0.4" />
    <rect x="35" y="130" width="200" height="16" rx="2" fill="#f8fafc" opacity="0.8" />
    <rect x="35" y="155" width="160" height="10" rx="2" fill="#94a3b8" opacity="0.5" />
    <rect x="35" y="175" width="80" height="20" rx="10" fill="#3b82f6" filter="url(#glow)" />
    
    <!-- Small Chess Icon in Hero -->
    <g transform="translate(320, 140)" opacity="0.3">
      <circle cx="20" cy="20" r="25" fill="#3b82f6" />
      <text x="20" y="28" text-anchor="middle" font-family="serif" font-size="24" fill="#f8fafc" font-weight="bold">♟</text>
    </g>
    
    <!-- Content Grid -->
    <rect x="20" y="215" width="115" height="80" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1" />
    <rect x="30" y="228" width="40" height="8" rx="2" fill="#3b82f6" opacity="0.5" />
    <rect x="30" y="245" width="90" height="6" rx="2" fill="#64748b" opacity="0.3" />
    <rect x="30" y="257" width="70" height="6" rx="2" fill="#64748b" opacity="0.3" />
    <rect x="30" y="275" width="50" height="10" rx="2" fill="#3b82f6" opacity="0.3" />
    
    <rect x="150" y="215" width="115" height="80" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1" />
    <rect x="160" y="228" width="40" height="8" rx="2" fill="#60a5fa" opacity="0.5" />
    <rect x="160" y="245" width="90" height="6" rx="2" fill="#64748b" opacity="0.3" />
    <rect x="160" y="257" width="70" height="6" rx="2" fill="#64748b" opacity="0.3" />
    <rect x="160" y="275" width="50" height="10" rx="2" fill="#60a5fa" opacity="0.3" />
    
    <rect x="280" y="215" width="115" height="80" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1" />
    <rect x="290" y="228" width="40" height="8" rx="2" fill="#22c55e" opacity="0.5" />
    <rect x="290" y="245" width="90" height="6" rx="2" fill="#64748b" opacity="0.3" />
    <rect x="290" y="257" width="70" height="6" rx="2" fill="#64748b" opacity="0.3" />
    <rect x="290" y="275" width="50" height="10" rx="2" fill="#22c55e" opacity="0.3" />
    
    <!-- Grid overlay for digital effect -->
    <rect x="0" y="40" width="420" height="280" fill="url(#grid)" opacity="0.2" />
  </g>
  
  <!-- Floating Code/Elements -->
  <g opacity="0.15" filter="url(#glow)">
    <text x="580" y="200" font-family="monospace" font-size="14" fill="#3b82f6">&lt;div&gt;</text>
    <text x="600" y="480" font-family="monospace" font-size="12" fill="#60a5fa">&lt;/&gt;</text>
    <text x="150" y="520" font-family="monospace" font-size="10" fill="#3b82f6">{ }</text>
  </g>
  
  <!-- Title Text -->
  <g transform="translate(100, 520)">
    <rect x="0" y="0" width="4" height="40" rx="2" fill="#3b82f6" filter="url(#glow)" />
    <text x="20" y="28" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="700" fill="#f8fafc">Digitale Zukunft</text>
    <text x="20" y="55" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94a3b8">für deinen Schachverein</text>
  </g>
  
  <!-- Logo/Brand Element -->
  <g transform="translate(1050, 550)">
    <rect x="0" y="0" width="50" height="50" rx="12" fill="#3b82f6" opacity="0.2" />
    <text x="25" y="34" text-anchor="middle" font-family="serif" font-size="28" fill="#3b82f6" font-weight="bold">♜</text>
  </g>
</svg>`;

async function main() {
  try {
    console.log('Erstelle SVG-Bild...');
    
    // SVG zu PNG konvertieren
    const pngBuffer = await sharp(Buffer.from(svgContent))
      .png()
      .toBuffer();
    
    console.log('PNG erstellt:', pngBuffer.length, 'Bytes');
    
    // Temporär speichern
    const tempPath = path.join(os.tmpdir(), 'blog-cover.png');
    fs.writeFileSync(tempPath, pngBuffer);
    console.log('Temporär gespeichert:', tempPath);
    
    // Upload zu Storage
    const filename = '5-grunde-eigene-website-cover.png';
    const blob = new Blob([pngBuffer], { type: 'image/png' });
    
    console.log('Lade in Storage hoch...');
    const { data: uploadData, error: uploadError } = await client.storage
      .from('blog-images')
      .upload(filename, blob, { upsert: true });

    if (uploadError) {
      console.error('Upload-Fehler:', uploadError);
      process.exit(1);
    }

    console.log('Upload erfolgreich:', uploadData);

    // Public URL
    const publicUrl = `https://4d3rbpyx.eu-central.insforge.app/storage/v1/object/public/blog-images/${filename}`;
    console.log('Public URL:', publicUrl);

    // DB Update
    console.log('Aktualisiere Datenbank...');
    const { data: updateData, error: updateError } = await client.database
      .from('blog_posts')
      .update({ cover_image: publicUrl })
      .eq('slug', '5-grunde-eigene-website')
      .select();

    if (updateError) {
      console.error('DB Update-Fehler:', updateError);
      process.exit(1);
    }

    console.log('DB aktualisiert:', updateData);
    console.log('\n✅ Fertig! Bild URL:', publicUrl);

  } catch (err) {
    console.error('❌ Fehler:', err);
    process.exit(1);
  }
}

main();
