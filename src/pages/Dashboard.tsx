import { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Flame, LogOut, Key, CheckCircle, Clock, XCircle,
  ChevronRight, Plus, MessageCircle, Play, Users,
  Sun, Moon, Home, Sparkles, Bell, Lock, Unlock, X
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase, ClassEnrollment, Course, Notification, Class } from '../lib/supabase';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

function KongoSymbol({ size = 32, className = '' }: { size?: number; className?: string }) {
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

type SideTab = 'home' | 'classes' | 'forum' | 'courses';

interface EnrollmentWithClass extends ClassEnrollment {
  classes: {
    id: string;
    name: string;
    description: string;
    access_code: string;
    course_id: string;
    is_active: boolean;
    max_students: number;
    created_at: string;
    courses: Course;
  };
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { theme, toggleTheme } = useTheme();
  const { profile, signOut } = useAuth();
  const isDark = theme === 'dark';

  const [tab, setTab] = useState<SideTab>('home');
  const [enrollments, setEnrollments] = useState<EnrollmentWithClass[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const notifPanelRef = useRef<HTMLDivElement>(null);

  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessResult, setAccessResult] = useState<'idle' | 'success' | 'error' | 'approval_sent'>('idle');
  const [accessMessage, setAccessMessage] = useState('');
  const [approvalClassName, setApprovalClassName] = useState('');

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mtn_momo' | 'airtel_money'>('mtn_momo');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<'idle' | 'success' | 'error'>('idle');

  const [enrollModalCourse, setEnrollModalCourse] = useState<Course | null>(null);
  const [enrollResult, setEnrollResult] = useState<'idle' | 'success' | 'error' | 'approval_sent' | 'no_class'>('idle');
  const [enrollMessage, setEnrollMessage] = useState('');

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!profile) return;
    supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(30)
      .then(({ data }) => { if (data) setNotifications(data as Notification[]); });
  }, [profile?.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target as Node)) setShowNotifPanel(false);
    };
    if (showNotifPanel) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifPanel]);

  const markAllNotifRead = async () => {
    if (!profile) return;
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const loadData = async () => {
    setLoadingData(true);
    const [enrollRes, courseRes, classRes] = await Promise.all([
      supabase.from('class_enrollments').select('*, classes(id, name, description, access_code, courses(*))').order('enrolled_at', { ascending: false }),
      supabase.from('courses').select('*').order('order_index'),
      supabase.from('classes').select('*, courses(*)').eq('is_active', true).order('created_at', { ascending: false }),
    ]);
    if (enrollRes.error) console.error('Error loading enrollments:', enrollRes.error.message);
    if (courseRes.error) console.error('Error loading courses:', courseRes.error.message);
    if (classRes.error) console.error('Error loading classes:', classRes.error.message);
    if (enrollRes.data) setEnrollments(enrollRes.data as unknown as EnrollmentWithClass[]);
    if (courseRes.data) setCourses(courseRes.data);
    if (classRes.data) setAllClasses(classRes.data as unknown as Class[]);
    setLoadingData(false);
  };

  const enrollInCourse = async (course: Course) => {
    if (!profile) {
      setEnrollResult('error');
      setEnrollMessage('Votre profil n\'est pas encore chargé. Patientez un instant et réessayez.');
      return;
    }

    // Always reload classes to ensure we have the latest data
    let classesToSearch = allClasses;
    if (allClasses.length === 0) {
      await loadData();
      // After loadData, allClasses state may not be updated in this closure yet
      // So fetch directly
      const { data: freshClasses } = await supabase
        .from('classes')
        .select('*, courses(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (freshClasses) {
        setAllClasses(freshClasses as unknown as Class[]);
        classesToSearch = freshClasses as unknown as Class[];
      }
    }

    setEnrollResult('idle');
    setEnrollMessage('');

    // Find an active class for this course
    const availableClass = classesToSearch.find(c => c.course_id === course.id && c.is_active);
    if (!availableClass) {
      setEnrollResult('no_class');
      setEnrollMessage('Aucune classe n\'est disponible pour ce cours pour le moment. Contactez votre professeur ou utilisez un code d\'accès.');
      return;
    }

    // Check if already enrolled
    if (enrollments.some(e => e.class_id === availableClass.id)) {
      setEnrollResult('error');
      setEnrollMessage('Vous êtes déjà inscrit à cette classe.');
      return;
    }

    const requiresApproval = course.requires_approval;
    const isFree = course.is_free;

    if (requiresApproval) {
      // Nzila Kongo — send approval request
      const { error } = await supabase.from('class_enrollments').insert({
        class_id: availableClass.id,
        student_id: profile.id,
        payment_status: 'awaiting_approval',
        access_granted: false,
      });
      if (error) {
        setEnrollResult('error');
        setEnrollMessage(error.code === '23505'
          ? 'Vous avez déjà soumis une demande pour ce cours.'
          : `Erreur : ${error.message}`);
      } else {
        setEnrollResult('approval_sent');
        setEnrollMessage(`Votre demande d'inscription à "${availableClass.name}" a été transmise au professeur. Il examinera votre dossier et vous accordera l'accès.`);
        await loadData();
      }
    } else {
      // Kinkimba — create enrollment with pending payment (or free)
      const { error } = await supabase.from('class_enrollments').insert({
        class_id: availableClass.id,
        student_id: profile.id,
        payment_status: isFree ? 'free' : 'pending',
        access_granted: isFree,
      });
      if (error) {
        setEnrollResult('error');
        setEnrollMessage(error.code === '23505'
          ? 'Vous êtes déjà inscrit à cette classe.'
          : `Erreur : ${error.message}`);
      } else {
        setEnrollResult('success');
        setEnrollMessage(`Inscrit à "${availableClass.name}". ${isFree ? 'Accès immédiat !' : 'Vous pouvez maintenant soumettre votre paiement.'}`);
        await loadData();
      }
    }
  };

  const getCourseEnrollmentStatus = (courseId: string): EnrollmentWithClass | null => {
    return enrollments.find(e => e.classes?.courses?.id === courseId) || null;
  };

  const handleAccessCode = async () => {
    if (!accessCode.trim()) return;
    setAccessLoading(true);
    setAccessResult('idle');
    const { data: cls } = await supabase.from('classes').select('*, courses(is_free, requires_approval, division)').eq('access_code', accessCode.trim()).maybeSingle();
    if (!cls) { setAccessResult('error'); setAccessMessage('Code invalide. Verifiez et reessayez.'); setAccessLoading(false); return; }
    if (enrollments.some(e => e.class_id === cls.id)) { setAccessResult('error'); setAccessMessage('Vous etes deja inscrit a cette classe.'); setAccessLoading(false); return; }
    const requiresApproval = cls.courses?.requires_approval ?? false;
    const isFree = cls.courses?.is_free ?? false;
    if (requiresApproval) {
      const { error } = await supabase.from('class_enrollments').insert({ class_id: cls.id, student_id: profile!.id, payment_status: 'awaiting_approval', access_granted: false });
      if (error) { setAccessResult('error'); setAccessMessage(error.code === '23505' ? 'Vous avez déjà soumis une demande pour cette classe.' : `Erreur : ${error.message}`); }
      else { setApprovalClassName(cls.name); setAccessResult('approval_sent'); await loadData(); }
    } else {
      const { error } = await supabase.from('class_enrollments').insert({ class_id: cls.id, student_id: profile!.id, payment_status: isFree ? 'free' : 'pending', access_granted: isFree });
      if (error) { setAccessResult('error'); setAccessMessage(error.code === '23505' ? 'Vous êtes déjà inscrit à cette classe.' : `Erreur : ${error.message}`); }
      else { setAccessResult('success'); setAccessMessage(`Inscrit a "${cls.name}". ${isFree ? 'Acces immediat !' : 'En attente de validation du paiement.'}`); await loadData(); }
    }
    setAccessLoading(false);
  };

  const [paymentError, setPaymentError] = useState('');

  const submitPayment = async () => {
    if (!paymentPhone || !paymentRef || !paymentAmount) return;
    setPaymentLoading(true);
    setPaymentError('');
    const { error } = await supabase.from('payments').insert({ enrollment_id: selectedEnrollmentId, student_id: profile!.id, amount: parseFloat(paymentAmount), currency: 'USD', payment_method: paymentMethod, phone_number: paymentPhone, reference_code: paymentRef, status: 'submitted' });
    if (!error) {
      // Database trigger (update_enrollment_on_payment) auto-updates enrollment status
      setPaymentResult('success'); await loadData();
    } else {
      setPaymentResult('error');
      setPaymentError(error.message || 'Erreur inconnue lors de la soumission du paiement.');
    }
    setPaymentLoading(false);
  };

  const grantedClasses = enrollments.filter(e => e.access_granted);
  const pendingClasses = enrollments.filter(e => !e.access_granted);
  const firstName = profile?.full_name?.split(' ')[0] || 'Etudiant';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonne matinee' : hour < 18 ? 'Bon apres-midi' : 'Bonne soiree';

  const navItems: { id: SideTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Accueil', icon: <Home className="w-4 h-4" /> },
    { id: 'classes', label: 'Mes Classes', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'forum', label: 'Forums', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'courses', label: 'Catalogue', icon: <Sparkles className="w-4 h-4" /> },
  ];

  if (loadingData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-stone-950' : 'bg-stone-50'}`}>
        <div className="text-center">
          <KongoSymbol size={40} className="text-amber-500 mx-auto mb-4 animate-pulse" />
          <p className={`text-sm ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-stone-950' : 'bg-stone-100'}`}>

      {/* ── SIDEBAR ── */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isDark ? 'bg-stone-900 border-r border-stone-800/60' : 'bg-white border-r border-stone-200'}
        `}>
          {/* Logo */}
          <div className={`flex items-center gap-3 px-5 h-16 border-b ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
            <img src="/logo.svg" alt="KongoKama" className="w-8 h-8 rounded-xl object-cover" />
            <span className={`font-bold text-base ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
              Kongo<span className="text-amber-500">Kama</span>
            </span>
          </div>

          {/* User card */}
          <div className={`mx-4 mt-5 rounded-2xl p-4 ${isDark ? 'bg-stone-800/60' : 'bg-amber-50'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-amber-900/20 flex-shrink-0">
                {profile?.full_name?.[0]?.toUpperCase() ?? 'E'}
              </div>
              <div className="min-w-0">
                <div className={`text-sm font-semibold truncate ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>
                  {profile?.full_name || 'Etudiant'}
                </div>
                <div className={`text-xs truncate ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                  {profile?.email}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              <span className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                {grantedClasses.length} classe{grantedClasses.length !== 1 ? 's' : ''} active{grantedClasses.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 mt-6 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === item.id
                    ? isDark
                      ? 'bg-amber-500/15 text-amber-400 shadow-sm'
                      : 'bg-amber-500/10 text-amber-600 shadow-sm'
                    : isDark
                      ? 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                      : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
                }`}
              >
                <span className={tab === item.id ? 'text-amber-500' : ''}>{item.icon}</span>
                {item.label}
                {item.id === 'classes' && enrollments.length > 0 && (
                  <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${isDark ? 'bg-stone-700 text-stone-400' : 'bg-stone-200 text-stone-500'}`}>
                    {enrollments.length}
                  </span>
                )}
                {item.id === 'forum' && grantedClasses.length > 0 && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className={`p-4 border-t space-y-2 ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
            <button
              onClick={() => { setShowAccessModal(true); setAccessResult('idle'); setAccessCode(''); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold transition-colors"
            >
              <Key className="w-4 h-4" />
              Entrer un code
            </button>
            <div className="flex gap-2">
              <button onClick={toggleTheme} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors ${isDark ? 'bg-stone-800 text-stone-400 hover:text-stone-200' : 'bg-stone-100 text-stone-500 hover:text-stone-700'}`}>
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {isDark ? 'Clair' : 'Sombre'}
              </button>
              <button onClick={signOut} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors ${isDark ? 'bg-stone-800 text-stone-400 hover:text-red-400' : 'bg-stone-100 text-stone-500 hover:text-red-500'}`}>
                <LogOut className="w-3.5 h-3.5" />
                Sortir
              </button>
            </div>
          </div>
        </aside>
      </>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className={`sticky top-0 z-30 flex items-center gap-4 px-4 sm:px-6 h-16 border-b ${isDark ? 'bg-stone-950/90 border-stone-900' : 'bg-stone-100/90 border-stone-200'} backdrop-blur-xl`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={`lg:hidden p-2 rounded-xl ${isDark ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-500 hover:bg-stone-200'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className={`font-semibold text-sm truncate ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>
              {tab === 'home' && `${greeting}, ${firstName}`}
              {tab === 'classes' && 'Mes Classes'}
              {tab === 'forum' && 'Forums de Classe'}
              {tab === 'courses' && 'Catalogue des Cours'}
            </h1>
          </div>

          <button onClick={() => onNavigate('home')} className={`hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${isDark ? 'text-stone-500 hover:text-stone-300 hover:bg-stone-800' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-200'}`}>
            <Home className="w-3.5 h-3.5" /> Accueil
          </button>

          {/* Notification bell */}
          <div className="relative" ref={notifPanelRef}>
            <button
              onClick={() => { setShowNotifPanel(p => !p); if (!showNotifPanel) markAllNotifRead(); }}
              className={`relative p-2 rounded-xl transition-colors ${isDark ? 'text-stone-400 hover:bg-stone-800 hover:text-stone-200' : 'text-stone-500 hover:bg-stone-200 hover:text-stone-700'}`}
            >
              <Bell className="w-4 h-4" />
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-stone-950" />
              )}
            </button>

            {showNotifPanel && (
              <div className={`absolute right-0 top-12 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden ${isDark ? 'bg-stone-900 border-stone-800 shadow-black/40' : 'bg-white border-stone-200 shadow-stone-200/60'}`}>
                <div className={`flex items-center justify-between px-4 py-3.5 border-b ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
                  <span className={`text-sm font-bold ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>Notifications</span>
                  <button onClick={() => setShowNotifPanel(false)} className={`p-1 rounded-lg ${isDark ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600'}`}><X className="w-3.5 h-3.5" /></button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className={`p-6 text-center text-sm ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>Aucune notification</div>
                  ) : notifications.map(notif => (
                    <div key={notif.id} className={`flex items-start gap-3 px-4 py-3.5 border-b last:border-0 transition-colors ${
                      !notif.is_read ? isDark ? 'bg-amber-500/5 border-stone-800' : 'bg-amber-50/80 border-stone-100' : isDark ? 'border-stone-800/50 hover:bg-stone-800/30' : 'border-stone-100 hover:bg-stone-50'
                    }`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        notif.type === 'payment_validated' ? 'bg-green-500/15 text-green-400' :
                        notif.type === 'payment_rejected' ? 'bg-red-500/15 text-red-400' :
                        notif.type === 'new_material' ? 'bg-blue-500/15 text-blue-400' :
                        'bg-amber-500/15 text-amber-400'
                      }`}>
                        {notif.type === 'payment_validated' ? <CheckCircle className="w-4 h-4" /> :
                         notif.type === 'payment_rejected' ? <XCircle className="w-4 h-4" /> :
                         notif.type === 'new_material' ? <BookOpen className="w-4 h-4" /> :
                         <Bell className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold mb-0.5 ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>{notif.title}</p>
                        <p className={`text-xs leading-relaxed ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>{notif.body}</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-stone-700' : 'text-stone-300'}`}>
                          {new Date(notif.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notif.is_read && <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-2" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">

          {/* ── HOME TAB ── */}
          {tab === 'home' && (
            <div className="max-w-4xl mx-auto space-y-6">

              {/* Hero greeting */}
              <div className={`relative rounded-3xl overflow-hidden p-8 ${isDark ? 'bg-stone-900' : 'bg-white'} border ${isDark ? 'border-stone-800' : 'border-stone-200'}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 w-48 h-48 opacity-5 pointer-events-none">
                  <KongoSymbol size={192} className="text-amber-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${isDark ? 'text-amber-500/70' : 'text-amber-500'}`}>
                        Bienvenue sur KongoKama
                      </p>
                      <h2 className={`text-2xl sm:text-3xl font-bold mb-3 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
                        {greeting}, <span className="text-amber-500">{firstName}</span>
                      </h2>
                      <p className={`text-sm leading-relaxed max-w-md ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                        Votre espace d'eveil et d'apprentissage Kongo Kama. Explorez les cours, rejoignez vos classes et participez aux forums.
                      </p>
                    </div>
                    <KongoSymbol size={48} className="text-amber-500 flex-shrink-0 hidden sm:block" />
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    {[
                      { label: 'Classes actives', value: grantedClasses.length, icon: <BookOpen className="w-4 h-4" />, color: 'text-amber-400' },
                      { label: 'En attente', value: pendingClasses.length, icon: <Clock className="w-4 h-4" />, color: 'text-yellow-400' },
                      { label: 'Cours dispo', value: courses.length, icon: <Sparkles className="w-4 h-4" />, color: 'text-green-400' },
                    ].map(s => (
                      <div key={s.label} className={`rounded-2xl p-4 ${isDark ? 'bg-stone-800/60' : 'bg-stone-50 border border-stone-200'}`}>
                        <div className={`${s.color} mb-2`}>{s.icon}</div>
                        <div className={`text-xl font-bold ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{s.value}</div>
                        <div className={`text-xs mt-0.5 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active classes quick access */}
              {grantedClasses.length > 0 && (
                <div>
                  <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>Continuer l'apprentissage</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {grantedClasses.slice(0, 4).map(e => {
                      const cls = e.classes;
                      const isNzila = cls?.courses?.division === 'nzila_kongo';
                      return (
                        <button
                          key={e.id}
                          onClick={() => onNavigate(`class:${e.class_id}`)}
                          className={`group text-left rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                            isNzila
                              ? isDark ? 'bg-amber-950/25 border-amber-800/30 hover:border-amber-600/40 hover:shadow-amber-900/20' : 'bg-amber-50 border-amber-200 hover:border-amber-400'
                              : isDark ? 'bg-stone-900 border-stone-800 hover:border-stone-700 hover:shadow-stone-900/40' : 'bg-white border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isNzila ? 'bg-amber-500/20 text-amber-400' : isDark ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-500'}`}>
                              {isNzila ? <Flame className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isNzila ? 'text-amber-500' : isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                                {cls?.courses?.division === 'kinkimba' ? 'Academie' : 'Temple'}
                              </p>
                              <h4 className={`font-bold text-sm mb-1 truncate ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{cls?.name}</h4>
                              <p className={`text-xs truncate ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{cls?.courses?.title}</p>
                            </div>
                            <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${isDark ? 'text-stone-600' : 'text-stone-300'}`} />
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <Play className="w-3 h-3 text-amber-500" />
                              <span className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>Cours</span>
                            </div>
                            <div className="h-px flex-1 bg-current opacity-10" />
                            <div className="flex items-center gap-1.5">
                              <MessageCircle className="w-3 h-3 text-amber-500" />
                              <span className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>Forum</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pending payments */}
              {pendingClasses.filter(e => e.payment_status === 'pending').length > 0 && (
                <div className={`rounded-2xl border p-5 ${isDark ? 'bg-yellow-950/20 border-yellow-800/30' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className={`font-bold text-sm mb-1 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>Paiements en attente</h3>
                      <p className={`text-xs mb-3 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                        Vous avez {pendingClasses.filter(e => e.payment_status === 'pending').length} classe(s) en attente de paiement.
                      </p>
                      <button onClick={() => setTab('classes')} className="text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors">
                        Voir mes classes <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {enrollments.length === 0 && (
                <div className={`rounded-3xl border p-10 text-center ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
                  <KongoSymbol size={44} className={`mx-auto mb-5 ${isDark ? 'text-stone-700' : 'text-stone-300'}`} />
                  <h3 className={`font-bold text-base mb-2 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>Commencez votre voyage</h3>
                  <p className={`text-sm mb-6 max-w-xs mx-auto ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                    Entrez le code fourni par votre professeur pour rejoindre une classe.
                  </p>
                  <button onClick={() => { setShowAccessModal(true); setAccessResult('idle'); setAccessCode(''); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold transition-colors shadow-lg shadow-amber-900/20">
                    <Key className="w-4 h-4" />
                    Entrer un code d'acces
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── CLASSES TAB ── */}
          {tab === 'classes' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-lg font-bold ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>Mes Classes</h2>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{enrollments.length} classe(s) inscrite(s)</p>
                </div>
                <button
                  onClick={() => { setShowAccessModal(true); setAccessResult('idle'); setAccessCode(''); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold transition-colors shadow-lg shadow-amber-900/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter
                </button>
              </div>

              {enrollments.length === 0 ? (
                <div className={`rounded-2xl border p-8 text-center ${isDark ? 'bg-stone-900 border-stone-800 text-stone-500' : 'bg-white border-stone-200 text-stone-400'}`}>
                  Aucune classe pour l'instant.
                </div>
              ) : (
                <div className="space-y-3">
                  {enrollments.map(enrollment => {
                    const cls = enrollment.classes;
                    const course = cls?.courses;
                    const isNzila = course?.division === 'nzila_kongo';
                    const statusConfig: Record<string, { label: string; icon: React.ReactNode; classes: string }> = {
                      pending: { label: 'Paiement requis', icon: <Clock className="w-3 h-3" />, classes: isDark ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-yellow-50 border-yellow-300 text-yellow-600' },
                      submitted: { label: 'En attente de validation', icon: <Clock className="w-3 h-3" />, classes: isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-300 text-blue-600' },
                      validated: { label: 'Acces valide', icon: <CheckCircle className="w-3 h-3" />, classes: isDark ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-green-50 border-green-300 text-green-600' },
                      rejected: { label: 'Paiement refuse', icon: <XCircle className="w-3 h-3" />, classes: isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-300 text-red-600' },
                      free: { label: 'Acces libre', icon: <CheckCircle className="w-3 h-3" />, classes: isDark ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-green-50 border-green-300 text-green-600' },
                      awaiting_approval: { label: 'Demande envoyee', icon: <Clock className="w-3 h-3" />, classes: isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-300 text-amber-600' },
                    };
                    const status = statusConfig[enrollment.payment_status] || statusConfig.pending;

                    return (
                      <div key={enrollment.id} className={`rounded-2xl border transition-all ${
                        isNzila
                          ? isDark ? 'bg-amber-950/20 border-amber-800/30' : 'bg-amber-50 border-amber-200'
                          : isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
                      }`}>
                        <div className="p-5">
                          <div className="flex items-start gap-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isNzila ? 'bg-amber-500/20 text-amber-400' : isDark ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-500'}`}>
                              {isNzila ? <Flame className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                                <h3 className={`font-bold text-sm ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{cls?.name}</h3>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold flex-shrink-0 ${status.classes}`}>
                                  {status.icon} {status.label}
                                </span>
                              </div>
                              <p className={`text-xs mb-1 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{course?.title}</p>
                              <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                                {course?.division === 'kinkimba' ? 'Academie Kinkimba' : 'Temple Nzila Kongo'}
                              </p>
                            </div>
                          </div>

                          <div className={`mt-4 flex items-center gap-2 flex-wrap ${isDark ? 'text-stone-600' : 'text-stone-300'}`}>
                            {enrollment.access_granted ? (
                              <>
                                <button onClick={() => onNavigate(`class:${enrollment.class_id}`)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold transition-colors shadow-md shadow-amber-900/20">
                                  <Play className="w-3.5 h-3.5" /> Cours
                                </button>
                                <button onClick={() => onNavigate(`class:${enrollment.class_id}`)} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${isDark ? 'border-stone-700 text-stone-300 hover:border-stone-600' : 'border-stone-300 text-stone-600 hover:border-stone-400'}`}>
                                  <MessageCircle className="w-3.5 h-3.5" /> Forum
                                </button>
                                <div className="flex items-center gap-1.5 ml-auto">
                                  <Unlock className="w-3.5 h-3.5 text-green-400" />
                                  <span className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>Acces actif</span>
                                </div>
                              </>
                            ) : enrollment.payment_status === 'pending' ? (
                              <button onClick={() => { setSelectedEnrollmentId(enrollment.id); setPaymentResult('idle'); setShowPaymentModal(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition-colors">
                                Soumettre le paiement <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            ) : enrollment.payment_status === 'submitted' ? (
                              <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                                <Clock className="w-3.5 h-3.5" /> En attente de validation par l'administrateur
                              </div>
                            ) : enrollment.payment_status === 'rejected' ? (
                              <button onClick={() => { setSelectedEnrollmentId(enrollment.id); setPaymentResult('idle'); setShowPaymentModal(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors">
                                Paiement refuse — Reessayer
                              </button>
                            ) : enrollment.payment_status === 'awaiting_approval' ? (
                              <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                <span>Demande soumise — en attente de decision du professeur</span>
                              </div>
                            ) : (
                              <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                                <Lock className="w-3.5 h-3.5" /> Acces en cours de traitement
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── FORUM TAB ── */}
          {tab === 'forum' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className={`text-lg font-bold mb-1 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>Forums de Classe</h2>
                <p className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>Discussions privees par classe</p>
              </div>

              {grantedClasses.length === 0 ? (
                <div className={`rounded-2xl border p-10 text-center ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
                  <MessageCircle className={`w-10 h-10 mx-auto mb-4 ${isDark ? 'text-stone-700' : 'text-stone-300'}`} />
                  <p className={`text-sm ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>Aucun forum disponible — rejoignez une classe pour acceder aux forums.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {grantedClasses.map(e => {
                    const cls = e.classes;
                    const isNzila = cls?.courses?.division === 'nzila_kongo';
                    return (
                      <button
                        key={e.id}
                        onClick={() => onNavigate(`class:${e.class_id}`)}
                        className={`group text-left rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                          isNzila
                            ? isDark ? 'bg-amber-950/25 border-amber-800/30 hover:border-amber-600/40 hover:shadow-amber-900/20' : 'bg-amber-50 border-amber-200 hover:border-amber-400'
                            : isDark ? 'bg-stone-900 border-stone-800 hover:border-stone-700 hover:shadow-stone-900/40' : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isNzila ? 'bg-amber-500/20 text-amber-400' : isDark ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-500'}`}>
                            <MessageCircle className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className={`font-bold text-sm truncate ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{cls?.name}</h3>
                            <p className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{cls?.courses?.title}</p>
                          </div>
                        </div>
                        <div className={`flex items-center justify-between text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3 h-3" />
                            <span>Discussion de groupe</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${isDark ? 'text-stone-700' : 'text-stone-300'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── COURSES TAB ── */}
          {tab === 'courses' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className={`text-lg font-bold mb-1 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>Catalogue des Cours</h2>
                <p className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>Inscrivez-vous directement ou utilisez un code d'accès fourni par votre professeur</p>
              </div>

              {/* Kinkimba */}
              <div>
                <div className={`flex items-center gap-2 mb-3`}>
                  <BookOpen className={`w-4 h-4 ${isDark ? 'text-stone-400' : 'text-stone-500'}`} />
                  <h3 className={`text-sm font-bold ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>Academie — Kinkimba</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {courses.filter(c => c.division === 'kinkimba').map(course => {
                    const existing = getCourseEnrollmentStatus(course.id);
                    const hasClass = allClasses.some(c => c.course_id === course.id && c.is_active);
                    return (
                      <div key={course.id} className={`rounded-2xl border p-5 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-500'}`}>
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-sm mb-1 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{course.title}</h4>
                            <p className={`text-xs leading-relaxed ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{course.description}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {course.is_free ? (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-medium">Gratuit</span>
                              ) : (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">Payant</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {existing ? (
                          <div className={`mt-3 pt-3 border-t ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
                            {existing.access_granted ? (
                              <button onClick={() => onNavigate(`class:${existing.class_id}`)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-semibold transition-colors">
                                <Play className="w-3.5 h-3.5" /> Accéder au cours
                              </button>
                            ) : existing.payment_status === 'pending' ? (
                              <button onClick={() => { setSelectedEnrollmentId(existing.id); setPaymentResult('idle'); setShowPaymentModal(true); }} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold transition-colors">
                                <Clock className="w-3.5 h-3.5" /> Payer maintenant
                              </button>
                            ) : existing.payment_status === 'submitted' ? (
                              <div className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                <Clock className="w-3.5 h-3.5" /> Paiement en attente de validation
                              </div>
                            ) : existing.payment_status === 'rejected' ? (
                              <button onClick={() => { setSelectedEnrollmentId(existing.id); setPaymentResult('idle'); setShowPaymentModal(true); }} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors">
                                <XCircle className="w-3.5 h-3.5" /> Paiement refusé — Réessayer
                              </button>
                            ) : (
                              <div className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                                <Clock className="w-3.5 h-3.5" /> En cours de traitement
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEnrollModalCourse(course); setEnrollResult('idle'); setEnrollMessage(''); enrollInCourse(course); }}
                            disabled={!hasClass}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                              hasClass
                                ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-900/20'
                                : isDark ? 'bg-stone-800 text-stone-600 cursor-not-allowed' : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                            }`}
                          >
                            {hasClass ? <><Plus className="w-3.5 h-3.5" /> S'inscrire</> : 'Aucune classe disponible'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Nzila Kongo */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <h3 className={`text-sm font-bold ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>Temple — Nzila Kongo</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {courses.filter(c => c.division === 'nzila_kongo').map(course => {
                    const existing = getCourseEnrollmentStatus(course.id);
                    const hasClass = allClasses.some(c => c.course_id === course.id && c.is_active);
                    return (
                      <div key={course.id} className={`rounded-2xl border p-5 ${isDark ? 'bg-amber-950/20 border-amber-800/30' : 'bg-amber-50 border-amber-200'}`}>
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-500/20 text-amber-400">
                            <Flame className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-sm mb-1 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{course.title}</h4>
                            <p className={`text-xs leading-relaxed ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{course.description}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {course.is_free && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-medium">Gratuit</span>}
                              {course.is_restricted && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">Code requis</span>}
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">Approbation professeur</span>
                            </div>
                          </div>
                        </div>

                        {existing ? (
                          <div className={`mt-3 pt-3 border-t ${isDark ? 'border-amber-800/30' : 'border-amber-200'}`}>
                            {existing.access_granted ? (
                              <button onClick={() => onNavigate(`class:${existing.class_id}`)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-semibold transition-colors">
                                <Play className="w-3.5 h-3.5" /> Accéder au cours
                              </button>
                            ) : existing.payment_status === 'awaiting_approval' ? (
                              <div className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                                <Clock className="w-3.5 h-3.5" /> Demande envoyée — en attente du professeur
                              </div>
                            ) : existing.payment_status === 'rejected' ? (
                              <div className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
                                <XCircle className="w-3.5 h-3.5" /> Demande refusée
                              </div>
                            ) : (
                              <div className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                                <Clock className="w-3.5 h-3.5" /> En cours de traitement
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEnrollModalCourse(course); setEnrollResult('idle'); setEnrollMessage(''); enrollInCourse(course); }}
                            disabled={!hasClass}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                              hasClass
                                ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-900/20'
                                : isDark ? 'bg-stone-800 text-stone-600 cursor-not-allowed' : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                            }`}
                          >
                            {hasClass ? <><Flame className="w-3.5 h-3.5" /> Demander l'accès</> : 'Aucune classe disponible'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`rounded-2xl p-5 border ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
                <p className={`text-sm text-center ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  Vous avez un code d'accès fourni par votre professeur ? Saisissez-le ici.
                </p>
                <div className="flex justify-center mt-3">
                  <button
                    onClick={() => { setShowAccessModal(true); setAccessResult('idle'); setAccessCode(''); }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold transition-colors"
                  >
                    <Key className="w-4 h-4" />
                    Entrer mon code
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── ACCESS CODE MODAL ── */}
      {showAccessModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl ${isDark ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-stone-200'}`}>
            {accessResult === 'success' ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <p className={`font-bold mb-2 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>Inscription reussie</p>
                <p className={`text-sm mb-6 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{accessMessage}</p>
                <button onClick={() => setShowAccessModal(false)} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold transition-colors">
                  Parfait !
                </button>
              </div>
            ) : accessResult === 'approval_sent' ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-amber-400" />
                </div>
                <p className={`font-bold mb-2 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>Demande envoyee !</p>
                <p className={`text-sm mb-2 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>{approvalClassName}</p>
                <p className={`text-sm mb-6 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  Votre demande d'inscription a ete transmise au professeur. Il examinera votre dossier et vous accordera l'acces ou vous contactera directement.
                </p>
                <div className={`p-3 rounded-xl mb-5 text-xs ${isDark ? 'bg-amber-950/30 border border-amber-800/30 text-amber-300' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
                  Nom : <strong>{profile?.full_name}</strong><br />
                  {profile?.phone && <>Tel : <strong>{profile.phone}</strong></>}
                </div>
                <button onClick={() => setShowAccessModal(false)} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold transition-colors">
                  Compris
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-amber-500/15' : 'bg-amber-100'}`}>
                    <Key className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>Code d'acces</h3>
                  <p className={`text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    Entrez le code fourni par votre professeur
                  </p>
                </div>
                <input
                  type="text"
                  value={accessCode}
                  onChange={e => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="KK-XXXXXXXX"
                  className={`w-full px-4 py-3.5 rounded-xl border text-center text-base font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500/30 mb-3 ${
                    isDark
                      ? `bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-600 ${accessResult === 'error' ? 'border-red-500/50' : ''}`
                      : `bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 ${accessResult === 'error' ? 'border-red-400' : ''}`
                  }`}
                  onKeyDown={e => e.key === 'Enter' && handleAccessCode()}
                />
                {accessResult === 'error' && (
                  <p className="text-red-400 text-xs text-center mb-3">{accessMessage}</p>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setShowAccessModal(false)} className={`flex-1 py-3 rounded-xl border text-sm font-semibold ${isDark ? 'border-stone-700 text-stone-400' : 'border-stone-300 text-stone-500'}`}>
                    Annuler
                  </button>
                  <button onClick={handleAccessCode} disabled={accessLoading || !accessCode.trim()} className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                    {accessLoading ? 'Verification...' : 'Valider'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── PAYMENT MODAL ── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl ${isDark ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-stone-200'}`}>
            {paymentResult === 'success' ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <p className={`font-bold mb-2 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>Paiement soumis !</p>
                <p className={`text-sm mb-6 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>L'administrateur validera votre acces sous peu.</p>
                <button onClick={() => setShowPaymentModal(false)} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold transition-colors">
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <h3 className={`text-lg font-bold mb-5 ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>Soumettre un paiement</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[{ value: 'mtn_momo', label: 'MTN MoMo', color: 'from-yellow-500 to-yellow-600' }, { value: 'airtel_money', label: 'Airtel Money', color: 'from-red-500 to-red-600' }].map(m => (
                      <button key={m.value} onClick={() => setPaymentMethod(m.value as 'mtn_momo' | 'airtel_money')} className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${paymentMethod === m.value ? `bg-gradient-to-r ${m.color} text-white` : isDark ? 'bg-stone-800 text-stone-400 border border-stone-700' : 'bg-stone-100 text-stone-500 border border-stone-200'}`}>{m.label}</button>
                    ))}
                  </div>
                  <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-amber-950/30 border border-amber-800/30' : 'bg-amber-50 border border-amber-200'}`}>
                    <p className={`text-xs mb-0.5 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>Envoyez au</p>
                    <p className={`font-bold ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{paymentMethod === 'mtn_momo' ? '+243 XXX XXX XXX' : '+243 YYY YYY YYY'}</p>
                  </div>
                  {[{ label: 'Votre numero', value: paymentPhone, setter: setPaymentPhone, placeholder: '+243 000 000 000' }, { label: 'Reference de transaction', value: paymentRef, setter: setPaymentRef, placeholder: 'TXN123456789' }, { label: 'Montant (USD)', value: paymentAmount, setter: setPaymentAmount, placeholder: '25' }].map(f => (
                    <div key={f.label}>
                      <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{f.label}</label>
                      <input type="text" value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder} className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${isDark ? 'bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-600' : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'}`} />
                    </div>
                  ))}
                  {paymentResult === 'error' && <p className="text-red-400 text-xs">{paymentError || 'Erreur. Reessayez.'}</p>}
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setShowPaymentModal(false)} className={`flex-1 py-3 rounded-xl border text-sm font-semibold ${isDark ? 'border-stone-700 text-stone-400' : 'border-stone-300 text-stone-500'}`}>Annuler</button>
                    <button onClick={submitPayment} disabled={paymentLoading || !paymentPhone || !paymentRef || !paymentAmount} className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                      {paymentLoading ? 'Envoi...' : 'Soumettre'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── ENROLLMENT RESULT MODAL ── */}
      {enrollModalCourse && enrollResult !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl ${isDark ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-stone-200'}`}>
            {enrollResult === 'success' ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <p className={`font-bold mb-2 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>Inscription réussie !</p>
                <p className={`text-sm mb-6 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{enrollMessage}</p>
                <div className="flex gap-3">
                  <button onClick={() => setEnrollModalCourse(null)} className={`flex-1 py-3 rounded-xl border text-sm font-semibold ${isDark ? 'border-stone-700 text-stone-400' : 'border-stone-300 text-stone-500'}`}>Fermer</button>
                  <button onClick={() => { setEnrollModalCourse(null); setTab('classes'); }} className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold transition-colors">
                    Voir mes classes
                  </button>
                </div>
              </div>
            ) : enrollResult === 'approval_sent' ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-amber-400" />
                </div>
                <p className={`font-bold mb-2 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>Demande envoyée !</p>
                <p className={`text-sm mb-6 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{enrollMessage}</p>
                <button onClick={() => setEnrollModalCourse(null)} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold transition-colors">
                  Compris
                </button>
              </div>
            ) : enrollResult === 'no_class' ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-stone-500/10 border border-stone-500/20 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-stone-400" />
                </div>
                <p className={`font-bold mb-2 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>Aucune classe disponible</p>
                <p className={`text-sm mb-6 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{enrollMessage}</p>
                <button onClick={() => setEnrollModalCourse(null)} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold transition-colors">
                  Fermer
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
                <p className={`font-bold mb-2 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>Erreur</p>
                <p className={`text-sm mb-6 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{enrollMessage}</p>
                <button onClick={() => setEnrollModalCourse(null)} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold transition-colors">
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
