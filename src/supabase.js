import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mtcdfdtwyrnxhvsssslg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10Y2RmZHR3eXJueGh2c3Nzc2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNTEwNDYsImV4cCI6MjA4MjcyNzA0Nn0.zqybPtYaQSWPtV0-cGuQwrGuWeB__Ba5WoW3KTQPxt8";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
