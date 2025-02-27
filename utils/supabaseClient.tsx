import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ixzyqrogubavkaorlqrg.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4enlxcm9ndWJhdmthb3JscXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1ODk3OTcsImV4cCI6MjA1NjE2NTc5N30.SuEJgB-RuroEoHrzJI2f9MWhE8oPEkcU-S9C15uB4M0";

const isClient = typeof window !== "undefined";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: isClient ? AsyncStorage : undefined,
    autoRefreshToken: true,
    persistSession: isClient,
    detectSessionInUrl: false,
  },
});

export default supabase;
