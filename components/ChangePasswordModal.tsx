import React, { useState } from 'react';
import { X, Lock, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, XCircle, KeyRound } from 'lucide-react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Funzione di validazione
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

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Visibilità separate
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const passwordValidation = validatePassword(newPassword);
  const isPasswordValid = passwordValidation.strength >= 4;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
        toast.error("La nuova password non è abbastanza sicura");
        return;
    }

    setLoading(true);
    try {
      // 1. Recuperiamo l'email dell'utente
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) throw new Error("Utente non trovato");

      // 2. VERIFICA DI SICUREZZA: Controlliamo la vecchia password
      // Proviamo a fare un login. Se fallisce, la vecchia password è errata.
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword
      });

      if (verifyError) {
        toast.error("La vecchia password non è corretta");
        setLoading(false);
        return;
      }

      // 3. Se la vecchia è giusta, aggiorniamo con la nuova
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      
      toast.success("Password aggiornata con successo!");
      onClose();
      setOldPassword('');
      setNewPassword('');

    } catch (error: any) {
      toast.error("Errore: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Colori barre forza
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
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="flex justify-between items-center mb-6 relative z-10">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="text-emerald-500" size={20} /> Sicurezza Account
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-5 relative z-10">
          
          {/* VECCHIA PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Vecchia Password</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-600" />
                </div>
                <input
                    type={showOld ? "text" : "password"}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-white focus:outline-none focus:border-slate-500 transition-all placeholder-slate-600"
                    placeholder="Inserisci password attuale"
                />
                <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 outline-none"
                >
                    {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
          </div>

          {/* NUOVA PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Nuova Password</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-600" />
                </div>
                <input
                    type={showNew ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all placeholder-slate-600"
                    placeholder="Inserisci nuova password"
                />
                <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 outline-none"
                >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {/* BARRE SICUREZZA */}
            {newPassword && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-1 h-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        level <= passwordValidation.strength ? getStrengthColor() : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-400 flex justify-between">
                  Sicurezza: 
                  <span className={`font-bold ${
                    passwordValidation.strength >= 4 ? 'text-emerald-400' : 
                    passwordValidation.strength === 3 ? 'text-blue-400' :
                    'text-yellow-400'
                  }`}>
                    {getStrengthText()}
                  </span>
                </p>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading || !isPasswordValid || !oldPassword}
            className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all
                ${isPasswordValid && oldPassword
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`
            }
          >
            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
            Conferma Modifiche
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;