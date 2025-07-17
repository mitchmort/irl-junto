#!/usr/bin/env node

/**
 * Setup Script: Supabase Storage Configuration
 * 
 * This script sets up the profiles storage bucket for avatar uploads.
 * Run this script after setting up your Supabase project.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function setupStorage() {
  console.log('🔧 Setting up Supabase Storage for profile avatars...\n');

  try {
    // Read and execute the migration
    const migrationPath = path.join(__dirname, '../migrations/008_create_profiles_storage_bucket.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Executing storage migration...');
    
    // Split the SQL into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql_statement: statement });
        if (error) {
          console.warn(`⚠️  Statement warning (may be expected): ${error.message}`);
        }
      }
    }

    console.log('✅ Storage migration executed');

    // Verify the bucket was created
    console.log('\n🔍 Verifying storage bucket setup...');
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw new Error(`Failed to list buckets: ${bucketsError.message}`);
    }

    const profilesBucket = buckets.find(bucket => bucket.id === 'profiles');
    
    if (profilesBucket) {
      console.log('✅ Profiles bucket found:', {
        id: profilesBucket.id,
        name: profilesBucket.name,
        public: profilesBucket.public,
        file_size_limit: profilesBucket.file_size_limit,
        allowed_mime_types: profilesBucket.allowed_mime_types
      });
    } else {
      console.error('❌ Profiles bucket not found');
      return;
    }

    // Test upload permissions (optional)
    console.log('\n🧪 Testing storage configuration...');
    
    try {
      // Create a small test file
      const testContent = 'test-avatar-setup';
      const testBlob = new Blob([testContent], { type: 'text/plain' });
      const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
      
      const testPath = `test/setup-verification-${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(testPath, testFile);
        
      if (uploadError) {
        console.warn('⚠️  Upload test failed (this may be expected if not authenticated):', uploadError.message);
      } else {
        console.log('✅ Upload test successful');
        
        // Clean up test file
        await supabase.storage.from('profiles').remove([testPath]);
        console.log('🧹 Test file cleaned up');
      }
    } catch (testError) {
      console.warn('⚠️  Storage test skipped:', testError.message);
    }

    console.log('\n🎉 Storage setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Your profile avatars will be stored in the "profiles" bucket');
    console.log('   2. Users can now upload profile images up to 5MB');
    console.log('   3. Supported formats: JPEG, JPG, PNG, GIF, WebP');
    console.log('   4. Test the functionality by updating a user profile');

  } catch (error) {
    console.error('❌ Storage setup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Verify your Supabase project is active');
    console.error('   2. Check that SUPABASE_SERVICE_ROLE_KEY has admin permissions');
    console.error('   3. Ensure your Supabase project supports Storage');
    process.exit(1);
  }
}

// Run the setup
setupStorage(); 