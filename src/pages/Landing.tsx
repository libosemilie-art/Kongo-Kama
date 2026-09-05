import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BookOpen, Flame, ChevronRight, MessageCircle, Scroll, Globe, Heart, ArrowRight, Phone, Facebook, Instagram, Youtube, ChevronUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface LandingProps {
  onNavigate: (page: string) => void;
}

function GeometricPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="kongo-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="40" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="40" cy="40" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <line x1="10" y1="40" x2="70" y2="40" stroke="currentColor" strokeWidth="0.5" />
          <line x1="40" y1="10" x2="40" y2="70" stroke="currentColor" strokeWidth="0.5" />
          <line x1="18" y1="18" x2="62" y2="62" stroke="currentColor" strokeWidth="0.3" />
          <line x1="62" y1="18" x2="18" y2="62" stroke="currentColor" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="400" height="400" fill="url(#kongo-pattern)" />
    </svg>
  );
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

type RevealDirection = 'up' | 'left' | 'right' | 'scale';

function Reveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const dirClass =
    direction === 'left' ? 'reveal-left'
      : direction === 'right' ? 'reveal-right'
        : direction === 'scale' ? 'reveal-scale'
          : '';

  return (
    <div
      ref={ref}
      className={`reveal ${dirClass} ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Landing({ onNavigate }: LandingProps) {
  const { theme } = useTheme();
  const heroRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const courses = [
    {
      title: 'Kilari',
      subtitle: 'Kikongo kia me ntele — Version moderne',
      desc: 'La version contemporaine du Kikongo, langue vivante parlée aujourd\'hui. Fondements, grammaire et expression du Kikongo moderne.',
      division: 'kinkimba',
      icon: <BookOpen className="w-5 h-5" />,
      badge: 'Academie',
    },
    {
      title: 'Kikongo kia mono',
      subtitle: 'Kikongo kia kati — Version royale ancestrale',
      desc: 'La version ancienne et sacrée parlée dans la cour royale du Kongo Dia Ntotela. Langue des grands initiés et des textes sacrés.',
      division: 'kinkimba',
      icon: <Scroll className="w-5 h-5" />,
      badge: 'Academie',
    },
    {
      title: 'Nzila Kongo',
      subtitle: 'Spiritualite Ancestrale',
      desc: 'Initiation a la spiritualite Kongo. Enseignements des ancetres, cosmologie et voie initiatique Kongo.',
      division: 'nzila_kongo',
      icon: <Flame className="w-5 h-5" />,
      badge: 'Temple',
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-stone-950 text-stone-100' : 'bg-stone-50 text-stone-900'}`}>

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative min-h-[min(780px,94vh)] flex items-center justify-center overflow-hidden pt-20 pb-16"
      >
        <div className={`absolute inset-0 ${isDark ? 'bg-stone-950' : 'bg-amber-50'}`} />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/25 via-transparent to-stone-900/50" />
        <div className="absolute inset-0 kongo-grid" />
        <GeometricPattern />

        {/* Halos lumineux animés */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-700/15 rounded-full blur-3xl pointer-events-none animate-glow-pulse animate-delay-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-8 animate-fade-in">
            <KongoSymbol size={16} className="text-amber-400" />
            Ecole d'Eveil de Conscience
          </div>

          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-semibold leading-[0.95] tracking-tight mb-6">
            <span className={isDark ? 'text-amber-50' : 'text-stone-900'}>Kongo</span>
            <span className="text-gold">Kama</span>
          </h1>

          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/60" />
            <KongoSymbol size={24} className="text-amber-500 animate-spin-slow" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/60" />
          </div>

          <p className={`max-w-2xl mx-auto text-base sm:text-xl leading-relaxed mb-10 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
            Apprenez le Kikongo et découvrez la spiritualité Kongo à votre rythme, depuis votre téléphone.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('register')}
              className="btn-gold px-9 py-4 rounded-2xl text-base hover:-translate-y-0.5 shadow-xl shadow-amber-900/30"
            >
              Commencer le voyage
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('login')}
              className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-sm ${
                isDark
                  ? 'border-stone-700 bg-stone-900/40 text-stone-300 hover:border-amber-500/50 hover:text-amber-400'
                  : 'border-stone-300 bg-white/60 text-stone-600 hover:border-amber-400 hover:text-amber-600'
              }`}
            >
              Se connecter
            </button>
          </div>

          <Reveal direction="scale" delay={150} className="mt-14">
            <div className={`grid grid-cols-3 gap-3 sm:gap-8 max-w-lg mx-auto rounded-2xl border p-4 sm:p-5 backdrop-blur-sm ${
              isDark ? 'bg-stone-900/60 border-stone-800' : 'bg-white/70 border-amber-100 shadow-card'
            }`}>
              {[
                { value: '2', label: 'Divisions' },
                { value: '4', label: 'Cours' },
                { value: 'infini', label: 'Eveil' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-3xl font-semibold text-gold">{stat.value}</div>
                  <div className={`text-xs mt-1 uppercase tracking-wider ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <div className={`w-px h-8 ${isDark ? 'bg-stone-700' : 'bg-stone-300'}`} />
          <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-stone-600' : 'bg-stone-400'}`} />
        </div>
      </section>

      {/* PRESENTATION - EXACT TEXT */}
      <section className={`py-24 px-4 ${isDark ? 'bg-stone-900/50' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 text-amber-500 text-xs font-semibold uppercase tracking-widest mb-8">
              Presentation
            </div>

            <div className={`prose prose-lg max-w-none ${isDark ? 'prose-invert' : ''}`}>
              <h2 className={`font-display text-4xl sm:text-5xl font-semibold mb-6 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
                Kongo <span className="text-gold">Kama</span>
              </h2>

              <p className={`text-base leading-relaxed mb-6 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                Kongo Kama est une ecole qui enseigne <strong className="text-amber-500">la Kongologie</strong>. La <strong className="text-amber-500">Kongologie</strong> est un concept invente par <strong className={isDark ? 'text-stone-100' : 'text-stone-800'}>Mbuta Sita Toma</strong> un spirituel, panafricaniste, fondamentaliste et Kamite Kongo, enseignant le Kikongo et instructeur du <strong className="text-amber-500">Bukongo</strong> (philosophie Kongo).
              </p>

              <p className={`text-base leading-relaxed mb-8 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                <strong className={isDark ? 'text-stone-100' : 'text-stone-800'}>Kongo Kama</strong> est une ecole d'eveil de conscience de l'homme Negro-Africain en particulier et de l'humain en generale. Elle est divisee en deux specialites a savoir, <strong className="text-amber-500">le temple et l'academie.</strong>
              </p>

              <div className="flex items-center justify-center gap-4 my-10">
                <div className="h-px w-20 bg-gradient-to-r from-transparent to-amber-500/40" />
                <KongoSymbol size={20} className="text-amber-500/50" />
                <div className="h-px w-20 bg-gradient-to-l from-transparent to-amber-500/40" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TEMPLE - NZILA KONGO - EXACT TEXT */}
      <section id="nzila" className="py-24 px-4 relative overflow-hidden">
        <div className={`absolute inset-0 ${isDark ? 'bg-stone-950' : 'bg-stone-50'}`} />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/10 to-transparent" />
        <GeometricPattern />

        <div className="relative z-10 max-w-5xl mx-auto">
          <Reveal>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
                <Flame className="w-3 h-3" />
                1) Le Temple
              </div>
              <h2 className={`font-display text-5xl sm:text-6xl font-semibold mb-3 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
                Nzila <span className="text-gold">Kongo</span>
              </h2>
              <p className={`text-lg ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                La voie initiatique Kongo, la voie de Dieu
              </p>
            </div>

            <div className={`space-y-6 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              <p className="text-base leading-relaxed">
                Le temple s'appelle <strong className="text-amber-500">Nzila Kongo</strong> la voie initiatique Kongo, la voie de Dieu, <strong className="text-amber-500">Nzila</strong> signifie le chemin, la voie ou la route, et <strong className="text-amber-500">Kongo</strong>, du verbe <em>Kukongodila</em> et de son diminutif le verbe <em>Kukonga</em>, rassembler pour proteger, pour garder ou pour conserver.
              </p>

              <p className="text-base leading-relaxed">
                <strong className="text-amber-500">Kongo</strong> signifie <strong>Amour</strong>, <strong className="text-amber-500">Kongo</strong> signifie <strong>Dieu d'amour</strong>, <strong className="text-amber-500">Kongo</strong> signifie <strong>Dieu</strong>.
              </p>

              <div className={`rounded-2xl p-6 border-l-4 border-amber-500 ${isDark ? 'bg-amber-950/20 border border-amber-800/20' : 'bg-amber-50 border border-amber-200'}`}>
                <p className="text-base leading-relaxed">
                  Le temple <strong className="text-amber-500">Nzila Kongo</strong> enseigne la spiritualite Kongo ancestrale qui est le rescape de celle de l'Egypte pharaonique enseignee dans les Egyptiens qui a fini par eclairer le monde. Celle de Kongo Dia Ntotela se dispensait dans des <strong className={isDark ? 'text-stone-200' : 'text-stone-700'}>Makabana</strong>, des monasteres que les colonisateurs occidentaux et les pretres de l'eglise chretienne ont detruit.
                </p>
              </div>

              <div className="mt-8">
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                  La mission de Nzila Kongo consiste a :
                </h3>
                <ul className="space-y-3">
                  {[
                    'Former des inities du temples Kongo en spiritualite globalisee des anciennes ecoles initiatiques de la nation Kongo ;',
                    'Former des pretres, des guides, des gardiens des temples de Nzila Kongo a travers le monde ;',
                    'Eduquer des citoyens d\'Afrique et du monde selon la vision de Ne MUANDA KONGO dont la premiere experience etait le royaume Kongo Dia Ntotela.',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0 shadow-glow-sm" />
                      <span className="text-base leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onNavigate('register')}
                className="mt-8 btn-gold px-6 py-3 rounded-xl hover:-translate-y-0.5 shadow-lg shadow-amber-900/20"
              >
                Rejoindre le Temple <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ACADEMIE - KINKIMBA - EXACT TEXT */}
      <section id="kinkimba" className={`py-24 px-4 ${isDark ? 'bg-stone-900/40' : 'bg-white'}`}>
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
                <BookOpen className="w-3 h-3" />
                2) Academie
              </div>
              <h2 className={`font-display text-5xl sm:text-6xl font-semibold mb-3 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
                <span className="text-gold">Kinkimba</span>
              </h2>
              <p className={`text-lg ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                La faculte des sciences Kongo sacrees
              </p>
            </div>

            <div className={`space-y-6 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              <p className="text-base leading-relaxed">
                En Kikongo l'academie se dit <strong className="text-amber-500">Kinkimba</strong> tandis que l'ecole superieur ou l'universite se dit <strong className="text-amber-500">Kinsasa</strong> (qui est le nom Kongo de la ville capitale de la republique democratique du Congo Kinshasa).
              </p>

              <p className="text-base leading-relaxed">
                <strong className={isDark ? 'text-stone-200' : 'text-stone-700'}>Kinkimba</strong> est le nom de la faculte ou de la specialite de l'ecole <strong className="text-amber-500">Kongo Kama</strong> qui traite et enseigne la <strong className="text-amber-500">Kongologie</strong> en dehors de sujets spirituels. Pendant que Nzila Kongo enseigne la spiritualite ancestrale Kongo en version moderne, Kinkimba enseigne les autres sciences Kongo sacrees qui ne font pas intervenir des rituels du temple : histoire, l'ecriture madombe, le Kikongo, la geographie, la sociologie, anthropologie, politique, droits (justice), ecologie, etc... La philosophie Kongo en bref.
              </p>

              <div className={`rounded-2xl p-6 mt-8 ${isDark ? 'bg-stone-800/50 border border-stone-700' : 'bg-amber-50 border border-amber-200'}`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                  Pourquoi toutes les sciences Kinkimba precitees sont-elles dites sciences sacrees, contrairement a d'autres contextes ?
                </h3>

                <p className="text-base leading-relaxed mb-6">
                  Toutes les sciences humaines existaient dans le Royaume de Kongo Dia Ntotela, globalisees et enseignees sous le nom de <strong className="text-amber-500">Bukongo</strong> ou <strong className="text-amber-500">Kiyindou Kia Kongo</strong>, la philosophie Kongo. Ces sciences ont ete ecrites ou reflecchies par des grands inities du temple et dictees en partie par l'archange Ne MUANDA KONGO. Elles sont toutes sacrees, aucune d'elle n'est fruit d'un profane.
                </p>

                <p className="text-base leading-relaxed mb-4">
                  Pour un seul exemple illustratif, l'etendue du territoire du Kongo Dia Ntotela comprenait trois grandes terres appelees <strong className="text-amber-500">Makuku Matatu</strong>. Ces trois terres piliers avec des missions mystiques, physiques et specifiques chacune, representaient :
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    'Les trois corps de l\'etre humain ;',
                    'Les trois caracteristiques de l\'etre celeste (trois pouvoirs de Dieu) ;',
                    'Les trois patriarches Kongo ;',
                    'Les trois lignees meres des Bakongo ;',
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-colors hover:border-amber-300/40 ${
                        isDark ? 'bg-stone-900/50 border border-stone-800' : 'bg-white border border-amber-100'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                <p className={`text-base mt-4 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  Les trois sciences meres.
                </p>
              </div>

              <button
                onClick={() => onNavigate('register')}
                className="mt-8 btn-gold px-6 py-3 rounded-xl hover:-translate-y-0.5 shadow-lg shadow-amber-900/20"
              >
                Rejoindre l'Academie <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* COURSES */}
      <section id="courses" className="py-24 px-4 relative overflow-hidden">
        <div className={`absolute inset-0 ${isDark ? 'bg-stone-950' : 'bg-stone-50'}`} />
        <div className="absolute inset-0 kongo-grid" />
        <GeometricPattern />

        <div className="relative z-10 max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 text-amber-500 text-xs font-semibold uppercase tracking-widest mb-4">
              Nos Cours
            </div>
            <h2 className={`font-display text-4xl sm:text-5xl font-semibold ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              Choisissez votre <span className="text-gold">Voie</span>
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {courses.map((course, i) => (
              <Reveal key={i} delay={i * 120}>
                <div
                  className={`group relative h-full rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-2 hover:shadow-card ${
                    course.division === 'nzila_kongo'
                      ? isDark
                        ? 'bg-amber-950/30 border-amber-800/30 hover:border-amber-600/50 hover:shadow-glow-sm'
                        : 'bg-amber-50 border-amber-200 hover:border-amber-400 hover:shadow-glow-sm'
                      : isDark
                        ? 'bg-stone-900/60 border-stone-800 hover:border-stone-600 hover:shadow-stone-900/40'
                        : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-stone-100'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${
                    course.division === 'nzila_kongo'
                      ? 'bg-gradient-to-br from-amber-400/30 to-amber-600/20 text-amber-400'
                      : isDark ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {course.icon}
                  </div>
                  <div className={`text-xs font-semibold uppercase tracking-widest mb-2 ${
                    course.division === 'nzila_kongo' ? 'text-amber-500' : isDark ? 'text-stone-500' : 'text-stone-400'
                  }`}>
                    {course.badge}
                  </div>
                  <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>
                    {course.title}
                  </h3>
                  <p className={`text-xs mb-3 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{course.subtitle}</p>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{course.desc}</p>
                  <button
                    onClick={() => onNavigate('register')}
                    className={`mt-5 text-xs font-semibold flex items-center gap-1 transition-all group-hover:gap-2 ${
                      isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-500'
                    }`}
                  >
                    S'inscrire <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PAYMENT */}
      <section className={`py-24 px-4 ${isDark ? 'bg-stone-900/50' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 text-amber-500 text-xs font-semibold uppercase tracking-widest mb-4">
              Paiement Mobile
            </div>
            <h2 className={`font-display text-4xl sm:text-5xl font-semibold mb-4 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              Paiement <span className="text-gold">Simple et Securise</span>
            </h2>
            <p className={`text-base ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Nous acceptons les paiements Mobile Money africains
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                name: 'MTN Mobile Money',
                color: 'from-yellow-400 to-yellow-600',
                glow: 'hover:shadow-yellow-500/20',
                steps: ['Ouvrez votre app MTN MoMo', 'Envoyez le montant au numero fourni', 'Saisissez votre reference', 'Attendez la validation admin'],
              },
              {
                name: 'Airtel Money',
                color: 'from-red-400 to-red-600',
                glow: 'hover:shadow-red-500/20',
                steps: ['Ouvrez votre app Airtel Money', 'Envoyez le montant au numero fourni', 'Saisissez votre reference', 'Attendez la validation admin'],
              },
            ].map((method, i) => (
              <Reveal key={method.name} direction={i % 2 === 0 ? 'left' : 'right'} delay={i * 120}>
                <div
                  className={`h-full rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card ${
                    isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200'
                  } ${method.glow}`}
                >
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${method.color} text-white font-bold text-sm mb-6 shadow-lg`}>
                    <Phone className="w-4 h-4" />
                    {method.name}
                  </div>
                  <ol className="space-y-3">
                    {method.steps.map((step, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isDark ? 'bg-stone-800 text-amber-400' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {j + 1}
                        </span>
                        <span className={`text-sm ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={150}>
            <div className={`mt-8 rounded-2xl p-6 border-l-4 border-amber-500 ${isDark ? 'bg-amber-950/20 border border-amber-800/20' : 'bg-amber-50 border border-amber-200'}`}>
              <p className={`text-sm ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                <strong className={isDark ? 'text-amber-400' : 'text-amber-600'}>Validation manuelle :</strong>{' '}
                Apres votre paiement, l'administrateur verifie et valide votre acces. Vous recevrez une confirmation et pourrez acceder a vos cours.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className={`py-24 px-4 relative overflow-hidden ${isDark ? 'bg-stone-900/40' : 'bg-amber-50'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <Reveal direction="scale">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-2xl animate-glow-pulse" />
              <KongoSymbol size={56} className="text-amber-500 relative animate-float" />
            </div>
            <h2 className={`font-display text-4xl sm:text-5xl font-semibold mb-4 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              Pret a vous <span className="text-gold">eveiller</span> ?
            </h2>
            <p className={`text-base mb-8 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Rejoignez Kongo Kama et entrez dans la voie de la connaissance Kongo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('register')}
                className="btn-gold px-8 py-4 rounded-2xl hover:-translate-y-0.5 shadow-xl shadow-amber-900/20"
              >
                S'inscrire gratuitement
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="https://wa.me/243000000000"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border font-semibold transition-all hover:-translate-y-0.5 ${
                  isDark
                    ? 'border-stone-700 text-stone-300 hover:border-green-600 hover:text-green-400'
                    : 'border-stone-300 text-stone-600 hover:border-green-500 hover:text-green-600'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                Support WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-16 px-4 relative overflow-hidden">
        <div className={`absolute inset-0 ${isDark ? 'bg-stone-950' : 'bg-white'}`} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: <Flame className="w-5 h-5" />, title: 'Spirituel', desc: 'Ancre dans la tradition Kongo ancestrale' },
              { icon: <BookOpen className="w-5 h-5" />, title: 'Academique', desc: 'Rigueur scientifique et linguistique' },
              { icon: <Globe className="w-5 h-5" />, title: 'Panafricain', desc: 'Pour tous les fils et filles d\'Afrique' },
              { icon: <Heart className="w-5 h-5" />, title: 'Communaute', desc: 'Forums prives et classes interactives' },
            ].map((v, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className={`h-full rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card ${
                  isDark ? 'bg-stone-900/40 border-stone-800' : 'bg-stone-50 border-stone-200'
                }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-110 ${
                    isDark ? 'bg-gradient-to-br from-amber-400/25 to-amber-600/15 text-amber-400' : 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600'
                  }`}>
                    {v.icon}
                  </div>
                  <h3 className={`font-bold text-sm mb-2 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{v.title}</h3>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`relative py-16 px-4 border-t ${isDark ? 'bg-stone-950 border-stone-900' : 'bg-stone-900 border-stone-800'}`}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/kongo-kama-logo.png" alt="KongoKama" className="w-10 h-10 rounded-lg object-cover" />
                <span className="font-display font-semibold text-xl text-amber-50">
                  Kongo<span className="text-gold">Kama</span>.com
                </span>
              </div>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                Ecole d'Eveil de Conscience. Enseignement de la Kongologie, langue Kikongo et spiritualité ancestrale.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-sm font-bold text-amber-50 mb-4 uppercase tracking-wider">Navigation</h4>
              <ul className="space-y-2">
                <li><button onClick={() => onNavigate('home')} className={`text-sm transition-colors ${isDark ? 'text-stone-400 hover:text-amber-400' : 'text-stone-500 hover:text-amber-400'}`}>Accueil</button></li>
                <li><button onClick={() => onNavigate('home#kinkimba')} className={`text-sm transition-colors ${isDark ? 'text-stone-400 hover:text-amber-400' : 'text-stone-500 hover:text-amber-400'}`}>Académie Kinkimba</button></li>
                <li><button onClick={() => onNavigate('home#nzila')} className={`text-sm transition-colors ${isDark ? 'text-stone-400 hover:text-amber-400' : 'text-stone-500 hover:text-amber-400'}`}>Temple Nzila Kongo</button></li>
                <li><button onClick={() => onNavigate('store')} className={`text-sm transition-colors ${isDark ? 'text-stone-400 hover:text-amber-400' : 'text-stone-500 hover:text-amber-400'}`}>Boutique Digitale</button></li>
              </ul>
            </div>

            {/* Social & Contact */}
            <div>
              <h4 className="text-sm font-bold text-amber-50 mb-4 uppercase tracking-wider">Réseaux Sociaux</h4>
              <div className="flex flex-wrap gap-3 mb-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/30">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 flex items-center justify-center text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-900/30">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-900/30">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="https://www.tiktok.com/@kongokama0" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-stone-900/30">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>
                </a>
              </div>
              <a href="https://wa.me/242069254550" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? 'text-green-400 hover:text-green-300' : 'text-green-500 hover:text-green-400'}`}>
                <MessageCircle className="w-4 h-4" />
                Support WhatsApp
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className={`pt-8 border-t ${isDark ? 'border-stone-800' : 'border-stone-800'} flex flex-col sm:flex-row items-center justify-between gap-4`}>
            <p className="text-xs text-stone-600">
              © 2026 KongoKama.com — Kongologie par Mbuta Sita Toma
            </p>
            <div className="flex items-center gap-6">
              <button onClick={() => onNavigate('legal')} className="text-xs text-stone-500 hover:text-amber-400 transition-colors">Mentions Légales</button>
              <button onClick={() => onNavigate('privacy')} className="text-xs text-stone-500 hover:text-amber-400 transition-colors">Confidentialité</button>
              <button onClick={() => onNavigate('login')} className="text-xs text-stone-500 hover:text-amber-400 transition-colors">Connexion</button>
              <button onClick={() => onNavigate('register')} className="text-xs text-stone-500 hover:text-amber-400 transition-colors">S'inscrire</button>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/242069254550"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center shadow-xl shadow-green-900/40 transition-all hover:-translate-y-1 hover:scale-105 z-40"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </a>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center shadow-xl shadow-amber-900/30 transition-all hover:-translate-y-1 hover:scale-105 z-40 text-white animate-scale-in"
          aria-label="Retour en haut"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
