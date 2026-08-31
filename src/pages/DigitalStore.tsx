import { useState } from 'react';
import { BookOpen, Video, FileText, Play, ShoppingCart, ExternalLink, Flame, ChevronRight, Search, Filter, Star } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface DigitalStoreProps {
  onNavigate: (page: string) => void;
  initialCategory?: Category;
}

type Category = 'all' | 'conference' | 'cours' | 'livre';

interface DigitalProduct {
  id: string;
  title: string;
  description: string;
  category: 'conference' | 'cours' | 'livre';
  price: number;
  currency: string;
  badge?: string;
  coming_soon?: boolean;
}

function KongoSymbol({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="4" fill="currentColor" />
      <line x1="4" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="1.5" />
      <line x1="24" y1="4" x2="24" y2="44" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function DigitalStore({ onNavigate, initialCategory = 'all' }: DigitalStoreProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeCategory, setActiveCategory] = useState<Category>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  const products: DigitalProduct[] = [
    {
      id: '1',
      title: 'Introduction à la Kongologie',
      description: 'Conférence fondamentale de Mbuta Sita Toma sur les bases de la Kongologie et du Bukongo. Comprendre les origines et les principes de la philosophie Kongo.',
      category: 'conference',
      price: 5000,
      currency: 'FCFA',
      badge: 'Populaire',
    },
    {
      id: '2',
      title: 'Les Mystères du Kikongo kia Mono',
      description: 'Cours approfondi sur le Kikongo sacré, la langue de la cour royale du Kongo Dia Ntotela. Grammaire, prononciation et textes anciens.',
      category: 'cours',
      price: 10000,
      currency: 'FCFA',
      badge: 'Nouveau',
    },
    {
      id: '3',
      title: 'Bukongo — La Philosophie Kongo',
      description: 'Livre numérique complet sur la philosophie Kongo, les trois corps de l\'être, Makuku Matatu et les enseignements ancestraux globalisés.',
      category: 'livre',
      price: 7500,
      currency: 'FCFA',
    },
    {
      id: '4',
      title: 'Nzila Kongo — La Voie Initiatique',
      description: 'Conférence sur la spiritualité Kongo ancestrale, les Makabana (monastères) et le parcours initiatique dans la tradition de Ne MUANDA KONGO.',
      category: 'conference',
      price: 6000,
      currency: 'FCFA',
    },
    {
      id: '5',
      title: 'Ecriture Madombe — Les Fondements',
      description: 'Cours sur l\'écriture sacrée Madombe, son histoire, sa signification et sa pratique dans la tradition Kongo.',
      category: 'cours',
      price: 8000,
      currency: 'FCFA',
      coming_soon: true,
    },
    {
      id: '6',
      title: 'Cosmologie Kongo — L\'Univers Sacré',
      description: 'Livre numérique explorant la cosmologie du Royaume Kongo Dia Ntotela, les forces spirituelles et l\'harmonie entre le visible et l\'invisible.',
      category: 'livre',
      price: 6500,
      currency: 'FCFA',
      coming_soon: true,
    },
  ];

  const categories = [
    { id: 'all' as Category, label: 'Tout', icon: <Star className="w-3.5 h-3.5" /> },
    { id: 'conference' as Category, label: 'Conférences', icon: <Video className="w-3.5 h-3.5" /> },
    { id: 'cours' as Category, label: 'Cours', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'livre' as Category, label: 'Livres', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  const filteredProducts = products.filter(p => {
    const matchCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'conference': return <Video className="w-4 h-4" />;
      case 'cours': return <BookOpen className="w-4 h-4" />;
      case 'livre': return <FileText className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'conference': return 'Conférence';
      case 'cours': return 'Cours';
      case 'livre': return 'Livre';
      default: return cat;
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-stone-950 text-stone-100' : 'bg-stone-50 text-stone-900'}`}>

      {/* HERO */}
      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        <div className={`absolute inset-0 ${isDark ? 'bg-stone-950' : 'bg-amber-50'}`} />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/15 via-transparent to-stone-900/30" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-6">
            <ShoppingCart className="w-3.5 h-3.5" />
            Boutique Digitale
          </div>

          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
            Œuvres <span className="text-amber-500">Digitales</span>
          </h1>
          <p className={`text-base sm:text-lg max-w-2xl mx-auto mb-8 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            Conférences, cours et livres numériques pour approfondir votre connaissance de la Kongologie et de la spiritualité Kongo.
          </p>

          {/* Search */}
          <div className={`max-w-md mx-auto flex items-center gap-2 px-4 py-3 rounded-2xl border ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
            <Search className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-stone-500' : 'text-stone-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher une œuvre..."
              className={`flex-1 bg-transparent text-sm focus:outline-none ${isDark ? 'text-stone-100 placeholder-stone-600' : 'text-stone-900 placeholder-stone-400'}`}
            />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="px-4 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Filter className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-stone-500' : 'text-stone-400'}`} />
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-900/20'
                    : isDark
                      ? 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                      : 'bg-white text-stone-500 hover:text-stone-700 border border-stone-200'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS GRID */}
      <section className="px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          {filteredProducts.length === 0 ? (
            <div className={`rounded-2xl border p-12 text-center ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
              <ShoppingCart className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-stone-700' : 'text-stone-300'}`} />
              <p className={`text-sm ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>Aucun produit trouvé.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className={`group rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    isDark
                      ? 'bg-stone-900 border-stone-800 hover:border-stone-700 hover:shadow-stone-900/40'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-stone-100'
                  }`}
                >
                  {/* Visual placeholder with icon */}
                  <div className={`relative h-44 overflow-hidden ${isDark ? 'bg-gradient-to-br from-amber-900/30 to-stone-900' : 'bg-gradient-to-br from-amber-100 to-amber-50'}`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${isDark ? 'bg-amber-500/20' : 'bg-amber-200'}`}>
                        {getCategoryIcon(product.category)}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold shadow-lg">
                        {product.badge}
                      </div>
                    )}

                    {/* Coming soon overlay */}
                    {product.coming_soon && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="px-4 py-2 rounded-xl bg-amber-500/90 text-white text-sm font-bold">
                          Bientôt disponible
                        </div>
                      </div>
                    )}

                    {/* Category tag */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-sm text-white text-xs font-medium">
                      {getCategoryIcon(product.category)}
                      {getCategoryLabel(product.category)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className={`font-bold text-sm mb-2 line-clamp-2 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>
                      {product.title}
                    </h3>
                    <p className={`text-xs leading-relaxed mb-4 line-clamp-3 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-amber-500">
                        {product.price.toLocaleString()} {product.currency}
                      </div>
                      <button
                        disabled={product.coming_soon}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                          product.coming_soon
                            ? isDark ? 'bg-stone-800 text-stone-600 cursor-not-allowed' : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                            : 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-900/20 hover:-translate-y-0.5'
                        }`}
                      >
                        {product.coming_soon ? (
                          <>Bientôt</>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Acheter
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* INFO SECTION */}
      <section className={`py-16 px-4 ${isDark ? 'bg-stone-900/50' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className={`text-2xl sm:text-3xl font-bold mb-3 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              Comment ça marche ?
            </h2>
            <p className={`text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Achetez et accédez immédiatement à vos œuvres digitales
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Choisissez', desc: 'Sélectionnez la conférence, le cours ou le livre qui vous intéresse.', icon: <ShoppingCart className="w-5 h-5" /> },
              { step: '2', title: 'Payez', desc: 'Effectuez le paiement via Mobile Money (MTN MoMo ou Airtel Money).', icon: <Flame className="w-5 h-5" /> },
              { step: '3', title: 'Accédez', desc: 'Recevez votre contenu digital et accédez-y immédiatement.', icon: <Play className="w-5 h-5" /> },
            ].map(item => (
              <div key={item.step} className={`rounded-2xl p-6 border text-center ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
                  {item.icon}
                </div>
                <h3 className={`font-bold text-sm mb-2 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{item.title}</h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="https://wa.me/242069254550"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border font-semibold text-sm transition-all hover:-translate-y-0.5 ${
                isDark
                  ? 'border-stone-700 text-stone-300 hover:border-green-600 hover:text-green-400'
                  : 'border-stone-300 text-stone-600 hover:border-green-500 hover:text-green-600'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              Commander via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`py-16 px-4 ${isDark ? 'bg-stone-900/40' : 'bg-amber-50'}`}>
        <div className="max-w-3xl mx-auto text-center">
          <KongoSymbol size={40} className="text-amber-500 mx-auto mb-6" />
          <h2 className={`text-2xl sm:text-3xl font-bold mb-3 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
            Envie d'aller plus loin ?
          </h2>
          <p className={`text-sm mb-6 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            Inscrivez-vous à l'école Kongo Kama pour accéder aux cours complets, aux forums et à la communauté.
          </p>
          <button
            onClick={() => onNavigate('register')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-semibold transition-all hover:-translate-y-0.5 shadow-xl shadow-amber-900/20"
          >
            Rejoindre Kongo Kama
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`py-8 px-4 border-t ${isDark ? 'bg-stone-950 border-stone-900' : 'bg-stone-900 border-stone-800'}`}>
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs text-stone-600">
            © 2026 KongoKama.com — Kongologie par Mbuta Sita Toma
          </p>
        </div>
      </footer>
    </div>
  );
}
