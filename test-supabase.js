// Test file to verify Supabase API keys
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔑 Testing Supabase API Keys...');
console.log('URL:', supabaseUrl);
console.log('Service Role Key (first 20 chars):', serviceRoleKey?.substring(0, 20) + '...');
console.log('Service Role Key (last 20 chars):', serviceRoleKey?.substring(serviceRoleKey.length - 20));
console.log('Service Role Key Length:', serviceRoleKey?.length);
console.log('Anon Key (first 20 chars):', anonKey?.substring(0, 20) + '...');

// Test with service role key
console.log('\n🔗 Testing Service Role Key...');
const supabaseService = createClient(supabaseUrl, serviceRoleKey);

supabaseService
  .from('interview')
  .select('count')
  .then(result => {
    if (result.error) {
      console.error('❌ Service Role Key Failed:', result.error);
    } else {
      console.log('✅ Service Role Key Works!');
      console.log('Interview count:', result.count);
    }
  });

// Test with anon key
console.log('\n🔗 Testing Anon Key...');
const supabaseAnon = createClient(supabaseUrl, anonKey);

supabaseAnon
  .from('interview')
  .select('count')
  .then(result => {
    if (result.error) {
      console.error('❌ Anon Key Failed:', result.error);
    } else {
      console.log('✅ Anon Key Works!');
      console.log('Interview count:', result.count);
    }
  });
