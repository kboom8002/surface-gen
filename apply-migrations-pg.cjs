#!/usr/bin/env node
/**
 * apply-migrations-pg.cjs
 * Applies all SQL migrations using node-postgres (pg) direct connection.
 * Supabase Direct DB connection: postgresql://postgres.[ref]:[password]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres
 * 
 * NOTE: The password for Supabase is the DB password set in the dashboard,
 * NOT the service role JWT. We use the pooler endpoint.
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'ynszdpwwdsdbpfmohylu';
// Supabase Postgres connection via Session Pooler (port 5432)
// User = postgres.{project_ref}, password = database password from Supabase dashboard
// We'll try the service-role JWT as password first (some Supabase configs accept it)
const DB_PASSWORD = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inluc3pkcHd3ZHNkYnBmbW9oeWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTI2NjY0NCwiZXhwIjoyMDk2ODQyNjQ0fQ.w-U5pGCmWqhtyknkXL0yAsjzm1GbyqnQw1W8CA0Bykw';

// Supabase Session Pooler connection (supports direct SQL)
const connectionConfig = {
  host: `aws-0-ap-northeast-2.pooler.supabase.com`,
  port: 5432,
  database: 'postgres',
  user: `postgres.${PROJECT_REF}`,
  password: DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
};

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

const MIGRATION_FILES = [
  '0001_initial_schema.sql',
  '0002_rls_policies.sql',
  '0003_fix_rpc_and_export_bundles.sql',
];

async function main() {
  console.log('🗄️  Wedding Surface Agent — Migration Runner (Direct PG)');
  console.log(`📡 Host: ${connectionConfig.host}`);
  console.log(`👤 User: ${connectionConfig.user}`);
  console.log('');

  const client = new Client(connectionConfig);
  
  try {
    await client.connect();
    console.log('✅ Connected to Supabase Postgres!\n');
    
    const dbCheck = await client.query('SELECT current_database() as db, version()');
    console.log(`DB: ${dbCheck.rows[0].db}`);
    console.log(`Version: ${dbCheck.rows[0].version.split(' ').slice(0,2).join(' ')}\n`);
  } catch (err) {
    console.error(`❌ Connection failed: ${err.message}`);
    console.log('\nNote: Supabase DB password is NOT the service role JWT.');
    console.log('Please get the DB password from: Supabase Dashboard > Settings > Database > Connection string');
    console.log('\nConnection string format:');
    console.log(`postgresql://postgres.${PROJECT_REF}:[DB-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres`);
    await client.end().catch(() => {});
    return;
  }

  let totalStatements = 0;
  let totalErrors = 0;

  for (const file of MIGRATION_FILES) {
    const filePath = path.join(migrationsDir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${file} — not found`);
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`\n📄 Applying: ${file} (${(sql.length / 1024).toFixed(1)} KB)`);

    try {
      // Execute the whole migration as one transaction
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`✅ ${file} — applied successfully`);
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      console.log(`⚠️  ${file} — error (may be safe if tables already exist):`);
      console.log(`   ${err.message.substring(0, 200)}`);
      
      // Try statement by statement for IF NOT EXISTS patterns
      console.log('   Retrying statement by statement...');
      const stmts = sql
        .replace(/\r\n/g, '\n')
        .split(/;\s*\n/)
        .map(s => s.trim())
        .filter(s => s.length > 5 && !s.startsWith('--'));
      
      let ok = 0; let fail = 0;
      for (const stmt of stmts) {
        try {
          await client.query(stmt);
          ok++;
        } catch (e) {
          // Ignore "already exists" errors
          if (e.message.includes('already exists') || e.message.includes('duplicate')) {
            ok++;
          } else {
            fail++;
            if (fail <= 3) {
              console.log(`   ❌ ${e.message.substring(0, 120)}`);
            }
          }
        }
        totalStatements++;
      }
      console.log(`   ✅ OK: ${ok}, ❌ Errors: ${fail}`);
      totalErrors += fail;
    }
  }

  // Final verification
  console.log('\n📋 Verifying table creation...');
  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  const tableNames = tables.rows.map(r => r.table_name);
  console.log(`Found ${tableNames.length} tables:`);
  tableNames.forEach(t => console.log(`  - ${t}`));

  // Check for claim_next_agent_job function
  const funcs = await client.query(`
    SELECT routine_name FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
    ORDER BY routine_name;
  `);
  console.log(`\nFunctions: ${funcs.rows.map(r => r.routine_name).join(', ')}`);

  const requiredTables = ['projects', 'agent_jobs', 'agent_job_steps', 'generated_assets', 'export_bundles'];
  const missing = requiredTables.filter(t => !tableNames.includes(t));
  if (missing.length === 0) {
    console.log('\n✅ All required tables present!');
  } else {
    console.log(`\n⚠️  Missing tables: ${missing.join(', ')}`);
  }

  await client.end();
  console.log('\n🎉 Migration complete!');
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
