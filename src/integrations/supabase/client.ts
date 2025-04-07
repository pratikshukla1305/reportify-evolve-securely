
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fuittncksqxfvevcbyej.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1aXR0bmNrc3F4ZnZldmNieWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MDY5MzksImV4cCI6MjA1OTI4MjkzOX0.cG7_sMfP_PgD5tIhjcbLtV8kIdCYRhfL9F3bKCUZU2I";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: true // Enable debug logging for auth issues
  },
  db: {
    schema: 'public',
  },
  global: {
    fetch: fetch.bind(globalThis),
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
