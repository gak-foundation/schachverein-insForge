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
<svg width="1600" height="900" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Premium Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#070b14;stop-opacity:1" />
      <stop offset="40%" style="stop-color:#0f1b2e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a3a5c;stop-opacity:1" />
    </linearGradient>

    <!-- Accent Glow -->
    <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.15" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0" />
    </radialGradient>

    <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:#60a5fa;stop-opacity:0" />
    </radialGradient>

    <!-- Soft Shadow Filter -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.4"/>
    </filter>

    <!-- Glow Filter -->
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <!-- Strong Glow -->
    <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <!-- Board Pattern -->
    <pattern id="board" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="100" height="100" fill="#d4a373"/>
      <rect x="0" y="0" width="50" height="50" fill="#bc8a5f"/>
      <rect x="50" y="50" width="50" height="50" fill="#bc8a5f"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1600" height="900" fill="url(#bgGrad)"/>

  <!-- Ambient Light Orbs -->
  <circle cx="300" cy="300" r="400" fill="url(#glow1)"/>
  <circle cx="1300" cy="700" r="350" fill="url(#glow2)"/>

  <!-- ==================== LEFT SIDE: CHESS ==================== -->
  <g transform="translate(150, 180)">
    <!-- Board Shadow -->
    <rect x="15" y="15" width="520" height="520" rx="20" fill="#000" opacity="0.3" filter="url(#shadow)"/>
    
    <!-- Wooden Board -->
    <rect x="0" y="0" width="520" height="520" rx="16" fill="url(#board)" stroke="#8b6914" stroke-width="4"/>
    
    <!-- Board Border -->
    <rect x="-4" y="-4" width="528" height="528" rx="20" fill="none" stroke="#5c3d0d" stroke-width="4" opacity="0.6"/>

    <!-- Chess Pieces using Unicode for realistic shapes -->
    <!-- Row 8 (Black) -->
    <text x="30" y="95" font-family="serif" font-size="55" fill="#1a1a2e" text-anchor="middle">♜</text>
    <text x="92" y="95" font-family="serif" font-size="55" fill="#1a1a2e" text-anchor="middle">♞</text>
    <text x="155" y="95" font-family="serif" font-size="55" fill="#1a1a2e" text-anchor="middle">♝</text>
    <text x="218" y="95" font-family="serif" font-size="55" fill="#1a1a2e" text-anchor="middle">♛</text>
    <text x="282" y="95" font-family="serif" font-size="55" fill="#1a1a2e" text-anchor="middle">♚</text>
    <text x="345" y="95" font-family="serif" font-size="55" fill="#1a1a2e" text-anchor="middle">♝</text>
    <text x="408" y="95" font-family="serif" font-size="55" fill="#1a1a2e" text-anchor="middle">♞</text>
    <text x="472" y="95" font-family="serif" font-size="55" fill="#1a1a2e" text-anchor="middle">♜</text>

    <!-- Row 7 (Black Pawns) -->
    <text x="30" y="158" font-family="serif" font-size="55" fill="#1a1a2e" text-anchor="middle">♟</text>
    <text x="92" y="158" font-family="serif" font-size="55" fill="#1a1a2e" text-anchor="middle">♟</text>
    <text x="155" y="158" font-family="serif" font-size="55" fill="#1a1a2e" text-anchor="middle">♟</text>
    <text x="218" y="158" font-family="serif" font-size="55" fill="#1a1a2e" text-anchor="middle">♟</text>
    <text x="282" y="158" font-family="serif" font-size="55" fill="#1a1a2e" text-anchor="middle">♟</text>
    <text x="345" y="158" font-family="serif" font-size="55" fill="#1a1a2e" text-anchor="middle">♟</text>
    <text x="408" y="158" font-family="serif" font-size="55" fill="#1a1a2e" text-anchor="middle">♟</text>
    <text x="472" y="158" font-family="serif" font-size="55" fill="#1a1a2e" text-anchor="middle">♟</text>

    <!-- Row 2 (White Pawns) -->
    <text x="30" y="405" font-family="serif" font-size="55" fill="#f5f5f5" text-anchor="middle" filter="url(#shadow)">♙</text>
    <text x="92" y="405" font-family="serif" font-size="55" fill="#f5f5f5" text-anchor="middle" filter="url(#shadow)">♙</text>
    <text x="155" y="405" font-family="serif" font-size="55" fill="#f5f5f5" text-anchor="middle" filter="url(#shadow)">♙</text>
    <text x="218" y="405" font-family="serif" font-size="55" fill="#f5f5f5" text-anchor="middle" filter="url(#shadow)">♙</text>
    <text x="282" y="405" font-family="serif" font-size="55" fill="#f5f5f5" text-anchor="middle" filter="url(#shadow)">♙</text>
    <text x="345" y="405" font-family="serif" font-size="55" fill="#f5f5f5" text-anchor="middle" filter="url(#shadow)">♙</text>
    <text x="408" y="405" font-family="serif" font-size="55" fill="#f5f5f5" text-anchor="middle" filter="url(#shadow)">♙</text>
    <text x="472" y="405" font-family="serif" font-size="55" fill="#f5f5f5" text-anchor="middle" filter="url(#shadow)">♙</text>

    <!-- Row 1 (White) -->
    <text x="30" y="468" font-family="serif" font-size="55" fill="#f5f5f5" text-anchor="middle" filter="url(#shadow)">♖</text>
    <text x="92" y="468" font-family="serif" font-size="55" fill="#f5f5f5" text-anchor="middle" filter="url(#shadow)">♘</text>
    <text x="155" y="468" font-family="serif" font-size="55" fill="#f5f5f5" text-anchor="middle" filter="url(#shadow)">♗</text>
    <text x="218" y="468" font-family="serif" font-size="55" fill="#f5f5f5" text-anchor="middle" filter="url(#shadow)">♕</text>
    <text x="282" y="468" font-family="serif" font-size="55" fill="#f5f5f5" text-anchor="middle" filter="url(#shadow)">♔</text>
    <text x="345" y="468" font-family="serif" font-size="55" fill="#f5f5f5" text-anchor="middle" filter="url(#shadow)">♗</text>
    <text x="408" y="468" font-family="serif" font-size="55" fill="#f5f5f5" text-anchor="middle" filter="url(#shadow)">♘</text>
    <text x="472" y="468" font-family="serif" font-size="55" fill="#f5f5f5" text-anchor="middle" filter="url(#shadow)">♖</text>
  </g>

  <!-- ==================== CENTER: TRANSITION ==================== -->
  <g transform="translate(740, 200)">
    <!-- Animated-looking Particles -->
    <circle cx="20" cy="50" r="3" fill="#3b82f6" opacity="0.9" filter="url(#glow)"/>
    <circle cx="45" cy="120" r="2" fill="#60a5fa" opacity="0.7"/>
    <circle cx="10" cy="200" r="2.5" fill="#3b82f6" opacity="0.8"/>
    <circle cx="35" cy="280" r="2" fill="#93c5fd" opacity="0.6"/>
    <circle cx="15" cy="360" r="3" fill="#3b82f6" opacity="0.9" filter="url(#glow)"/>
    <circle cx="40" cy="440" r="2" fill="#60a5fa" opacity="0.7"/>

    <!-- Connection Lines -->
    <path d="M 25 50 Q 60 250 25 440" fill="none" stroke="#3b82f6" stroke-width="1.5" opacity="0.4" stroke-dasharray="8,6"/>
    <path d="M 25 100 Q 50 250 25 400" fill="none" stroke="#60a5fa" stroke-width="1" opacity="0.3" stroke-dasharray="6,8"/>

    <!-- Arrow -->
    <polygon points="15,230 35,250 15,270" fill="#3b82f6" opacity="0.8" filter="url(#glow)"/>
  </g>

  <!-- ==================== RIGHT SIDE: WEBSITE ==================== -->
  <g transform="translate(820, 150)">
    <!-- Laptop Shadow -->
    <rect x="20" y="20" width="600" height="420" rx="24" fill="#000" opacity="0.25" filter="url(#shadow)"/>

    <!-- Laptop Frame -->
    <rect x="0" y="0" width="600" height="420" rx="20" fill="#1e293b" stroke="#334155" stroke-width="3"/>

    <!-- Screen Content Area -->
    <rect x="12" y="12" width="576" height="370" rx="8" fill="#0f172a"/>

    <!-- Browser Top Bar -->
    <rect x="12" y="12" width="576" height="36" rx="8" fill="#1e293b"/>
    <rect x="12" y="24" width="576" height="24" fill="#1e293b"/>

    <!-- Window Controls -->
    <circle cx="32" cy="30" r="6" fill="#ef4444" opacity="0.8"/>
    <circle cx="52" cy="30" r="6" fill="#f59e0b" opacity="0.8"/>
    <circle cx="72" cy="30" r="6" fill="#22c55e" opacity="0.8"/>

    <!-- Address Bar -->
    <rect x="95" y="22" width="480" height="16" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1"/>
    <text x="110" y="34" font-family="system-ui, sans-serif" font-size="10" fill="#64748b">schachverein.de</text>
    <rect x="555" y="26" width="10" height="8" rx="2" fill="#3b82f6" opacity="0.5"/>

    <!-- Website Header -->
    <rect x="25" y="58" width="550" height="55" rx="6" fill="#1e3a5f" opacity="0.5"/>
    <rect x="40" y="75" width="140" height="22" rx="3" fill="#3b82f6" opacity="0.4"/>
    <rect x="400" y="80" width="55" height="12" rx="2" fill="#64748b" opacity="0.3"/>
    <rect x="465" y="80" width="55" height="12" rx="2" fill="#64748b" opacity="0.3"/>
    <rect x="530" y="80" width="30" height="12" rx="2" fill="#3b82f6" opacity="0.4"/>

    <!-- Hero Section -->
    <rect x="25" y="125" width="550" height="110" rx="8" fill="#1e3a5f" opacity="0.3"/>
    <rect x="40" y="142" width="280" height="20" rx="2" fill="#f8fafc" opacity="0.8"/>
    <rect x="40" y="172" width="220" height="12" rx="2" fill="#94a3b8" opacity="0.4"/>
    <rect x="40" y="192" width="220" height="12" rx="2" fill="#94a3b8" opacity="0.4"/>
    <rect x="40" y="216" width="90" height="24" rx="12" fill="#3b82f6" filter="url(#glow)" opacity="0.9"/>

    <!-- Chess Icon in Hero -->
    <g transform="translate(480, 150)" opacity="0.2">
      <circle cx="40" cy="40" r="35" fill="#3b82f6"/>
      <text x="40" y="52" text-anchor="middle" font-family="serif" font-size="40" fill="#f8fafc">♟</text>
    </g>

    <!-- Content Cards -->
    <rect x="25" y="250" width="170" height="110" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <rect x="38" y="265" width="50" height="10" rx="2" fill="#3b82f6" opacity="0.5"/>
    <rect x="38" y="285" width="130" height="8" rx="2" fill="#64748b" opacity="0.2"/>
    <rect x="38" y="298" width="100" height="8" rx="2" fill="#64748b" opacity="0.2"/>
    <rect x="38" y="318" width="70" height="10" rx="2" fill="#3b82f6" opacity="0.3"/>
    <rect x="38" y="336" width="50" height="8" rx="2" fill="#64748b" opacity="0.15"/>

    <rect x="215" y="250" width="170" height="110" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <rect x="228" y="265" width="50" height="10" rx="2" fill="#60a5fa" opacity="0.5"/>
    <rect x="228" y="285" width="130" height="8" rx="2" fill="#64748b" opacity="0.2"/>
    <rect x="228" y="298" width="100" height="8" rx="2" fill="#64748b" opacity="0.2"/>
    <rect x="228" y="318" width="70" height="10" rx="2" fill="#60a5fa" opacity="0.3"/>
    <rect x="228" y="336" width="50" height="8" rx="2" fill="#64748b" opacity="0.15"/>

    <rect x="405" y="250" width="170" height="110" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <rect x="418" y="265" width="50" height="10" rx="2" fill="#22c55e" opacity="0.5"/>
    <rect x="418" y="285" width="130" height="8" rx="2" fill="#64748b" opacity="0.2"/>
    <rect x="418" y="298" width="100" height="8" rx="2" fill="#64748b" opacity="0.2"/>
    <rect x="418" y="318" width="70" height="10" rx="2" fill="#22c55e" opacity="0.3"/>
    <rect x="418" y="336" width="50" height="8" rx="2" fill="#64748b" opacity="0.15"/>

    <!-- Laptop Bottom / Base -->
    <path d="M -20 420 L 620 420 L 640 450 L -40 450 Z" fill="#1e293b" opacity="0.8"/>
    <rect x="200" y="425" width="200" height="4" rx="2" fill="#334155"/>
  </g>

  <!-- ==================== TITLE & BRANDING ==================== -->
  <g transform="translate(120, 780)">
    <!-- Accent Line -->
    <rect x="0" y="5" width="5" height="50" rx="2.5" fill="#3b82f6" filter="url(#strongGlow)"/>

    <!-- Main Title -->
    <text x="25" y="32" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="36" font-weight="800" fill="#f8fafc" letter-spacing="-0.5">Digitale Zukunft für deinen Schachverein</text>

    <!-- Subtitle -->
    <text x="25" y="60" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="400" fill="#94a3b8" letter-spacing="0.5">Website, Verwaltung &amp; Kommunikation – alles aus einer Hand</text>
  </g>

  <!-- Brand Mark -->
  <g transform="translate(1420, 780)">
    <rect x="0" y="0" width="60" height="60" rx="14" fill="#3b82f6" opacity="0.15"/>
    <text x="30" y="42" text-anchor="middle" font-family="serif" font-size="32" fill="#3b82f6" font-weight="bold">♜</text>
  </g>

  <!-- Floating Elements for Depth -->
  <g opacity="0.08">
    <text x="650" y="160" font-family="monospace" font-size="14" fill="#3b82f6">&lt;div&gt;</text>
    <text x="680" y="680" font-family="monospace" font-size="12" fill="#60a5fa">&lt;/&gt;</text>
    <text x="200" y="750" font-family="monospace" font-size="10" fill="#3b82f6">{ }</text>
  </g>

  <!-- Subtle Grid Overlay on Right -->
  <defs>
    <pattern id="fineGrid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#3b82f6" stroke-width="0.3" opacity="0.15"/>
    </pattern>
  </defs>
  <rect x="820" y="150" width="600" height="420" fill="url(#fineGrid)" opacity="0.3" rx="20"/>
</svg>`;

async function main() {
  try {
    console.log('Erstelle professionelles SVG-Bild...');

    const pngBuffer = await sharp(Buffer.from(svgContent))
      .png({ quality: 100, compressionLevel: 3 })
      .toBuffer();

    console.log('PNG erstellt:', pngBuffer.length, 'Bytes');

    const tempPath = path.join(os.tmpdir(), 'blog-cover-v2.png');
    fs.writeFileSync(tempPath, pngBuffer);
    console.log('Temporär gespeichert:', tempPath);

    const filename = '5-grunde-eigene-website-cover-v2.png';
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

    const publicUrl = `https://4d3rbpyx.eu-central.insforge.app/storage/v1/object/public/blog-images/${filename}`;
    console.log('Public URL:', publicUrl);

    console.log('\n✅ Fertig! Bild URL:', publicUrl);
    console.log('\nHINWEIS: Dies ist ein SVG-basiertes Bild. Für fotorealistische Qualität empfehle ich:');
    console.log('1. Midjourney, DALL-E 3 oder Stable Diffusion mit dem Prompt:');
    console.log('   "A professional, modern illustration for a chess club website cover..."');
    console.log('2. Das generierte Bild dann in den blog-images Storage hochladen');

  } catch (err) {
    console.error('❌ Fehler:', err);
    process.exit(1);
  }
}

main();
