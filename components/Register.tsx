import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Mail, Lock, Loader2, ArrowLeft, UserPlus, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

// Funzione per validare password
const validatePassword = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const strength = Object.values(checks).filter(Boolean).length;

  return { checks, strength };
};

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password validation
  const passwordValidation = validatePassword(password);
  const isPasswordValid = passwordValidation.strength >= 4; // Almeno 4/5 requisiti

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Inserisci un'email valida");
      setLoading(false);
      return;
    }

    // Validazione password
    if (!isPasswordValid) {
      setError("La password non soddisfa i requisiti di sicurezza");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          remember_me: rememberMe
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Se remember me è attivo, salva email in localStorage
      if (rememberMe) {
        localStorage.setItem('cryptobot_email', email);
      }
      // Login automatico gestito da App.tsx via onAuthStateChange
      setLoading(false);
    }
  };

  // Password strength color
  const getStrengthColor = () => {
    if (passwordValidation.strength === 0) return 'bg-slate-700';
    if (passwordValidation.strength <= 2) return 'bg-red-500';
    if (passwordValidation.strength === 3) return 'bg-yellow-500';
    if (passwordValidation.strength === 4) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = () => {
    if (passwordValidation.strength === 0) return '';
    if (passwordValidation.strength <= 2) return 'Debole';
    if (passwordValidation.strength === 3) return 'Media';
    if (passwordValidation.strength === 4) return 'Buona';
    return 'Forte';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Decorative bg */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mt-10"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-brand-400 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Crea Account</h1>
          <p className="text-slate-400 text-sm mt-2">Inizia la tua configurazione Trading Bot</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-6 text-center flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5 relative z-10">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-600" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-800 rounded-lg bg-slate-950 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="nome@esempio.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-600" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="block w-full pl-10 pr-10 py-2.5 border border-slate-800 rounded-lg bg-slate-950 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="Min. 8 caratteri"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Bar */}
            {password && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all ${level <= passwordValidation.strength ? getStrengthColor() : 'bg-slate-800'
                        }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-400">
                  Sicurezza: <span className={`font-medium ${passwordValidation.strength >= 4 ? 'text-emerald-400' :
                      passwordValidation.strength === 3 ? 'text-blue-400' :
                        'text-yellow-400'
                    }`}>
                    {getStrengthText()}
                  </span>
                </p>
              </div>
            )}

            {/* Password Requirements */}
            {password && (
              <div className="mt-3 space-y-1.5 text-xs">
                <div className={`flex items-center gap-2 ${passwordValidation.checks.length ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {passwordValidation.checks.length ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  <span>Almeno 8 caratteri</span>
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.checks.uppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {passwordValidation.checks.uppercase ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  <span>Una lettera maiuscola (A-Z)</span>
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.checks.lowercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {passwordValidation.checks.lowercase ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  <span>Una lettera minuscola (a-z)</span>
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.checks.number ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {passwordValidation.checks.number ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  <span>Un numero (0-9)</span>
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.checks.special ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {passwordValidation.checks.special ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  <span>Un carattere speciale (!@#$%...)</span>
                </div>
              </div>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-brand-500 focus:ring-brand-500 focus:ring-offset-slate-900 bg-slate-900"
            />
            <label htmlFor="rememberMe" className="text-sm text-slate-400 cursor-pointer select-none">
              Ricorda la mia email per i prossimi accessi
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-brand-950 bg-white hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Registrati'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Hai già un account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-medium text-brand-400 hover:text-brand-300 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="w-3 h-3 mr-1" /> Torna al Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

