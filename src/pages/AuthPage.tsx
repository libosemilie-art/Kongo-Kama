import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Sun, Moon, KeyRound } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface AuthPageProps {
  mode: 'login' | 'register' | 'reset';
  onNavigate: (page: string) => void;
}

type View = 'login' | 'register' | 'forgot' | 'reset';

export default function AuthPage({ mode, onNavigate }: AuthPageProps) {
  const { theme, toggleTheme } = useTheme();
  const { signIn, signUp, resetPassword, updatePassword } = useAuth();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [forgot, setForgot] = useState(false);

  // Effective view: 'forgot' is a sub-state of 'login'
  const view: View = mode === 'reset' ? 'reset' : forgot ? 'forgot' : mode;

  const heading =
    view === 'login' ? 'Bienvenue'
      : view === 'register' ? 'Créer un compte'
        : view === 'forgot' ? 'Mot de passe oublié'
          : 'Nouveau mot de passe';

  const subtitle =
    view === 'login' ? 'Connectez-vous à votre espace Kongo Kama'
      : view === 'register' ? 'Rejoignez l\'école de la Kongologie'
        : view === 'forgot' ? 'Entrez votre adresse email pour recevoir un lien de réinitialisation'
          : 'Choisissez un nouveau mot de passe sécurisé';

  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
    isDark
      ? 'bg-stone-900 border-stone-700 text-stone-100 placeholder-stone-500 focus:border-amber-500/50'
      : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-400'
  }`;

  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-stone-300' : 'text-stone-700'}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (view === 'login') {
        const { error } = await signIn(email, password);
        if (error) setError('Email ou mot de passe incorrect.');
      } else if (view === 'register') {
        if (!fullName.trim()) {
          setError('Veuillez entrer votre nom complet.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          const message = error.message.toLowerCase();
          if (message.includes('already') || message.includes('déjà') || message.includes('already registered')) {
            setError('Cette adresse email est déjà utilisée. Connectez-vous ou utilisez une autre adresse.');
          } else if (message.includes('password')) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
          } else if (message.includes('email')) {
            setError('Veuillez vérifier que votre adresse email est correcte.');
          } else {
            setError('Inscription impossible pour le moment. Vérifiez votre connexion puis réessayez.');
          }
        } else {
          setSuccess('Compte créé avec succès ! Vous allez être redirigé vers votre espace.');
        }
      } else if (view === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setError('Impossible d\'envoyer le lien. Vérifiez votre adresse email puis réessayez.');
        } else {
          setSuccess('Un lien de réinitialisation a été envoyé à votre adresse email. Vérifiez votre boîte de réception (et vos spams).');
        }
      } else if (view === 'reset') {
        if (password.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Les deux mots de passe ne correspondent pas.');
          setLoading(false);
          return;
        }
        const { error } = await updatePassword(password);
        if (error) {
          setError('Ce lien de réinitialisation a déjà été utilisé ou a expiré. Demandez un nouveau lien via « Mot de passe oublié ».');
        } else {
          setSuccess('Mot de passe modifié avec succès ! Vous pouvez maintenant vous connecter.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const renderFields = () => {
    if (view === 'forgot') {
      return (
        <div>
          <label className={labelClass}>Adresse email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
            autoFocus
            className={inputClass}
          />
        </div>
      );
    }

    if (view === 'reset') {
      return (
        <>
          <div>
            <label className={labelClass}>Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoFocus
                className={`${inputClass} pr-12`}
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
          <div>
            <label className={labelClass}>Confirmer le mot de passe</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className={inputClass}
            />
          </div>
        </>
      );
    }

    return (
      <>
        {view === 'register' && (
          <div>
            <label className={labelClass}>Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Votre nom complet"
              required
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label className={labelClass}>Adresse email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
            className={inputClass}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={`text-sm font-medium ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>Mot de passe</label>
            {view === 'login' && (
              <button
                type="button"
                onClick={() => { setForgot(true); setError(''); setSuccess(''); }}
                className={`text-xs font-medium transition-colors ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-500'}`}
              >
                Mot de passe oublié ?
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className={`${inputClass} pr-12`}
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
      </>
    );
  };

  const submitLabel =
    loading ? 'Chargement...'
      : view === 'login' ? 'Se connecter'
        : view === 'register' ? 'Créer mon compte'
          : view === 'forgot' ? 'Envoyer le lien'
            : 'Modifier le mot de passe';

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-stone-950' : 'bg-stone-50'}`}>
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Changer de theme"
        className={`fixed top-4 right-4 z-50 p-2.5 rounded-xl border backdrop-blur-sm transition-colors ${
          isDark
            ? 'bg-stone-900/70 border-stone-700 text-stone-300 hover:text-amber-400 hover:border-amber-500/40'
            : 'bg-white/70 border-stone-200 text-stone-600 hover:text-amber-600 hover:border-amber-400'
        }`}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950" />
        <div className="absolute inset-0 kongo-grid" />
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="auth-kongo-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="40" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="40" cy="40" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <line x1="10" y1="40" x2="70" y2="40" stroke="currentColor" strokeWidth="0.5" />
              <line x1="40" y1="10" x2="40" y2="70" stroke="currentColor" strokeWidth="0.5" />
              <line x1="18" y1="18" x2="62" y2="62" stroke="currentColor" strokeWidth="0.3" />
              <line x1="62" y1="18" x2="18" y2="62" stroke="currentColor" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="400" height="400" fill="url(#auth-kongo-pattern)" />
        </svg>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber-700/15 rounded-full blur-3xl pointer-events-none animate-glow-pulse animate-delay-500" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-2xl animate-glow-pulse" />
            <img src="/kongo-kama-logo.png" alt="KongoKama" className="relative w-20 h-20 rounded-2xl object-cover drop-shadow-2xl" />
          </div>
          <h1 className="font-display text-5xl font-semibold text-amber-50 text-center mb-4">
            Kongo<span className="text-gold">Kama</span>
          </h1>
          <p className="text-stone-300 text-center text-base leading-relaxed max-w-xs mb-2">
            Entrez dans la voie de la connaissance ancestrale Kongo
          </p>
          <p className="text-amber-400/70 text-center text-sm italic mb-8">
            « Kukonga » — Rassembler pour protéger
          </p>
          <div className="space-y-4 w-full max-w-xs">
            {[
              { label: 'Langue Kikongo', desc: 'Apprenez la langue sacrée du Royaume Kongo' },
              { label: 'Spiritualité Nzila Kongo', desc: 'La voie initiatique ancestrale' },
              { label: 'Philosophie Bukongo', desc: 'La kongologie de Mbuta Sita Toma' },
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
            onClick={() => { setForgot(false); setError(''); setSuccess(''); onNavigate('home'); }}
            className={`flex items-center gap-2 text-sm mb-8 transition-colors ${isDark ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>

          {/* Logo mobile */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <img src="/kongo-kama-logo.png" alt="KongoKama" className="w-8 h-8 rounded-lg object-cover" />
            <span className={`font-display font-semibold text-xl ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              Kongo<span className="text-gold">Kama</span>
            </span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            {view === 'forgot' || view === 'reset' ? (
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
                <KeyRound className="w-5 h-5" />
              </div>
            ) : null}
            <h2 className={`font-display text-3xl font-semibold ${isDark ? 'text-stone-50' : 'text-stone-900'}`}>
              {heading}
            </h2>
          </div>
          <p className={`text-sm mb-8 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            {subtitle}
          </p>

          {success && view === 'reset' ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-green-400" />
              </div>
              <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>{success}</p>
              <button
                onClick={() => onNavigate('login')}
                className="btn-gold w-full py-3.5 rounded-xl text-sm shadow-lg shadow-amber-900/20 hover:-translate-y-0.5"
              >
                Se connecter
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {renderFields()}

              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && view === 'forgot' && (
                <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm leading-relaxed">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full py-3.5 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-lg shadow-amber-900/20 hover:-translate-y-0.5 disabled:translate-y-0"
              >
                {submitLabel}
              </button>
            </form>
          )}

          {view === 'forgot' ? (
            <p className="text-center text-sm mt-6">
              <button
                onClick={() => { setForgot(false); setError(''); setSuccess(''); }}
                className={`text-amber-500 hover:text-amber-400 font-medium ${isDark ? '' : ''}`}
              >
                ← Retour à la connexion
              </button>
            </p>
          ) : view !== 'reset' && (
            <p className={`text-center text-sm mt-6 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
              {view === 'login' ? (
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
          )}
        </div>
      </div>
    </div>
  );
}
