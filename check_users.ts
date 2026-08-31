import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function check() {
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error) console.error(error);
  else {
    users.users.forEach(u => console.log(u.email, u.user_metadata));
  }
}
check();
