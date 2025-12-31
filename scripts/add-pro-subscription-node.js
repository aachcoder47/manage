#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function executeSQL() {
  try {
    console.log('🚀 Adding PRO subscription for raviisys@gmail.com');
    
    // Step 1: Find user
    console.log('🔍 Step 1: Finding user...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', 'raviisys@gmail.com')
      .single();
    
    if (userError) {
      console.error('❌ Error finding user:', userError);
      return;
    }
    
    if (!userData) {
      console.error('❌ User not found: raviisys@gmail.com');
      return;
    }
    
    const userId = userData.id;
    console.log(`✅ Found user ID: ${userId}`);
    
    // Step 2: Find organization
    console.log('🔍 Step 2: Finding organization...');
    const { data: orgData, error: orgError } = await supabase
      .from('organization')
      .select('id, name')
      .eq('name', 'Futuristic HR')
      .single();
    
    if (orgError) {
      console.error('❌ Error finding organization:', orgError);
      return;
    }
    
    if (!orgData) {
      console.error('❌ Organization not found: Futuristic HR');
      return;
    }
    
    const orgId = orgData.id;
    console.log(`✅ Found organization ID: ${orgId}`);
    
    // Step 3: Check existing subscription
    console.log('🔍 Step 3: Checking existing subscription...');
    const { data: existingSub, error: subError } = await supabase
      .from('subscription')
      .select('*')
      .eq('organization_id', orgId)
      .single();
    
    if (subError) {
      console.error('❌ Error checking subscription:', subError);
      return;
    }
    
    if (existingSub) {
      console.log('🔄 Existing subscription found, updating...');
      
      const { error: updateError } = await supabase
        .from('subscription')
        .update({
          plan_type: 'pro',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: null,
          trial_end: null,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', orgId);
      
      if (updateError) {
        console.error('❌ Error updating subscription:', updateError);
        return;
      }
      
      console.log('✅ Successfully updated existing subscription to PRO');
    } else {
      console.log('🆕 Creating new PRO subscription...');
      
      // Step 4: Create new subscription
      const { data: newSub, error: createError } = await supabase
        .from('subscription')
        .insert({
          organization_id: orgId,
          user_id: userId,
          plan_type: 'pro',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: null,
          trial_end: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (createError) {
        console.error('❌ Error creating subscription:', createError);
        return;
      }
      
      console.log('✅ Successfully created new PRO subscription');
      console.log('📋 Subscription details:', {
        organization_id: orgId,
        user_id: userId,
        plan_type: 'pro',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: null,
        trial_end: null
      });
    }
    
    // Step 5: Verification
    console.log('🔍 Step 5: Verifying subscription...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('subscription')
      .select('*')
      .eq('organization_id', orgId)
      .eq('plan_type', 'pro')
      .eq('status', 'active')
      .single();
    
    if (verifyError) {
      console.error('❌ Error verifying subscription:', verifyError);
      return;
    }
    
    if (verifyData) {
      console.log('🎉 VERIFICATION SUCCESSFUL!');
      console.log('✅ PRO subscription is now active for user raviisys@gmail.com');
      console.log('📋 Final subscription details:', verifyData);
    } else {
      console.log('❌ Verification failed - subscription not found');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
executeSQL().then(() => {
  console.log('\n🎯 Process completed!');
  console.log('📧 User raviisys@gmail.com should now have PRO access');
  console.log('💰 Features: Unlimited interviews, advanced AI, priority support');
  console.log('\n✨ Check the dashboard to confirm the subscription is active');
}).catch(console.error);
