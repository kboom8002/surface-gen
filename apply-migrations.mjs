// apply-migrations.mjs
// Applies all SQL migrations to Supabase using the postgres driver via supabase-js admin
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://ynszdpwwdsdbpfmohylu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inluc3pkcHd3ZHNkYnBmbW9oeWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTI2NjY0NCwiZXhwIjoyMDk2ODQyNjQ0fQ.w-U5pGCmWqhtyknkXL0yAsjzm1GbyqnQw1W8CA0Bykw';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const migrationsDir = join(__dirname, 'supabase', 'migrations');
const files = [
  '0001_initial_schema.sql',
  '0002_rls_policies.sql',
  '0003_fix_rpc_and_export_bundles.sql',
];

async function runMigration(fileName) {
  const filePath = join(migrationsDir, fileName);
  const sql = readFileSync(filePath, 'utf-8');
  
  console.log(`\n🚀 Applying ${fileName}...`);
  
  // Split on statement terminators and run individually
  // Supabase supabase-js doesn't support raw SQL directly
  // We need to use the postgres REST endpoint
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql_migration`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql_text: sql }),
  });
  
  if (response.ok) {
    console.log(`✅ ${fileName} applied successfully`);
  } else {
    const text = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(text.substring(0, 300));
  }
}

// Alternative: use node-postgres directly
async function runWithNodePostgres() {
  // The connection string for Supabase is: 
  // postgresql://postgres:[SERVICE_ROLE_KEY]@db.ynszdpwwdsdbpfmohylu.supabase.co:5432/postgres
  // But we need to use the actual DB password, not service role JWT
  // Try the Supabase transaction pool endpoint
  
  for (const file of files) {
    const filePath = join(migrationsDir, file);
    const sql = readFileSync(filePath, 'utf-8');
    
    console.log(`\n📄 Migration: ${file}`);
    console.log(`   Size: ${sql.length} chars`);
    
    // Try executing via REST API with statement splitting
    const statements = sql
      .replace(/--[^\n]*/g, '') // remove comments
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 10);
    
    console.log(`   Statements: ${statements.length}`);
    
    let success = 0;
    let failed = 0;
    for (const stmt of statements) {
      // Use supabase.rpc or raw fetch
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
        method: 'POST', 
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: stmt }),
      });
      if (resp.status < 400) success++;
      else failed++;
    }
    console.log(`   ✅ OK: ${success}, ❌ Failed: ${failed}`);
  }
}

runWithNodePostgres().catch(console.error);
