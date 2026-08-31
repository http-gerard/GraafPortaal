import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('clients').select('*').limit(1);
  if (error) console.error(error);
  else console.log("CLIENTS:", Object.keys(data[0] || {}));
  
  const { data: contacts, error: err2 } = await supabase.from('contacts').select('*').limit(1);
  if (err2) console.error("NO CONTACTS TABLE");
  else console.log("CONTACTS:", Object.keys(contacts[0] || {}));
}
check();
