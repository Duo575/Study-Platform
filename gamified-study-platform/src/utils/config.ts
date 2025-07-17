// Environment configuration

interface Config {
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  geminiApiKey: string;
  environment: 'development' | 'production' | 'test';
  enableDevTools: boolean;
}

// Default configuration for development
const defaultConfig: Config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  environment: (import.meta.env.MODE as Config['environment']) || 'development',
  enableDevTools: import.meta.env.DEV || false,
};

export const config = defaultConfig;

// Validation function to ensure required environment variables are set
export function validateConfig(): void {
  const requiredVars = [
    { key: 'VITE_SUPABASE_URL', value: config.supabaseUrl },
    { key: 'VITE_SUPABASE_ANON_KEY', value: config.supabaseAnonKey },
  ];

  const missingVars = requiredVars.filter(({ value }) => !value);

  if (missingVars.length > 0 && config.environment !== 'development') {
    console.warn(
      'Missing required environment variables:',
      missingVars.map(({ key }) => key).join(', ')
    );
  }
}

// Initialize config validation
validateConfig();