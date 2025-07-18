// Quick test script to check Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fbadqlvhcccurycxjdyy.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiYWRxbHZoY2NjdXJ5Y3hqZHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NzE1NDgsImV4cCI6MjA2ODM0NzU0OH0.PIW7k5AX68nrwVrw_l48ISQjLN1r4pg19TyGZrcS6GY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
async function testConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('Supabase connection test:', { data, error });

    // Try to sign up a test user
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';

    console.log('Attempting to create test user...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: testEmail,
        password: testPassword,
      }
    );

    console.log('Sign up result:', { signUpData, signUpError });
  } catch (err) {
    console.error('Connection test failed:', err);
  }
}

testConnection();
