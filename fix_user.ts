import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function fix() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find(u => u.email === 'gerardvde@outlook.com');
  if (user) {
    // get a client id to assign
    const { data: clients } = await supabase.from('clients').select('id').limit(1);
    
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { role: 'client', client_id: clients[0].id }
    });
    console.log("Fixed metadata for", user.email);
  }
}
fix();
