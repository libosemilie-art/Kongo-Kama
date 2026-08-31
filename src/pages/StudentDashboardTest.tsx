import {
  ArrowLeft,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
  PlayCircle,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface StudentDashboardTestProps {
  onNavigate: (page: string) => void;
}

function KongoSymbol({ size = 28, className = '' }: { size?: number; className?: string }) {
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

export default function StudentDashboardTest({ onNavigate }: StudentDashboardTestProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const stats = [
    { label: 'Cours actifs', value: '04', detail: '+1 cette semaine', icon: BookOpen },
    { label: 'Progression', value: '72%', detail: 'Moyenne générale', icon: TrendingUp },
    { label: 'Heures apprises', value: '18h', detail: 'Cette semaine', icon: Clock3 },
  ];

  const courses = [
    {
      title: 'Kikongo moderne',
      teacher: 'Prof. Ndaye Mbuyi',
      progress: 78,
      next: 'Leçon 9 · Grammaire avancée',
      accent: 'amber',
    },
    {
      title: 'Nzila Kongo',
      teacher: 'Maître Luyeye',
      progress: 64,
      next: 'Séance 5 · Rituel de purification',
      accent: 'rose',
    },
    {
      title: 'Bukongo philosophie',
      teacher: 'Prof. Kambayi',
      progress: 86,
      next: 'Atelier 2 · Cosmologie africaine',
      accent: 'emerald',
    },
  ];

  const upcoming = [
    { title: 'Live session', time: 'Mercredi · 18:30', type: 'Zoom' },
    { title: 'Quiz de révision', time: 'Vendredi · 16:00', type: '5 questions' },
    { title: 'Forum de classe', time: 'Samedi · 10:00', type: 'Discussion' },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-stone-950 text-stone-100' : 'bg-stone-100 text-stone-900'}`}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className={`rounded-3xl border p-4 shadow-sm ${isDark ? 'border-stone-800 bg-stone-900/90' : 'border-stone-200 bg-white'}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                <KongoSymbol size={26} className="text-amber-500" />
              </div>
              <div>
                <p className={`text-xs uppercase tracking-[0.2em] ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                  KongoKama
                </p>
                <h1 className="text-xl font-bold">Student Dashboard</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('home')}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${isDark ? 'border-stone-700 text-stone-300 hover:bg-stone-800' : 'border-stone-200 text-stone-700 hover:bg-stone-50'}`}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </button>
              <button className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-700'}`}>
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="mt-8 space-y-8">
          <section className={`overflow-hidden rounded-3xl border p-6 md:p-8 ${isDark ? 'border-stone-800 bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/30' : 'border-stone-200 bg-gradient-to-br from-white via-amber-50 to-stone-100'}`}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-amber-500">Bienvenue</p>
                <h2 className="text-3xl font-bold md:text-4xl">Bonjour, Mamadou</h2>
                <p className={`mt-3 max-w-xl text-sm md:text-base ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Continuez votre apprentissage de la Kongologie, suivez vos progrès, et rejoignez vos classes en cours.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
                  <Flame className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-amber-500">Niveau</div>
                  <div className="text-2xl font-bold">Initié</div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {stats.map(({ label, value, detail, icon: Icon }) => (
              <div key={label} className={`rounded-2xl border p-5 ${isDark ? 'border-stone-800 bg-stone-900' : 'border-stone-200 bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-amber-500">Live</span>
                </div>
                <div className="mt-5 text-3xl font-bold">{value}</div>
                <div className="mt-1 text-sm font-medium">{label}</div>
                <div className={`mt-2 text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{detail}</div>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
            <div className={`rounded-3xl border p-5 ${isDark ? 'border-stone-800 bg-stone-900' : 'border-stone-200 bg-white'}`}>
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold">Mes cours</h3>
                <button className="text-sm font-medium text-amber-500">Voir tout</button>
              </div>

              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.title} className={`rounded-2xl border p-4 ${isDark ? 'border-stone-800 bg-stone-950/60' : 'border-stone-200 bg-stone-50'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`text-xs uppercase tracking-[0.2em] ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                          {course.teacher}
                        </p>
                        <h4 className="mt-1 text-lg font-semibold">{course.title}</h4>
                      </div>
                      <div className={`rounded-full px-2 py-1 text-xs font-semibold ${course.accent === 'amber' ? 'bg-amber-500/10 text-amber-500' : course.accent === 'rose' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {course.progress}%
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className={isDark ? 'text-stone-400' : 'text-stone-500'}>Progression</span>
                        <span className="font-medium text-amber-500">{course.progress}%</span>
                      </div>
                      <div className={`h-2 w-full overflow-hidden rounded-full ${isDark ? 'bg-stone-800' : 'bg-stone-200'}`}>
                        <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400" style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{course.next}</p>
                      <button className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-400">
                        <PlayCircle className="h-3.5 w-3.5" />
                        Continuer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-6">
              <div className={`rounded-3xl border p-5 ${isDark ? 'border-stone-800 bg-stone-900' : 'border-stone-200 bg-white'}`}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold">À venir</h3>
                  <CalendarDays className="h-5 w-5 text-amber-500" />
                </div>

                <div className="space-y-3">
                  {upcoming.map((item) => (
                    <div key={item.title} className={`rounded-2xl border p-3 ${isDark ? 'border-stone-800 bg-stone-950/60' : 'border-stone-200 bg-stone-50'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">{item.title}</div>
                          <div className={`mt-1 text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{item.time}</div>
                        </div>
                        <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-500">
                          {item.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`rounded-3xl border p-5 ${isDark ? 'border-stone-800 bg-stone-900' : 'border-stone-200 bg-white'}`}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Récap</h3>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Quiz validés', value: '12/15' },
                    { label: 'Présences', value: '91%' },
                    { label: 'Points', value: '1,480' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between border-b border-dashed pb-2 last:border-b-0 last:pb-0">
                      <span className={isDark ? 'text-stone-400' : 'text-stone-500'}>{row.label}</span>
                      <span className="font-semibold">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </section>

          <section className={`rounded-3xl border p-5 ${isDark ? 'border-stone-800 bg-stone-900' : 'border-stone-200 bg-white'}`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className={`text-xs uppercase tracking-[0.2em] ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>Quick actions</p>
                <h3 className="text-lg font-bold">Accès rapide</h3>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-400">
                  <Users className="h-4 w-4" />
                  Rejoindre un groupe
                </button>
                <button className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${isDark ? 'border-stone-700 text-stone-300 hover:bg-stone-800' : 'border-stone-200 text-stone-700 hover:bg-stone-50'}`}>
                  <BookOpen className="h-4 w-4" />
                  Mes ressources
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
