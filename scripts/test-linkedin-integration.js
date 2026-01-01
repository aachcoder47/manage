import { createClient } from '@supabase/supase-js';

// Test database connection and table structure
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.log('❌ Missing Supabase credentials');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test 1: Check if job_board_integrations table exists
    console.log('📋 Checking job_board_integrations table...');
    const { data: integrations, error: integrationError } = await supabase
      .from('job_board_integrations')
      .select('*')
      .eq('platform', 'linkedin')
      .limit(5);
    
    if (integrationError) {
      console.error('❌ Error accessing job_board_integrations:', integrationError);
    } else {
      console.log('✅ LinkedIn integrations found:', integrations?.length || 0);
      integrations?.forEach((integration, index) => {
        console.log(`  ${index + 1}. ID: ${integration.id}, Status: ${integration.status}, Created: ${integration.created_at}`);
      });
    }
    
    // Test 2: Check if external_job_posting table exists
    console.log('📋 Checking external_job_posting table...');
    const { data: postings, error: postingError } = await supabase
      .from('external_job_posting')
      .select('*')
      .eq('platform', 'linkedin')
      .limit(5);
    
    if (postingError) {
      console.error('❌ Error accessing external_job_posting table:', postingError);
    } else {
      console.log('✅ LinkedIn postings found:', postings?.length || 0);
      postings?.forEach((posting, index) => {
        console.log(`  ${index + 1}. Job ID: ${posting.job_id}, Status: ${posting.posting_status}, URL: ${posting.external_job_url}`);
      });
    }
    
    // Test 3: Check table structure
    console.log('📋 Checking table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'external_job_posting')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (columnsError) {
      console.error('❌ Error checking table structure:', columnsError);
    } else {
      console.log('✅ external_job_posting table structure:');
      columns?.forEach((column) => {
        console.log(`  - ${column.column_name} (${column.data_type}) - Nullable: ${column.is_nullable}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
}

testDatabase();
