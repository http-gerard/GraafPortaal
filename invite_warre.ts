import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function invite() {
    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail('warre@studio-graaf.be', {
      data: { name: 'Warre' },
      redirectTo: process.env.APP_URL || 'https://studio-graaf-portaal.onrender.com'
    });
    
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Success:", data);
    }
}
invite();
