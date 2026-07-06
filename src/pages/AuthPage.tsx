import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface AuthPageProps {
  mode: 'login' | 'register';
  onNavigate: (page: string) => void;
}

function KongoSymbol({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="4" fill="currentColor" />
      <line x1="4" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="1.5" />
      <line x1="24" y1="4" x2="24" y2="44" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function AuthPage({ mode, onNavigate }: AuthPageProps) {
  const { theme } = useTheme();
  const { signIn, signUp } = useAuth();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setError('Email ou mot de passe incorrect.');
        }
        // Navigation handled by App.tsx useEffect based on profile.role
      } else {
        if (!fullName.trim()) {
          setError('Veuillez entrer votre nom complet.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError('Erreur lors de l\'inscription. Cet email est peut-être déjà utilisé.');
        }
        // Navigation handled by App.tsx useEffect based on profile.role
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-stone-950' : 'bg-stone-50'}`}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.pexels.com/photos/3394656/pexels-photo-3394656.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="African heritage"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950/90 via-stone-950/70 to-amber-900/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
          <KongoSymbol size={64} className="text-amber-400 mb-8" />
          <h1 className="text-4xl font-bold text-amber-50 text-center mb-4">
            Kongo<span className="text-amber-400">Kama</span>
          </h1>
          <p className="text-stone-300 text-center text-base leading-relaxed max-w-xs">
            Entrez dans la voie de la connaissance ancestrale Kongo
          </p>
          <div className="mt-8 space-y-4 w-full max-w-xs">
            {[
              { label: 'Langue Kikongo', desc: 'Apprenez la langue sacrée' },
              { label: 'Spiritualité Kongo', desc: 'Initiation ancestrale' },
              { label: 'Philosophie Bukongo', desc: 'Kongologie profonde' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-amber-100">{item.label}</div>
                  <div className="text-xs text-stone-400">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className={`flex-1 flex flex-col items-center justify-center px-6 py-12 ${isDark ? 'bg-stone-950' : 'bg-white'}`}>
        <div className="w-full max-w-md">
          <button
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-2 text-sm mb-8 transition-colors ${isDark ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>

          {/* Logo mobile */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <img src="/logo.svg" alt="KongoKama" className="w-8 h-8 rounded-lg object-cover" />
            <span className={`font-bold text-lg ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              Kongo<span className="text-amber-500">Kama</span>
            </span>
          </div>

          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-stone-50' : 'text-stone-900'}`}>
            {mode === 'login' ? 'Bienvenue' : 'Créer un compte'}
          </h2>
          <p className={`text-sm mb-8 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            {mode === 'login'
              ? 'Connectez-vous à votre espace Kongo Kama'
              : 'Rejoignez l\'école de la Kongologie'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                  Nom complet
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Votre nom complet"
                  required
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                    isDark
                      ? 'bg-stone-900 border-stone-700 text-stone-100 placeholder-stone-500 focus:border-amber-500/50'
                      : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-400'
                  }`}
                />
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                  isDark
                    ? 'bg-stone-900 border-stone-700 text-stone-100 placeholder-stone-500 focus:border-amber-500/50'
                    : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-400'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                    isDark
                      ? 'bg-stone-900 border-stone-700 text-stone-100 placeholder-stone-500 focus:border-amber-500/50'
                      : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 ${isDark ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-amber-900/20 hover:-translate-y-0.5 disabled:translate-y-0"
            >
              {loading
                ? 'Chargement...'
                : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          <p className={`text-center text-sm mt-6 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
            {mode === 'login' ? (
              <>Pas encore de compte ?{' '}
                <button onClick={() => onNavigate('register')} className="text-amber-500 hover:text-amber-400 font-medium">
                  S'inscrire
                </button>
              </>
            ) : (
              <>Déjà un compte ?{' '}
                <button onClick={() => onNavigate('login')} className="text-amber-500 hover:text-amber-400 font-medium">
                  Se connecter
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
