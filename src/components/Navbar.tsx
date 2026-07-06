import { useState } from 'react';
import { Menu, X, Sun, Moon, BookOpen } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Accueil', page: 'home' },
    { label: 'Kinkimba', page: 'home#kinkimba' },
    { label: 'Nzila Kongo', page: 'home#nzila' },
    { label: 'Cours', page: 'home#courses' },
  ];

  const handleNav = (page: string) => {
    onNavigate(page);
    setMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      theme === 'dark'
        ? 'bg-stone-950/90 border-b border-amber-900/20'
        : 'bg-white/90 border-b border-amber-200/40'
    } backdrop-blur-xl`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => handleNav('home')} className="flex items-center gap-2.5 group">
            <img src="/logo.svg" alt="KongoKama" className="w-8 h-8 rounded-lg object-cover" />
            <span className={`font-bold text-lg tracking-tight ${theme === 'dark' ? 'text-amber-50' : 'text-stone-900'}`}>
              Kongo<span className="text-amber-500">Kama</span>
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <button
                key={link.page}
                onClick={() => handleNav(link.page)}
                className={`text-sm font-medium transition-colors hover:text-amber-500 ${
                  currentPage === link.page
                    ? 'text-amber-500'
                    : theme === 'dark' ? 'text-stone-300' : 'text-stone-600'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'text-stone-400 hover:text-amber-400 hover:bg-stone-800'
                  : 'text-stone-500 hover:text-amber-600 hover:bg-stone-100'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => handleNav(profile?.role === 'admin' ? 'admin' : 'dashboard')}
                  className="flex items-center gap-2 text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  {profile?.role === 'admin' ? 'Admin' : 'Espace'}
                </button>
                <button
                  onClick={signOut}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200'
                      : 'border-stone-300 text-stone-500 hover:border-stone-400 hover:text-stone-700'
                  }`}
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => handleNav('login')}
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'text-stone-300 hover:text-amber-400'
                      : 'text-stone-600 hover:text-amber-600'
                  }`}
                >
                  Connexion
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-white transition-colors shadow-lg shadow-amber-900/30"
                >
                  S'inscrire
                </button>
              </div>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2 rounded-lg ${theme === 'dark' ? 'text-stone-300' : 'text-stone-600'}`}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={`md:hidden border-t px-4 py-4 space-y-3 ${
          theme === 'dark' ? 'bg-stone-950 border-stone-800' : 'bg-white border-stone-200'
        }`}>
          {navLinks.map(link => (
            <button
              key={link.page}
              onClick={() => handleNav(link.page)}
              className={`block w-full text-left text-sm font-medium py-2 transition-colors hover:text-amber-500 ${
                theme === 'dark' ? 'text-stone-300' : 'text-stone-600'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-stone-800 flex flex-col gap-2">
            {user ? (
              <>
                <button onClick={() => handleNav(profile?.role === 'admin' ? 'admin' : 'dashboard')} className="text-sm font-medium text-amber-500 py-2 text-left">
                  Mon Espace
                </button>
                <button onClick={signOut} className={`text-sm py-2 text-left ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <button onClick={() => handleNav('login')} className={`text-sm font-medium py-2 text-left ${theme === 'dark' ? 'text-stone-300' : 'text-stone-600'}`}>
                  Connexion
                </button>
                <button onClick={() => handleNav('register')} className="text-sm font-semibold py-2 px-4 rounded-lg bg-amber-500 text-white text-center">
                  S'inscrire
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
