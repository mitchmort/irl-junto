// Test script to verify profile database connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfileConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error connecting to profiles table:', error);
      console.log('📋 Error details:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
    } else {
      console.log('✅ Successfully connected to profiles table');
      console.log('📊 Sample data structure:', data?.[0] || 'No data found');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testProfileConnection();