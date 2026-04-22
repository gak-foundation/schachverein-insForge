#!/usr/bin/env node
/**
 * Vercel Deployment Helper Script
 * 
 * Usage:
 *   node scripts/setup-vercel-env.js
 * 
 * Dieses Script hilft dir beim Einrichten der ENV-Variablen für Vercel.
 * Es generiert auch einen zufälligen ENCRYPTION_KEY.
 */

const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(q) {
  return new Promise(resolve => rl.question(q, resolve));
}

function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('hex');
}

async function main() {
  console.log('🚀 Vercel + Supabase Deployment Setup\n');
  console.log('====================================\n');
  
  console.log('📋 Schritt 1: Supabase Projekt erstellen');
  console.log('   → https://supabase.com');
  console.log('   → Region: EU (Frankfurt) für DSGVO\n');
  
  console.log('📋 Schritt 2: ENV-Variablen sammeln\n');
  
  const supabaseUrl = await question('Supabase URL (NEXT_PUBLIC_SUPABASE_URL): ');
  const anonKey = await question('Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY): ');
  const serviceKey = await question('Service Role Key (SUPABASE_SERVICE_ROLE_KEY): ');
  const dbUrl = await question('Database URL (Port 6543, mit Pooling): ');
  const directUrl = await question('Direct URL (Port 5432, ohne Pooling): ');
  const vercelUrl = await question('Vercel URL (z.B. https://xyz.vercel.app): ');
  const rootDomain = await question('Root Domain (z.B. schach.studio): ');
  
  // Generate encryption key
  const encryptionKey = generateEncryptionKey();
  
  console.log('\n====================================');
  console.log('✅ Generierte ENV-Variablen:\n');
  
  const envVars = {
    'NEXT_PUBLIC_SUPABASE_URL': supabaseUrl,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': anonKey,
    'SUPABASE_SERVICE_ROLE_KEY': serviceKey,
    'DATABASE_URL': dbUrl,
    'DIRECT_URL': directUrl,
    'NEXT_PUBLIC_APP_URL': vercelUrl,
    'NEXT_PUBLIC_ROOT_DOMAIN': rootDomain,
    'NEXT_PUBLIC_COOKIE_DOMAIN': '',
    'ENCRYPTION_KEY': encryptionKey,
  };
  
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });
  
  console.log('\n====================================');
  console.log('📋 Optional: E-Mail Konfiguration\n');
  
  const wantsEmail = await question('Möchtest du E-Mail konfigurieren? (j/n): ');
  
  if (wantsEmail.toLowerCase() === 'j') {
    const smtpHost = await question('SMTP Host (z.B. smtp.gmail.com): ');
    const smtpPort = await question('SMTP Port (z.B. 587): ');
    const smtpUser = await question('SMTP User: ');
    const smtpPass = await question('SMTP Pass: ');
    const emailFrom = await question('Email From: ');
    
    console.log('\n# Email Configuration:');
    console.log(`SMTP_HOST=${smtpHost}`);
    console.log(`SMTP_PORT=${smtpPort}`);
    console.log(`SMTP_USER=${smtpUser}`);
    console.log(`SMTP_PASS=${smtpPass}`);
    console.log(`EMAIL_FROM=${emailFrom}`);
    console.log(`CONTACT_NOTIFICATION_EMAIL=${emailFrom}`);
  }
  
  console.log('\n====================================');
  console.log('📝 Nächste Schritte:\n');
  console.log('1. Kopiere die ENV-Variablen in Vercel:');
  console.log('   → https://vercel.com/dashboard → [Projekt] → Settings → Environment Variables\n');
  console.log('2. Führe Migrationen aus:');
  console.log('   npm run db:push\n');
  console.log('3. Konfiguriere Supabase Auth URLs:');
  console.log(`   Site URL: ${vercelUrl}`);
  console.log(`   Redirect: ${vercelUrl}/api/auth/callback\n`);
  console.log('4. Deploye:');
  console.log('   vercel --prod\n');
  
  rl.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
