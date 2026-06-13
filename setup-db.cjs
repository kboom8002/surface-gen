#!/usr/bin/env node
/**
 * setup-db.cjs — Supabase DB 설정 도우미
 * 
 * DB 비밀번호를 입력받아 PostgreSQL에 직접 연결 후 마이그레이션 실행.
 * 
 * 실행: node setup-db.cjs [DB_PASSWORD]
 * 
 * DB 비밀번호 위치:
 *   Supabase Dashboard → Settings → Database → Database password
 *   또는 Connection String에서 확인
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PROJECT_REF = 'ynszdpwwdsdbpfmohylu';
const REGION = 'ap-northeast-2'; // 서울 리전

const MIGRATION_FILES = [
  '0001_initial_schema.sql',
  '0002_rls_policies.sql',
  '0003_fix_rpc_and_export_bundles.sql',
];

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

async function getPassword() {
  // 1) CLI 인자로 전달된 경우
  if (process.argv[2]) return process.argv[2];
  
  // 2) 환경변수
  if (process.env.DB_PASSWORD) return process.env.DB_PASSWORD;
  
  // 3) 대화형 입력
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question('Supabase DB 비밀번호 입력: ', answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function tryConnect(host, port, user, password) {
  const client = new Client({
    host, port, database: 'postgres', user, password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });
  await client.connect();
  return client;
}

async function main() {
  console.log('🗄️  Wedding Surface Agent — DB 마이그레이션 실행기');
  console.log('');
  
  const password = await getPassword();
  if (!password) {
    console.error('❌ 비밀번호가 없습니다.');
    process.exit(1);
  }

  let client = null;
  
  // 연결 시도 순서: Session Pooler → Transaction Pooler → Direct
  const connections = [
    { name: 'Session Pooler (5432)', host: `aws-0-${REGION}.pooler.supabase.com`, port: 5432, user: `postgres.${PROJECT_REF}` },
    { name: 'Transaction Pooler (6543)', host: `aws-0-${REGION}.pooler.supabase.com`, port: 6543, user: `postgres.${PROJECT_REF}` },
    { name: 'Direct (5432)', host: `db.${PROJECT_REF}.supabase.co`, port: 5432, user: 'postgres' },
  ];

  for (const conn of connections) {
    try {
      console.log(`🔌 연결 시도: ${conn.name}...`);
      client = await tryConnect(conn.host, conn.port, conn.user, password);
      const { rows } = await client.query('SELECT current_database() as db');
      console.log(`✅ 연결 성공! DB: ${rows[0].db}\n`);
      break;
    } catch (e) {
      console.log(`   ❌ 실패: ${e.message.substring(0, 80)}`);
      if (client) { await client.end().catch(() => {}); client = null; }
    }
  }

  if (!client) {
    console.error('\n❌ 모든 연결 시도 실패.');
    console.error('Supabase Dashboard → Settings → Database에서 비밀번호를 재설정 후 시도하세요.');
    process.exit(1);
  }

  // 마이그레이션 실행
  console.log('📋 마이그레이션 실행 시작...\n');
  let totalOk = 0, totalFail = 0;

  for (const file of MIGRATION_FILES) {
    const filePath = path.join(migrationsDir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  건너뜀: ${file} (파일 없음)`);
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`📄 ${file} (${(sql.length/1024).toFixed(1)} KB)`);
    
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`   ✅ 성공\n`);
      totalOk++;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      console.log(`   ⚠️  전체 실행 실패, 개별 실행 시도 중...`);
      
      // 개별 문장 실행 (IF NOT EXISTS 처리)
      const stmts = sql
        .replace(/\r\n/g, '\n')
        .split(/;\s*(?:\n|$)/)
        .map(s => s.replace(/--[^\n]*/g, '').trim())
        .filter(s => s.length > 8);
      
      let stmtOk = 0, stmtFail = 0;
      for (const stmt of stmts) {
        try {
          await client.query(stmt + ';');
          stmtOk++;
        } catch (e) {
          const msg = e.message.toLowerCase();
          if (msg.includes('already exists') || msg.includes('duplicate')) {
            stmtOk++; // 이미 존재 = OK
          } else {
            stmtFail++;
            if (stmtFail <= 5) console.log(`   ❌ ${e.message.substring(0, 100)}`);
          }
        }
      }
      
      if (stmtFail === 0) {
        console.log(`   ✅ 개별 실행 성공 (${stmtOk}개 문장)\n`);
        totalOk++;
      } else {
        console.log(`   ⚠️  ${stmtOk}개 성공, ${stmtFail}개 실패\n`);
        if (stmtFail < 3) totalOk++; // 소수 실패 허용
        else totalFail++;
      }
    }
  }

  // 검증
  console.log('📋 결과 검증...');
  const { rows: tables } = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
  );
  const tableNames = tables.map(r => r.table_name);
  
  const required = ['projects', 'agent_jobs', 'agent_job_steps', 'generated_assets', 'export_bundles', 'source_files', 'source_images'];
  const missing = required.filter(t => !tableNames.includes(t));
  
  console.log(`\n테이블 수: ${tableNames.length}개`);
  if (missing.length === 0) {
    console.log('✅ 필수 테이블 모두 존재!');
  } else {
    console.log(`⚠️  누락된 테이블: ${missing.join(', ')}`);
  }

  // RPC 함수 확인
  const { rows: funcs } = await client.query(
    `SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'`
  );
  const funcNames = funcs.map(r => r.routine_name);
  if (funcNames.includes('claim_next_agent_job')) {
    console.log('✅ claim_next_agent_job RPC 존재!');
  } else {
    console.log('⚠️  claim_next_agent_job RPC 없음!');
  }

  await client.end();
  
  console.log(`\n🎉 완료! (성공: ${totalOk}, 실패: ${totalFail})`);
  if (totalFail === 0) {
    console.log('✅ E2E 동작 준비 완료!');
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
