import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (session: any) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.session) {
        onLoginSuccess(data.session);
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Ongeldig e-mailadres of wachtwoord' : err.message || 'Fout bij inloggen');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 selection:bg-[#5b5cf0] selection:text-white">
      <div className="w-full max-w-[1000px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col md:flex-row overflow-hidden min-h-[650px] p-3">
        
        {/* Left Form Side */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12 relative">
          
          <img src="/logo.png" alt="Studio Graaf" className="h-6 object-contain absolute top-8 left-8 md:left-12 opacity-80" />
          
          <div className="max-w-[340px] mx-auto w-full">
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welkom terug <span className="inline-block animate-wave">👋</span></h1>
              <p className="text-sm font-medium text-slate-400">Vul hieronder je gegevens in</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-start gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-5">
              
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-5 py-3.5 border border-slate-200 rounded-full bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5b5cf0]/20 focus:border-[#5b5cf0] transition-all placeholder:text-slate-300 peer"
                  placeholder="E-mailadres"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-slate-300 peer-focus:text-[#5b5cf0] transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-5 py-3.5 border border-slate-200 rounded-full bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5b5cf0]/20 focus:border-[#5b5cf0] transition-all placeholder:text-slate-300 peer"
                  placeholder="Wachtwoord"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-300 hover:text-slate-500 peer-focus:text-[#5b5cf0] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-xl shadow-slate-900/10 active:scale-[0.98]"
              >
                {isLoading ? 'Bezig met inloggen...' : 'Aanmelden'}
              </button>
              
              
            </form>
          </div>
        </div>

        {/* Right Image Side */}
        <div className="hidden md:block w-1/2 relative rounded-[2rem] overflow-hidden bg-slate-100">
          <img 
            src="https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=2564&auto=format&fit=crop" 
            alt="Studio Graaf Digital Agency" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#5b5cf0]/60 to-purple-500/20 mix-blend-multiply"></div>
        </div>

      </div>
    </div>
  );
};
