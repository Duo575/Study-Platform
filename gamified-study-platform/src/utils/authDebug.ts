// Authentication debugging utility
import { supabase } from '../lib/supabase';

export const debugAuth = async () => {
  console.log('🔍 Debugging Authentication...');

  try {
    // Test 1: Check Supabase connection
    console.log('1. Testing Supabase connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('_health')
      .select('*')
      .limit(1);

    if (healthError) {
      console.log('❌ Supabase connection issue:', healthError);
    } else {
      console.log('✅ Supabase connected successfully');
    }

    // Test 2: Check current session
    console.log('2. Checking current session...');
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();
    console.log('Session:', session);
    if (sessionError) {
      console.log('❌ Session error:', sessionError);
    }

    // Test 3: Check auth configuration
    console.log('3. Auth configuration:');
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Anon Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

    return {
      connectionOk: !healthError,
      sessionOk: !sessionError,
      configOk: !!(
        import.meta.env.VITE_SUPABASE_URL &&
        import.meta.env.VITE_SUPABASE_ANON_KEY
      ),
    };
  } catch (error) {
    console.error('❌ Debug failed:', error);
    return {
      connectionOk: false,
      sessionOk: false,
      configOk: false,
      error,
    };
  }
};

// Simple test sign-in function
export const testSignIn = async (email: string, password: string) => {
  console.log('🧪 Testing sign-in with:', email);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Sign-in error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Sign-in successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Sign-in exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Create a test user
export const createTestUser = async () => {
  const testEmail = 'test@studyquest.com';
  const testPassword = 'TestPass123!';

  console.log('🧪 Creating test user:', testEmail);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          username: 'testuser',
        },
      },
    });

    if (error) {
      console.error('❌ Sign-up error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Test user created:', data);
    return {
      success: true,
      data,
      credentials: { email: testEmail, password: testPassword },
    };
  } catch (error) {
    console.error('❌ Sign-up exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
