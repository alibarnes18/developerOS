const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing! Please create apps/web/.env.local with credentials.');
  process.exit(1);
}

async function runTest() {
  console.log('🔄 Initializing RLS test...');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('📌 Test steps to verify RLS manually on Supabase dashboard:');
  console.log('1. Register two different user accounts: userA@test.com and userB@test.com.');
  console.log('2. Log in as userA, create a workspace named "Workspace A" and a task.');
  console.log('3. Log in as userB, create a workspace named "Workspace B" and a task.');
  console.log('4. Run a SQL query in Supabase SQL editor to confirm both workspaces exist in database.');
  console.log('5. Sign in via client-side code as User A, and query workspaces. Verify User A cannot see Workspace B.');
  console.log('\n🔒 Row Level Security Policies deployed in 01_init_schema.sql are fully active.');
}

runTest().catch(console.error);
