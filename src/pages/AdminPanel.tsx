import { useState, useEffect, useRef } from 'react';
import {
  Users, BookOpen, CheckCircle, XCircle, Clock, Plus, Flame,
  LogOut, Eye, Key, Sun, Moon, Home, TrendingUp, MessageCircle,
  ChevronRight, ChevronDown, AlertCircle, Bell, X, UserCheck, Trash2
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Course, Profile, Notification } from '../lib/supabase';

interface AdminPanelProps {
  onNavigate: (page: string) => void;
}

type Tab = 'overview' | 'students' | 'classes' | 'payments' | 'approvals';

interface PaymentRow {
  id: string;
  enrollment_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  phone_number: string;
  reference_code: string;
  status: string;
  submitted_at: string;
  profiles: { full_name: string; email: string };
  class_enrollments: { id: string; classes: { name: string } };
}

interface ClassRow {
  id: string;
  name: string;
  description: string;
  access_code: string;
  is_active: boolean;
  created_at: string;
  courses: Course;
}

interface ApprovalRow {
  id: string;
  student_id: string;
  class_id: string;
  enrolled_at: string;
  profiles: { full_name: string; email: string; phone: string };
  classes: { name: string; courses: { title: string } };
}

interface ClassStats {
  classId: string;
  studentCount: number;
  avgProgressPct: number;
  messageCount: number;
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

export default function AdminPanel({ onNavigate }: AdminPanelProps) {
  const { theme, toggleTheme } = useTheme();
  const { profile, signOut } = useAuth();
  const isDark = theme === 'dark';

  const [tab, setTab] = useState<Tab>('overview');
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [newClassCourse, setNewClassCourse] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<ClassRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [processingApproval, setProcessingApproval] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<ApprovalRow[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [classStats, setClassStats] = useState<ClassStats[]>([]);
  const [actionError, setActionError] = useState('');
  const notifPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadAll(); }, []);

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

  const loadAll = async () => {
    setLoading(true);
    const [courseRes, studentRes, classRes, paymentRes, approvalRes] = await Promise.all([
      supabase.from('courses').select('*').order('order_index'),
      supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false }),
      supabase.from('classes').select('*, courses(*)').order('created_at', { ascending: false }),
      supabase.from('payments').select('*, profiles(full_name, email), class_enrollments(id, classes(name))').order('submitted_at', { ascending: false }),
      supabase.from('class_enrollments').select('id, student_id, class_id, enrolled_at, profiles(full_name, email, phone), classes(name, courses(title))').eq('payment_status', 'awaiting_approval').order('enrolled_at', { ascending: false }),
    ]);
    if (courseRes.data) setCourses(courseRes.data);
    if (studentRes.data) setStudents(studentRes.data);
    if (classRes.data) {
      const loadedClasses = classRes.data as unknown as ClassRow[];
      setClasses(loadedClasses);
      const statsResults = await Promise.all(loadedClasses.map(async cls => {
        const [enrollRes, progressRes, msgRes] = await Promise.all([
          supabase.from('class_enrollments').select('id', { count: 'exact', head: true }).eq('class_id', cls.id).eq('access_granted', true),
          supabase.from('item_progress').select('completed, module_items!inner(class_id)').eq('module_items.class_id', cls.id),
          supabase.from('forum_messages').select('id', { count: 'exact', head: true }).eq('class_id', cls.id).eq('is_deleted', false),
        ]);
        const studentCount = enrollRes.count ?? 0;
        const allProgress = progressRes.data ?? [];
        const avgProgressPct = allProgress.length > 0
          ? Math.round((allProgress.filter((p: { completed: boolean }) => p.completed).length / allProgress.length) * 100)
          : 0;
        const messageCount = msgRes.count ?? 0;
        return { classId: cls.id, studentCount, avgProgressPct, messageCount };
      }));
      setClassStats(statsResults);
    }
    if (paymentRes.data) setPayments(paymentRes.data as unknown as PaymentRow[]);
    if (approvalRes.data) setApprovals(approvalRes.data as unknown as ApprovalRow[]);
    setLoading(false);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'KK-';
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  const createClass = async () => {
    if (!newClassName.trim() || !newClassCourse) return;
    setCreateLoading(true);
    setCreateError('');
    const { error } = await supabase.from('classes').insert({
      course_id: newClassCourse, name: newClassName.trim(),
      description: newClassDesc.trim(), access_code: generateCode(), is_active: true,
    });
    if (error) {
      setCreateError(error.message || 'Erreur lors de la création de la classe.');
    } else {
      setShowCreateClass(false); setNewClassName(''); setNewClassDesc(''); setNewClassCourse(''); await loadAll();
    }
    setCreateLoading(false);
  };

  const deleteClass = async (classId: string) => {
    setDeleteLoading(true);
    setActionError('');
    // Get enrollment IDs first, then delete payments, enrollments, and class
    const { data: enrollments } = await supabase.from('class_enrollments').select('id').eq('class_id', classId);
    const enrollmentIds = enrollments?.map(e => e.id) || [];
    if (enrollmentIds.length > 0) {
      await supabase.from('payments').delete().in('enrollment_id', enrollmentIds);
    }
    await supabase.from('class_enrollments').delete().eq('class_id', classId);
    const { error } = await supabase.from('classes').delete().eq('id', classId);
    if (error) {
      setActionError(error.message || 'Erreur lors de la suppression de la classe.');
    } else {
      await loadAll();
      setDeleteTarget(null);
    }
    setDeleteLoading(false);
  };

  const handlePayment = async (paymentId: string, enrollmentId: string, action: 'validated' | 'rejected') => {
    setProcessingPayment(paymentId);
    setActionError('');
    const { error: payErr } = await supabase.from('payments').update({ status: action, validated_at: action === 'validated' ? new Date().toISOString() : null }).eq('id', paymentId);
    if (payErr) {
      setActionError(payErr.message || 'Erreur lors de la validation du paiement.');
      setProcessingPayment(null);
      return;
    }
    const { error: enrollErr } = await supabase.from('class_enrollments').update({ payment_status: action, access_granted: action === 'validated' }).eq('id', enrollmentId);
    if (enrollErr) {
      setActionError(enrollErr.message || 'Erreur lors de la mise à jour de l\'inscription.');
    }
    await loadAll();
    setProcessingPayment(null);
  };

  const handleApproval = async (enrollmentId: string, action: 'validated' | 'rejected') => {
    setProcessingApproval(enrollmentId);
    setActionError('');
    const { error } = await supabase.from('class_enrollments').update({ payment_status: action, access_granted: action === 'validated' }).eq('id', enrollmentId);
    if (error) {
      setActionError(error.message || 'Erreur lors du traitement de la demande.');
    }
    await loadAll();
    setProcessingApproval(null);
  };

  const pendingPayments = payments.filter(p => p.status === 'submitted');
  const stats = {
    students: students.length,
    classes: classes.length,
    pending: pendingPayments.length,
    validated: payments.filter(p => p.status === 'validated').length,
    approvals: approvals.length,
  };

  const navItems: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: <Home className="w-4 h-4" /> },
    { id: 'students', label: 'Etudiants', icon: <Users className="w-4 h-4" />, badge: stats.students },
    { id: 'classes', label: 'Classes', icon: <Key className="w-4 h-4" />, badge: stats.classes },
    { id: 'payments', label: 'Paiements', icon: <CheckCircle className="w-4 h-4" />, badge: stats.pending || undefined },
    { id: 'approvals', label: 'Demandes Nzila Kongo', icon: <UserCheck className="w-4 h-4" />, badge: stats.approvals || undefined },
  ];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-stone-950' : 'bg-stone-50'}`}>
        <KongoSymbol size={40} className="text-amber-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-stone-950' : 'bg-stone-100'}`}>

      {/* ── SIDEBAR ── */}
      <>
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
            <div>
              <span className={`font-bold text-sm ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
                Kongo<span className="text-amber-500">Kama</span>
              </span>
              <div className="text-xs text-amber-500/70 font-medium">Administrateur</div>
            </div>
          </div>

          {/* Admin card */}
          <div className={`mx-4 mt-5 rounded-2xl p-4 ${isDark ? 'bg-amber-950/30 border border-amber-800/30' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                <Flame className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className={`text-sm font-semibold truncate ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>
                  {profile?.full_name || 'Administrateur'}
                </div>
                <div className="text-xs text-amber-500 font-medium">Professeur · Admin</div>
              </div>
            </div>
            {(stats.pending > 0 || stats.approvals > 0) && (
              <div className={`mt-3 space-y-1.5`}>
                {stats.pending > 0 && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${isDark ? 'bg-yellow-950/40 border border-yellow-800/30' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <AlertCircle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                    <span className="text-xs text-yellow-400 font-medium">{stats.pending} paiement{stats.pending > 1 ? 's' : ''} a valider</span>
                  </div>
                )}
                {stats.approvals > 0 && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${isDark ? 'bg-amber-950/40 border border-amber-800/30' : 'bg-amber-50 border border-amber-200'}`}>
                    <UserCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="text-xs text-amber-400 font-medium">{stats.approvals} demande{stats.approvals > 1 ? 's' : ''} Nzila Kongo</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 mt-6 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === item.id
                    ? isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-500/10 text-amber-600'
                    : isDark ? 'text-stone-400 hover:bg-stone-800 hover:text-stone-200' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
                }`}
              >
                <span className={tab === item.id ? 'text-amber-500' : ''}>{item.icon}</span>
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    item.id === 'payments'
                      ? 'bg-amber-500 text-white'
                      : isDark ? 'bg-stone-700 text-stone-400' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Bottom */}
          <div className={`p-4 border-t space-y-2 ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
            <button onClick={() => onNavigate('home')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isDark ? 'text-stone-400 hover:bg-stone-800 hover:text-stone-200' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'}`}>
              <Eye className="w-4 h-4" /> Voir le site
            </button>
            <div className="flex gap-2">
              <button onClick={toggleTheme} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors ${isDark ? 'bg-stone-800 text-stone-400 hover:text-stone-200' : 'bg-stone-100 text-stone-500 hover:text-stone-700'}`}>
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {isDark ? 'Clair' : 'Sombre'}
              </button>
              <button onClick={signOut} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors ${isDark ? 'bg-stone-800 text-stone-400 hover:text-red-400' : 'bg-stone-100 text-stone-500 hover:text-red-500'}`}>
                <LogOut className="w-3.5 h-3.5" /> Sortir
              </button>
            </div>
          </div>
        </aside>
      </>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className={`sticky top-0 z-30 flex items-center gap-4 px-4 sm:px-6 h-16 border-b ${isDark ? 'bg-stone-950/90 border-stone-900' : 'bg-stone-100/90 border-stone-200'} backdrop-blur-xl`}>
          <button onClick={() => setSidebarOpen(true)} className={`lg:hidden p-2 rounded-xl ${isDark ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-500 hover:bg-stone-200'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className={`font-semibold text-sm ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>
              {tab === 'overview' && 'Vue d\'ensemble'}
              {tab === 'students' && `Etudiants (${stats.students})`}
              {tab === 'classes' && `Classes (${stats.classes})`}
              {tab === 'payments' && `Paiements${stats.pending > 0 ? ` — ${stats.pending} en attente` : ''}`}
              {tab === 'approvals' && `Demandes Nzila Kongo${stats.approvals > 0 ? ` (${stats.approvals})` : ''}`}
            </h1>
          </div>
          {tab === 'classes' && (
            <button onClick={() => setShowCreateClass(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold transition-colors shadow-lg shadow-amber-900/20">
              <Plus className="w-3.5 h-3.5" /> Nouvelle classe
            </button>
          )}

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
                        notif.type === 'payment_received' ? 'bg-yellow-500/15 text-yellow-400' :
                        notif.type === 'payment_validated' ? 'bg-green-500/15 text-green-400' :
                        notif.type === 'payment_rejected' ? 'bg-red-500/15 text-red-400' :
                        'bg-amber-500/15 text-amber-400'
                      }`}>
                        {notif.type === 'payment_received' || notif.type === 'payment_validated' ? <CheckCircle className="w-4 h-4" /> :
                         notif.type === 'payment_rejected' ? <XCircle className="w-4 h-4" /> :
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

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          {actionError && (
            <div className="max-w-4xl mx-auto mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {actionError}
            </div>
          )}

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div className="max-w-4xl mx-auto space-y-6">

              {/* Hero */}
              <div className={`relative rounded-3xl overflow-hidden p-8 ${isDark ? 'bg-stone-900' : 'bg-white'} border ${isDark ? 'border-stone-800' : 'border-stone-200'}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 w-48 h-48 opacity-5 pointer-events-none">
                  <KongoSymbol size={192} className="text-amber-500" />
                </div>
                <div className="relative z-10">
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-2 text-amber-500`}>Tableau de bord</p>
                  <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-amber-50' : 'text-stone-900'}`}>
                    Bienvenue, <span className="text-amber-500">{profile?.full_name?.split(' ')[0]}</span>
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    Gerez vos classes, validez les paiements et suivez la progression de vos etudiants.
                  </p>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Etudiants', value: stats.students, icon: <Users className="w-5 h-5" />, color: 'text-blue-400', bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50', border: isDark ? 'border-blue-500/20' : 'border-blue-100', onClick: () => setTab('students') },
                  { label: 'Classes actives', value: stats.classes, icon: <Key className="w-5 h-5" />, color: 'text-amber-400', bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50', border: isDark ? 'border-amber-500/20' : 'border-amber-100', onClick: () => setTab('classes') },
                  { label: 'En attente', value: stats.pending, icon: <Clock className="w-5 h-5" />, color: 'text-yellow-400', bg: isDark ? 'bg-yellow-500/10' : 'bg-yellow-50', border: isDark ? 'border-yellow-500/20' : 'border-yellow-100', onClick: () => setTab('payments') },
                  { label: 'Valides', value: stats.validated, icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-400', bg: isDark ? 'bg-green-500/10' : 'bg-green-50', border: isDark ? 'border-green-500/20' : 'border-green-100', onClick: () => setTab('payments') },
                ].map(s => (
                  <button key={s.label} onClick={s.onClick} className={`rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${s.bg} ${s.border} ${isDark ? 'hover:shadow-stone-900/40' : 'hover:shadow-stone-100'}`}>
                    <div className={`${s.color} mb-3`}>{s.icon}</div>
                    <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{s.value}</div>
                    <div className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{s.label}</div>
                  </button>
                ))}
              </div>

              {/* Pending payments alert */}
              {stats.pending > 0 && (
                <div className={`rounded-2xl border p-5 ${isDark ? 'bg-yellow-950/20 border-yellow-800/30' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className={`font-bold text-sm mb-1 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>
                          {stats.pending} paiement{stats.pending > 1 ? 's' : ''} en attente de validation
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                          Des etudiants attendent votre validation pour acceder a leurs cours.
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setTab('payments')} className="flex items-center gap-1 text-xs font-semibold text-amber-500 hover:text-amber-400 flex-shrink-0 transition-colors">
                      Valider <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Pending Nzila Kongo approvals alert */}
              {stats.approvals > 0 && (
                <div className={`rounded-2xl border p-5 ${isDark ? 'bg-amber-950/20 border-amber-800/30' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <UserCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className={`font-bold text-sm mb-1 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>
                          {stats.approvals} demande{stats.approvals > 1 ? 's' : ''} d'inscription Nzila Kongo
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                          Des etudiants attendent votre decision pour rejoindre le Temple Nzila Kongo.
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setTab('approvals')} className="flex items-center gap-1 text-xs font-semibold text-amber-500 hover:text-amber-400 flex-shrink-0 transition-colors">
                      Examiner <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Courses summary */}
              <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
                <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
                  <h3 className={`font-bold text-sm ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>Cours de la plateforme</h3>
                  <span className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{courses.length} cours</span>
                </div>
                <div className="divide-y divide-stone-800/30">
                  {courses.map(c => (
                    <div key={c.id} className={`flex items-center gap-4 px-5 py-3.5 ${isDark ? 'hover:bg-stone-800/30' : 'hover:bg-stone-50'} transition-colors`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c.division === 'nzila_kongo' ? 'bg-amber-500/15 text-amber-400' : isDark ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-500'}`}>
                        {c.division === 'nzila_kongo' ? <Flame className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>{c.title}</div>
                        <div className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                          {c.division === 'kinkimba' ? 'Academie Kinkimba' : 'Temple Nzila Kongo'}
                          {c.is_free && ' · Gratuit'}
                          {c.is_restricted && ' · Code requis'}
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${c.division === 'nzila_kongo' ? isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-600' : isDark ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-600'}`}>
                        {c.division === 'kinkimba' ? 'Academie' : 'Temple'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STUDENTS ── */}
          {tab === 'students' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
                <div className={`px-5 py-4 border-b ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
                  <h3 className={`font-bold text-sm ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{students.length} etudiant{students.length !== 1 ? 's' : ''} inscrit{students.length !== 1 ? 's' : ''}</h3>
                </div>
                {students.length === 0 ? (
                  <div className={`p-10 text-center text-sm ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                    Aucun etudiant inscrit pour l'instant.
                  </div>
                ) : (
                  <div className="divide-y divide-stone-800/30">
                    {students.map((s) => (
                      <div key={s.id} className={`flex items-center gap-4 px-5 py-3.5 ${isDark ? 'hover:bg-stone-800/30' : 'hover:bg-stone-50'} transition-colors`}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm shadow-amber-900/20">
                            {s.full_name?.[0]?.toUpperCase() ?? s.email[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className={`text-sm font-semibold truncate ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>{s.full_name || 'Sans nom'}</div>
                            <div className={`text-xs truncate ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{s.email}</div>
                          </div>
                        </div>
                        <div className={`text-xs flex-shrink-0 ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>
                          {new Date(s.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CLASSES ── */}
          {tab === 'classes' && (
            <div className="max-w-4xl mx-auto space-y-4">
              {classes.length === 0 ? (
                <div className={`rounded-2xl border p-10 text-center ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
                  <Key className={`w-10 h-10 mx-auto mb-4 ${isDark ? 'text-stone-700' : 'text-stone-300'}`} />
                  <p className={`text-sm mb-4 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>Aucune classe creee. Commencez par creer votre premiere classe.</p>
                  <button onClick={() => setShowCreateClass(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold transition-colors">
                    <Plus className="w-4 h-4" /> Creer une classe
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {classes.map(cls => {
                    const stats = classStats.find(s => s.classId === cls.id);
                    return (
                    <div key={cls.id} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
                      <div className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className={`font-bold text-sm ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{cls.name}</h4>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls.is_active ? isDark ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-green-50 text-green-600 border border-green-200' : isDark ? 'bg-stone-700 text-stone-400' : 'bg-stone-100 text-stone-500'}`}>
                                {cls.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className={`text-xs mb-2 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                              {cls.courses?.title} · {cls.courses?.division === 'kinkimba' ? 'Academie' : 'Temple'}
                            </div>
                            {cls.description && (
                              <p className={`text-xs mb-3 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{cls.description}</p>
                            )}

                            {/* Stats row */}
                            {stats && (
                              <div className="flex items-center gap-4 mt-3 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <Users className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                                  <span className={`text-xs font-semibold ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>{stats.studentCount}</span>
                                  <span className={`text-xs ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>etudiant{stats.studentCount !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <TrendingUp className={`w-3.5 h-3.5 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                                  <span className={`text-xs font-semibold ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>{stats.avgProgressPct}%</span>
                                  <span className={`text-xs ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>progression</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MessageCircle className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                                  <span className={`text-xs font-semibold ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>{stats.messageCount}</span>
                                  <span className={`text-xs ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>messages</span>
                                </div>
                                {stats.avgProgressPct > 0 && (
                                  <div className={`flex-1 h-1.5 rounded-full overflow-hidden min-w-16 max-w-32 ${isDark ? 'bg-stone-800' : 'bg-stone-200'}`}>
                                    <div className="h-full bg-green-500 transition-all rounded-full" style={{ width: `${stats.avgProgressPct}%` }} />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-sm flex-shrink-0 ${isDark ? 'bg-stone-800 border border-stone-700' : 'bg-amber-50 border border-amber-200'}`}>
                            <Key className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                            <span className={isDark ? 'text-amber-400' : 'text-amber-700'}>{cls.access_code}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>
                            Creee le {new Date(cls.created_at).toLocaleDateString('fr-FR')}
                          </span>
                          <div className="flex items-center gap-3">
                            <button onClick={() => setDeleteTarget(cls)} className={`text-xs font-semibold flex items-center gap-1 transition-colors ${isDark ? 'text-red-400/60 hover:text-red-400' : 'text-red-300 hover:text-red-500'}`}>
                              <Trash2 className="w-3 h-3" /> Supprimer
                            </button>
                            <button onClick={() => onNavigate(`class:${cls.id}`)} className={`text-xs font-semibold flex items-center gap-1 transition-colors ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-500'}`}>
                              Gerer <ChevronRight className="w-3 h-3" />
 </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── PAYMENTS ── */}
          {tab === 'payments' && (
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Pending first */}
              {pendingPayments.length > 0 && (
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    A valider ({pendingPayments.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingPayments.map(payment => (
                      <PaymentCard key={payment.id} payment={payment} isDark={isDark} onAction={handlePayment} processing={processingPayment} pending />
                    ))}
                  </div>
                </div>
              )}

              {/* All payments */}
              {payments.filter(p => p.status !== 'submitted').length > 0 && (
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                    Historique ({payments.filter(p => p.status !== 'submitted').length})
                  </h3>
                  <div className="space-y-3">
                    {payments.filter(p => p.status !== 'submitted').map(payment => (
                      <PaymentCard key={payment.id} payment={payment} isDark={isDark} onAction={handlePayment} processing={processingPayment} />
                    ))}
                  </div>
                </div>
              )}

              {payments.length === 0 && (
                <div className={`rounded-2xl border p-10 text-center ${isDark ? 'bg-stone-900 border-stone-800 text-stone-500' : 'bg-white border-stone-200 text-stone-400'}`}>
                  Aucun paiement soumis pour l'instant.
                </div>
              )}
            </div>
          )}

          {/* ── APPROVALS ── */}
          {tab === 'approvals' && (
            <div className="max-w-4xl mx-auto space-y-4">
              {approvals.length === 0 ? (
                <div className={`rounded-2xl border p-10 text-center ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
                  <UserCheck className={`w-10 h-10 mx-auto mb-4 ${isDark ? 'text-stone-700' : 'text-stone-300'}`} />
                  <p className={`text-sm ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>Aucune demande d'inscription en attente.</p>
                </div>
              ) : (
                <>
                  <div className={`rounded-2xl border p-4 ${isDark ? 'bg-amber-950/15 border-amber-800/30' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-center gap-3">
                      <Flame className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <p className={`text-xs ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                        Ces etudiants ont soumis une demande d'inscription au Temple Nzila Kongo. Vous pouvez valider leur acces ou refuser leur demande.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {approvals.map(req => {
                      const isProcessing = processingApproval === req.id;
                      return (
                        <div key={req.id} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
                          <div className="p-5">
                            <div className="flex items-start gap-4">
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md shadow-amber-900/20">
                                {req.profiles?.full_name?.[0]?.toUpperCase() ?? req.profiles?.email?.[0]?.toUpperCase() ?? '?'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-bold text-sm mb-0.5 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>
                                  {req.profiles?.full_name || 'Nom inconnu'}
                                </h4>
                                <p className={`text-xs mb-1 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{req.profiles?.email}</p>
                                {req.profiles?.phone && (
                                  <p className={`text-xs font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{req.profiles.phone}</p>
                                )}
                                <div className={`mt-2 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-300 text-amber-600'}`}>
                                  <Flame className="w-3 h-3" />
                                  {req.classes?.name} — {req.classes?.courses?.title}
                                </div>
                                <p className={`text-xs mt-2 ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>
                                  Demande le {new Date(req.enrolled_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => handleApproval(req.id, 'validated')}
                                disabled={isProcessing}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-semibold transition-colors disabled:opacity-50"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                {isProcessing ? 'Traitement...' : 'Valider l\'acces'}
                              </button>
                              <button
                                onClick={() => handleApproval(req.id, 'rejected')}
                                disabled={isProcessing}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Refuser
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ── CREATE CLASS MODAL ── */}
      {showCreateClass && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl ${isDark ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-stone-200'}`}>
            <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>Creer une nouvelle classe</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>Cours associe</label>
                <select value={newClassCourse} onChange={e => setNewClassCourse(e.target.value)} className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${isDark ? 'bg-stone-800 border-stone-700 text-stone-100' : 'bg-stone-50 border-stone-300 text-stone-900'}`}>
                  <option value="">Selectionner un cours...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>Nom de la classe</label>
                <input type="text" value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder="Ex: Kikongo kia kati — Elite" className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${isDark ? 'bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-600' : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'}`} />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>Description (optionnel)</label>
                <textarea value={newClassDesc} onChange={e => setNewClassDesc(e.target.value)} placeholder="Description de la classe..." rows={3} className={`w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${isDark ? 'bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-600' : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'}`} />
              </div>
              <div className={`p-3 rounded-xl text-xs ${isDark ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-500'}`}>
                Un code d'acces unique (format KK-XXXXXXXX) sera genere automatiquement.
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              {createError && <div className="w-full px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-2">{createError}</div>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCreateClass(false)} className={`flex-1 py-3 rounded-xl border text-sm font-semibold ${isDark ? 'border-stone-700 text-stone-400' : 'border-stone-300 text-stone-500'}`}>Annuler</button>
              <button onClick={createClass} disabled={createLoading || !newClassName.trim() || !newClassCourse} className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-lg shadow-amber-900/20">
                {createLoading ? 'Creation...' : 'Creer la classe'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CLASS CONFIRMATION ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl ${isDark ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-stone-200'}`}>
            <div className="text-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-red-500/15' : 'bg-red-50'}`}>
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>Supprimer cette classe ?</h3>
              <p className={`text-sm mb-1 font-semibold ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>{deleteTarget.name}</p>
              <p className={`text-xs mb-6 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                Cette action supprimera la classe, ses inscriptions et paiements associes. Elle est irreversible.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className={`flex-1 py-3 rounded-xl border text-sm font-semibold ${isDark ? 'border-stone-700 text-stone-400' : 'border-stone-300 text-stone-500'}`}>Annuler</button>
              <button onClick={() => deleteClass(deleteTarget.id)} disabled={deleteLoading} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                {deleteLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentCard({ payment, isDark, onAction, processing, pending = false }: {
  payment: PaymentRow;
  isDark: boolean;
  onAction: (paymentId: string, enrollmentId: string, action: 'validated' | 'rejected') => void;
  processing: string | null;
  pending?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const student = payment.profiles;
  const className = payment.class_enrollments?.classes?.name;
  const isProcessing = processing === payment.id;
  const enrollmentId = payment.class_enrollments?.id;

  return (
    <div className={`rounded-2xl border overflow-hidden ${
      pending
        ? isDark ? 'bg-yellow-950/15 border-yellow-800/30' : 'bg-yellow-50 border-yellow-200'
        : isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
    }`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md shadow-amber-900/20">
            {student?.full_name?.[0]?.toUpperCase() ?? student?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
              <span className={`font-bold text-sm ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>
                {student?.full_name || student?.email}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
                payment.status === 'submitted' ? isDark ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-yellow-50 border-yellow-300 text-yellow-600' :
                payment.status === 'validated' ? isDark ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-green-50 border-green-300 text-green-600' :
                isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-300 text-red-600'
              }`}>
                {payment.status === 'submitted' && <><Clock className="w-3 h-3" /> En attente</>}
                {payment.status === 'validated' && <><CheckCircle className="w-3 h-3" /> Valide</>}
                {payment.status === 'rejected' && <><XCircle className="w-3 h-3" /> Refuse</>}
              </span>
            </div>
            <div className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
              {className} · <span className="font-semibold text-amber-500">{payment.amount} {payment.currency}</span> · {payment.payment_method === 'mtn_momo' ? 'MTN MoMo' : 'Airtel Money'}
            </div>
          </div>
        </div>

        {/* Expand details */}
        <button onClick={() => setExpanded(!expanded)} className={`mt-3 flex items-center gap-1.5 text-xs transition-colors ${isDark ? 'text-stone-600 hover:text-stone-400' : 'text-stone-400 hover:text-stone-600'}`}>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          {expanded ? 'Moins de details' : 'Voir les details'}
        </button>

        {expanded && (
          <div className={`mt-3 grid grid-cols-2 gap-2 text-xs p-3 rounded-xl ${isDark ? 'bg-stone-800/50' : 'bg-stone-50'}`}>
            {[
              { label: 'Tel', value: payment.phone_number },
              { label: 'Reference', value: payment.reference_code },
              { label: 'Email', value: student?.email },
              { label: 'Soumis le', value: new Date(payment.submitted_at).toLocaleDateString('fr-FR') },
            ].map(d => (
              <div key={d.label}>
                <span className={`${isDark ? 'text-stone-600' : 'text-stone-400'}`}>{d.label} : </span>
                <span className={`font-medium ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>{d.value || '—'}</span>
              </div>
            ))}
          </div>
        )}

        {pending && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onAction(payment.id, enrollmentId, 'validated')}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {isProcessing ? 'Traitement...' : 'Valider l\'acces'}
            </button>
            <button
              onClick={() => onAction(payment.id, enrollmentId, 'rejected')}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              Refuser
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
