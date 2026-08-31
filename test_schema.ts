import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function check() {
  const { data, error } = await supabase.from('quotes').select('*').limit(1);
  if (error) {
    console.error("Error fetching quotes:", error.message);
    return;
  }
  if (data && data.length > 0) {
    console.log("Quotes table columns:", Object.keys(data[0]));
  } else {
    console.log("Quotes table is empty.");
  }
}
check();
