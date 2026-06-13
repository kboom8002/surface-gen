#!/usr/bin/env node
/**
 * apply-migrations.cjs
 * Applies SQL migrations to Supabase via the Management API SQL endpoint.
 * Requires: node >= 18 (built-in fetch)
 */
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'ynszdpwwdsdbpfmohylu';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inluc3pkcHd3ZHNkYnBmbW9oeWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTI2NjY0NCwiZXhwIjoyMDk2ODQyNjQ0fQ.w-U5pGCmWqhtyknkXL0yAsjzm1GbyqnQw1W8CA0Bykw';

// Supabase Management API endpoint for SQL queries
const SQL_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

const MIGRATION_FILES = [
  '0001_initial_schema.sql',
  '0002_rls_policies.sql',
  '0003_fix_rpc_and_export_bundles.sql',
];

async function executeSql(sql) {
  const resp = await fetch(SQL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await resp.text();
  return { status: resp.status, body: text };
}

async function main() {
  console.log('🗄️  Wedding Surface Agent — Migration Runner');
  console.log(`📡 Project: ${PROJECT_REF}`);
  console.log('');

  // Test connection first
  console.log('Testing connection...');
  const ping = await executeSql('SELECT current_database() as db, now()::text as ts');
  if (ping.status !== 200) {
    console.error(`❌ Connection failed: ${ping.status}`);
    console.error(ping.body.substring(0, 500));
    
    // Try alternative: db.supabase.co endpoint
    console.log('\nTrying direct DB connection endpoint...');
    const altResp = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: 'SELECT 1' }),
      }
    );
    console.log(`Alt status: ${altResp.status}`);
    console.log(await altResp.text());
    return;
  }

  const pingData = JSON.parse(ping.body);
  console.log(`✅ Connected to: ${JSON.stringify(pingData)}\n`);

  for (const file of MIGRATION_FILES) {
    const filePath = path.join(migrationsDir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${file} — file not found`);
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`\n🚀 Applying: ${file} (${sql.length} chars)`);

    const result = await executeSql(sql);
    if (result.status === 200 || result.status === 204) {
      console.log(`✅ Success`);
    } else {
      console.log(`⚠️  Status: ${result.status}`);
      // Show first 800 chars of error
      const body = result.body.substring(0, 800);
      console.log(body);
    }
  }

  console.log('\n✨ Migration run complete!');
  
  // Verify key tables exist
  console.log('\n📋 Verifying tables...');
  const check = await executeSql(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  if (check.status === 200) {
    const tables = JSON.parse(check.body);
    console.log('Tables found:', tables.map(t => t.table_name).join(', '));
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
