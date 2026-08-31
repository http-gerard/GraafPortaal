import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface SetPasswordScreenProps {
  onComplete: () => void;
}

export const SetPasswordScreen: React.FC<SetPasswordScreenProps> = ({ onComplete }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Fout bij het instellen van je wachtwoord');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Wachtwoord Ingesteld!</h2>
          <p className="text-slate-500">Je account is nu veilig ingesteld. Je wordt doorgestuurd naar je portaal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#7b68ee]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-[#7b68ee]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welkom!</h1>
          <p className="text-slate-500 text-sm">Stel een veilig wachtwoord in voor je nieuwe account om de registratie te voltooien.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSetPassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Nieuw Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#7b68ee]"
              placeholder="Minimaal 6 karakters"
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || password.length < 6}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#7b68ee] hover:bg-[#6a5ad6] text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Bezig met opslaan...' : 'Wachtwoord Opslaan'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
