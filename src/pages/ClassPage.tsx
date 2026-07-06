import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, BookOpen, FileText, Image, Video, CheckCircle, MessageCircle, Send, Flame, Download, Plus, Trash2, CreditCard as Edit3, Music, Type, ChevronDown, ChevronRight, Users, Pin, Reply, X, ZoomIn, ZoomOut, Maximize2, Play, Pause, Volume2, Settings, MoreVertical, Smile, Eye, Clock, GripVertical, Hash, Paperclip, Link } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Module, ModuleItem, ItemProgress, ForumMessage, MessageReaction } from '../lib/supabase';

interface ClassPageProps {
  classId: string;
  onNavigate: (page: string) => void;
}

type MainView = 'content' | 'forum' | 'members';

// ── Media Viewers ──────────────────────────────────────────────────────────────

function PDFViewer({ url, title, isDark }: { url: string; title: string; isDark: boolean }) {
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);

  const container = (
    <div className={`flex flex-col h-full ${fullscreen ? 'fixed inset-0 z-50' : ''} ${isDark ? 'bg-stone-950' : 'bg-stone-100'}`}>
      <div className={`flex items-center justify-between gap-3 px-4 py-2.5 border-b ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
        <span className={`text-sm font-semibold truncate ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>{title}</span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={() => setZoom(z => Math.max(50, z - 25))} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-500 hover:bg-stone-100'}`}><ZoomOut className="w-4 h-4" /></button>
          <span className={`text-xs font-mono w-12 text-center ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(200, z + 25))} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-500 hover:bg-stone-100'}`}><ZoomIn className="w-4 h-4" /></button>
          <div className={`w-px h-4 ${isDark ? 'bg-stone-700' : 'bg-stone-300'}`} />
          <button onClick={() => setFullscreen(f => !f)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-500 hover:bg-stone-100'}`}><Maximize2 className="w-4 h-4" /></button>
          <a href={url} download target="_blank" rel="noopener noreferrer" className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-500 hover:bg-stone-100'}`}><Download className="w-4 h-4" /></a>
          {fullscreen && <button onClick={() => setFullscreen(false)} className={`p-1.5 rounded-lg ${isDark ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-500 hover:bg-stone-100'}`}><X className="w-4 h-4" /></button>}
        </div>
      </div>
      <div className="flex-1 overflow-auto flex items-start justify-center p-4">
        <div style={{ width: `${zoom}%`, maxWidth: '100%', minWidth: '100%' }}>
          <iframe
            src={`${url}#toolbar=0&navpanes=0&scrollbar=1`}
            className="w-full rounded-lg shadow-lg"
            style={{ height: fullscreen ? 'calc(100vh - 100px)' : '70vh', border: 'none' }}
            title={title}
          />
        </div>
      </div>
    </div>
  );

  return container;
}

function VideoPlayer({ url, title, isDark, onProgress }: { url: string; title: string; isDark: boolean; onProgress?: (seconds: number) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-stone-900 border border-stone-800' : 'bg-black'}`}>
      <div className={`px-4 py-2.5 flex items-center gap-2 ${isDark ? 'bg-stone-800/80' : 'bg-stone-900'}`}>
        <Video className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-stone-200 truncate">{title}</span>
      </div>
      <video
        ref={videoRef}
        src={url}
        controls
        controlsList="nodownload"
        className="w-full"
        style={{ maxHeight: '60vh' }}
        onTimeUpdate={() => onProgress && videoRef.current && onProgress(Math.floor(videoRef.current.currentTime))}
      />
    </div>
  );
}

function AudioPlayer({ url, title, isDark }: { url: string; title: string; isDark: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const toggle = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(!playing);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`rounded-2xl border p-5 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={() => {
          const cur = audioRef.current?.currentTime ?? 0;
          const dur = audioRef.current?.duration ?? 1;
          setCurrentTime(cur);
          setProgress((cur / dur) * 100);
        }}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setPlaying(false)}
      />
      <div className="flex items-center gap-4">
        <button onClick={toggle} className="w-12 h-12 rounded-xl bg-amber-500 hover:bg-amber-400 flex items-center justify-center text-white flex-shrink-0 transition-colors shadow-lg shadow-amber-900/20">
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-semibold truncate mb-2 ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>{title}</div>
          <div className={`h-2 rounded-full overflow-hidden cursor-pointer ${isDark ? 'bg-stone-700' : 'bg-stone-200'}`}
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              if (audioRef.current) { audioRef.current.currentTime = pct * (audioRef.current.duration || 0); }
            }}>
            <div className="h-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{formatTime(currentTime)}</span>
            <span className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageViewer({ url, title, isDark }: { url: string; title: string; isDark: boolean }) {
  const [lightbox, setLightbox] = useState(false);
  return (
    <>
      <div className={`rounded-2xl overflow-hidden border ${isDark ? 'border-stone-800' : 'border-stone-200'}`}>
        <img src={url} alt={title} className="w-full cursor-zoom-in object-cover max-h-96" onClick={() => setLightbox(true)} />
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"><X className="w-5 h-5" /></button>
          <img src={url} alt={title} className="max-w-full max-h-full object-contain rounded-xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

function ItemIcon({ type, className = '' }: { type: string; className?: string }) {
  switch (type) {
    case 'video': return <Video className={className} />;
    case 'pdf': return <FileText className={className} />;
    case 'image': return <Image className={className} />;
    case 'audio': return <Music className={className} />;
    default: return <Type className={className} />;
  }
}

// ── Main ClassPage ─────────────────────────────────────────────────────────────

export default function ClassPage({ classId, onNavigate }: ClassPageProps) {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const isDark = theme === 'dark';
  const isAdmin = profile?.role === 'admin';

  const [view, setView] = useState<MainView>('content');
  const [classData, setClassData] = useState<{ name: string; description: string; courses: { title: string; division: string } } | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [itemProgress, setItemProgress] = useState<ItemProgress[]>([]);
  const [members, setMembers] = useState<{ full_name: string; email: string; enrolled_at: string }[]>([]);
  const [selectedItem, setSelectedItem] = useState<ModuleItem | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Forum state
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [replyTo, setReplyTo] = useState<ForumMessage | null>(null);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<ForumMessage[]>([]);
  const [adminMediaType, setAdminMediaType] = useState<'image' | 'pdf' | 'video' | null>(null);
  const [adminMediaUrl, setAdminMediaUrl] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Admin module creation
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');

  const [showAddItem, setShowAddItem] = useState<string | null>(null); // moduleId
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState<'video' | 'pdf' | 'image' | 'audio' | 'text'>('video');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemBody, setNewItemBody] = useState('');
  const [savingItem, setSavingItem] = useState(false);

  useEffect(() => { loadAll(); }, [classId]);

  useEffect(() => {
    if (view === 'forum') {
      const channel = supabase
        .channel(`forum-${classId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forum_messages', filter: `class_id=eq.${classId}` }, payload => {
          (async () => {
            const { data } = await supabase.from('forum_messages').select('*, profiles(full_name, email, role, avatar_url)').eq('id', payload.new.id).maybeSingle();
            if (data) setMessages(prev => [...prev, data as unknown as ForumMessage]);
          })();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [classId, view]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadAll = async () => {
    setLoading(true);
    const [clsRes, modulesRes, progressRes, membersRes, messagesRes] = await Promise.all([
      supabase.from('classes').select('name, description, courses(title, division)').eq('id', classId).maybeSingle(),
      supabase.from('modules').select('*, module_items(*)').eq('class_id', classId).order('order_index'),
      profile ? supabase.from('item_progress').select('*').eq('student_id', profile.id) : Promise.resolve({ data: [] }),
      supabase.from('class_enrollments').select('profiles(full_name, email), enrolled_at').eq('class_id', classId).eq('access_granted', true),
      supabase.from('forum_messages').select('*, profiles(full_name, email, role, avatar_url)').eq('class_id', classId).eq('is_deleted', false).order('created_at'),
    ]);

    if (clsRes.data) setClassData(clsRes.data as unknown as typeof classData);
    if (modulesRes.data) {
      const mods = modulesRes.data.map((m: Module & { module_items: ModuleItem[] }) => ({
        ...m,
        items: (m.module_items || []).sort((a: ModuleItem, b: ModuleItem) => a.order_index - b.order_index),
      }));
      setModules(mods);
      if (mods.length > 0) setExpandedModules(new Set([mods[0].id]));
    }
    if (progressRes.data) setItemProgress(progressRes.data as ItemProgress[]);
    if (membersRes.data) setMembers(membersRes.data.map((e: { profiles: { full_name: string; email: string }; enrolled_at: string }) => ({ ...e.profiles, enrolled_at: e.enrolled_at })));
    if (messagesRes.data) {
      const msgs = messagesRes.data as unknown as ForumMessage[];
      setMessages(msgs);
      setPinnedMessages(msgs.filter(m => m.is_pinned));
    }
    setLoading(false);
  };

  const toggleModule = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const markItemProgress = useCallback(async (item: ModuleItem, completed: boolean) => {
    if (!profile || isAdmin) return;
    const existing = itemProgress.find(p => p.item_id === item.id);
    if (existing) {
      await supabase.from('item_progress').update({ completed, completed_at: completed ? new Date().toISOString() : null, last_accessed_at: new Date().toISOString() }).eq('id', existing.id);
      setItemProgress(prev => prev.map(p => p.id === existing.id ? { ...p, completed } : p));
    } else {
      const { data } = await supabase.from('item_progress').insert({ item_id: item.id, student_id: profile.id, completed, completed_at: completed ? new Date().toISOString() : null }).select().maybeSingle();
      if (data) setItemProgress(prev => [...prev, data as ItemProgress]);
    }
  }, [profile, isAdmin, itemProgress]);

  const selectItem = async (item: ModuleItem) => {
    setSelectedItem(item);
    if (!isAdmin) {
      const existing = itemProgress.find(p => p.item_id === item.id);
      if (!existing) {
        const { data } = await supabase.from('item_progress').insert({ item_id: item.id, student_id: profile!.id, completed: false, last_accessed_at: new Date().toISOString() }).select().maybeSingle();
        if (data) setItemProgress(prev => [...prev, data as ItemProgress]);
      } else {
        await supabase.from('item_progress').update({ last_accessed_at: new Date().toISOString() }).eq('id', existing.id);
      }
    }
  };

  const addModule = async () => {
    if (!newModuleTitle.trim()) return;
    await supabase.from('modules').insert({ class_id: classId, title: newModuleTitle.trim(), description: newModuleDesc.trim(), order_index: modules.length });
    setShowAddModule(false); setNewModuleTitle(''); setNewModuleDesc('');
    await loadAll();
  };

  const deleteModule = async (moduleId: string) => {
    await supabase.from('modules').delete().eq('id', moduleId);
    await loadAll();
    if (selectedItem && modules.find(m => m.id === moduleId)?.items?.some(i => i.id === selectedItem.id)) setSelectedItem(null);
  };

  const addItem = async (moduleId: string) => {
    if (!newItemTitle.trim()) return;
    setSavingItem(true);
    await supabase.from('module_items').insert({
      module_id: moduleId, class_id: classId,
      title: newItemTitle.trim(), item_type: newItemType,
      content_url: newItemUrl.trim(), content_body: newItemBody.trim(),
      order_index: (modules.find(m => m.id === moduleId)?.items?.length ?? 0),
    });
    setShowAddItem(null); setNewItemTitle(''); setNewItemUrl(''); setNewItemBody('');
    setSavingItem(false);
    await loadAll();
  };

  const deleteItem = async (itemId: string) => {
    await supabase.from('module_items').delete().eq('id', itemId);
    if (selectedItem?.id === itemId) setSelectedItem(null);
    await loadAll();
  };

  const sendMessage = async () => {
    const hasText = messageInput.trim();
    const hasMedia = isAdmin && adminMediaType && adminMediaUrl.trim();
    if (!hasText && !hasMedia) return;
    if (!profile) return;
    setSendingMsg(true);
    const payload: Record<string, unknown> = {
      class_id: classId,
      sender_id: profile.id,
      content: messageInput.trim() || (adminMediaType ? `[${adminMediaType.toUpperCase()}]` : ''),
      message_type: 'text',
      reply_to_id: replyTo?.id ?? null,
    };
    if (isAdmin && adminMediaType && adminMediaUrl.trim()) {
      if (adminMediaType === 'image') payload.image_url = adminMediaUrl.trim();
      else if (adminMediaType === 'pdf') payload.pdf_url = adminMediaUrl.trim();
      else if (adminMediaType === 'video') payload.video_url = adminMediaUrl.trim();
    }
    await supabase.from('forum_messages').insert(payload);
    setMessageInput('');
    setReplyTo(null);
    setAdminMediaType(null);
    setAdminMediaUrl('');
    setSendingMsg(false);
  };

  const togglePin = async (msg: ForumMessage) => {
    await supabase.from('forum_messages').update({ is_pinned: !msg.is_pinned }).eq('id', msg.id);
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_pinned: !m.is_pinned } : m));
    setPinnedMessages(prev => msg.is_pinned ? prev.filter(m => m.id !== msg.id) : [...prev, { ...msg, is_pinned: true }]);
  };

  const deleteMsg = async (msgId: string) => {
    await supabase.from('forum_messages').update({ is_deleted: true }).eq('id', msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
  };

  const addReaction = async (msgId: string, emoji: string) => {
    if (!profile) return;
    const { error } = await supabase.from('message_reactions').insert({ message_id: msgId, user_id: profile.id, emoji });
    if (!error) await loadAll();
  };

  // Progress calculation
  const allItems = modules.flatMap(m => m.items || []);
  const completedItems = allItems.filter(i => itemProgress.find(p => p.item_id === i.id && p.completed));
  const progressPct = allItems.length > 0 ? Math.round((completedItems.length / allItems.length) * 100) : 0;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-stone-950' : 'bg-stone-50'}`}>
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-stone-950 text-stone-100' : 'bg-stone-50 text-stone-900'}`}>

      {/* ── HEADER ── */}
      <header className={`sticky top-0 z-30 border-b ${isDark ? 'bg-stone-950/95 border-stone-900' : 'bg-white/95 border-stone-200'} backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => onNavigate(isAdmin ? 'admin' : 'dashboard')} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'}`}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className={`font-bold text-sm truncate ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{classData?.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${classData?.courses?.division === 'nzila_kongo' ? 'bg-amber-500/10 text-amber-400' : isDark ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-500'}`}>
                {classData?.courses?.division === 'kinkimba' ? 'Academie' : 'Temple'}
              </span>
            </div>
            <p className={`text-xs truncate ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{classData?.courses?.title}</p>
          </div>

          {!isAdmin && (
            <div className="hidden sm:flex items-center gap-2">
              <div className={`w-24 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-stone-800' : 'bg-stone-200'}`}>
                <div className="h-full bg-amber-500 transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="text-xs text-amber-500 font-semibold">{progressPct}%</span>
            </div>
          )}

          {/* View tabs */}
          <div className={`flex gap-0.5 p-0.5 rounded-xl ${isDark ? 'bg-stone-900' : 'bg-stone-100'}`}>
            {[
              { id: 'content', icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Cours' },
              { id: 'forum', icon: <MessageCircle className="w-3.5 h-3.5" />, label: 'Forum' },
              { id: 'members', icon: <Users className="w-3.5 h-3.5" />, label: members.length.toString() },
            ].map(t => (
              <button key={t.id} onClick={() => setView(t.id as MainView)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${view === t.id ? isDark ? 'bg-stone-800 text-amber-400 shadow' : 'bg-white text-amber-600 shadow' : isDark ? 'text-stone-500 hover:text-stone-300' : 'text-stone-500 hover:text-stone-700'}`}>
                {t.icon}<span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex gap-6">

        {/* ── CONTENT VIEW ── */}
        {view === 'content' && (
          <>
            {/* Module sidebar */}
            <div className="w-72 flex-shrink-0 hidden lg:block">
              <div className={`rounded-2xl border overflow-hidden sticky top-20 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
                <div className={`px-4 py-3.5 border-b flex items-center justify-between ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
                  <span className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Modules</span>
                  {isAdmin && (
                    <button onClick={() => setShowAddModule(true)} className="p-1 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                  {modules.length === 0 ? (
                    <div className={`p-6 text-center text-xs ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>
                      {isAdmin ? 'Ajoutez votre premier module.' : 'Aucun contenu disponible.'}
                    </div>
                  ) : modules.map((mod, mi) => {
                    const modItems = mod.items || [];
                    const modCompleted = modItems.filter(i => itemProgress.find(p => p.item_id === i.id && p.completed)).length;
                    const isExpanded = expandedModules.has(mod.id);
                    return (
                      <div key={mod.id}>
                        <button onClick={() => toggleModule(mod.id)} className={`w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors ${isDark ? 'hover:bg-stone-800/60' : 'hover:bg-stone-50'} border-b ${isDark ? 'border-stone-800/50' : 'border-stone-100'}`}>
                          <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isDark ? 'text-stone-500' : 'text-stone-400'} ${isExpanded ? '' : '-rotate-90'}`} />
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-semibold truncate ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>
                              Module {mi + 1} — {mod.title}
                            </div>
                            {!isAdmin && modItems.length > 0 && (
                              <div className={`text-xs mt-0.5 ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>
                                {modCompleted}/{modItems.length} complete{modCompleted !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                          {isAdmin && (
                            <button onClick={e => { e.stopPropagation(); deleteModule(mod.id); }} className="p-0.5 rounded text-stone-600 hover:text-red-400 flex-shrink-0">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </button>
                        {isExpanded && (
                          <div className={`border-b ${isDark ? 'border-stone-800/50' : 'border-stone-100'}`}>
                            {modItems.map(item => {
                              const done = itemProgress.find(p => p.item_id === item.id)?.completed ?? false;
                              const isSelected = selectedItem?.id === item.id;
                              return (
                                <button key={item.id} onClick={() => selectItem(item)} className={`w-full flex items-center gap-2.5 pl-9 pr-3 py-2.5 text-left transition-all ${isSelected ? isDark ? 'bg-amber-500/10 border-r-2 border-amber-500' : 'bg-amber-50 border-r-2 border-amber-500' : isDark ? 'hover:bg-stone-800/40' : 'hover:bg-stone-50'}`}>
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500/20 text-green-400' : isSelected ? 'bg-amber-500/20 text-amber-400' : isDark ? 'bg-stone-800 text-stone-500' : 'bg-stone-100 text-stone-400'}`}>
                                    {done ? <CheckCircle className="w-3 h-3" /> : <ItemIcon type={item.item_type} className="w-2.5 h-2.5" />}
                                  </div>
                                  <span className={`text-xs truncate ${isSelected ? isDark ? 'text-amber-300 font-medium' : 'text-amber-700 font-medium' : isDark ? 'text-stone-400' : 'text-stone-600'}`}>{item.title}</span>
                                  {isAdmin && (
                                    <button onClick={e => { e.stopPropagation(); deleteItem(item.id); }} className="ml-auto p-0.5 rounded text-stone-700 hover:text-red-400 flex-shrink-0">
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </button>
                              );
                            })}
                            {isAdmin && (
                              <button onClick={() => { setShowAddItem(mod.id); setNewItemTitle(''); setNewItemUrl(''); setNewItemBody(''); setNewItemType('video'); }} className={`w-full flex items-center gap-2 pl-9 pr-3 py-2 text-xs transition-colors ${isDark ? 'text-amber-500/70 hover:text-amber-400' : 'text-amber-600/70 hover:text-amber-600'}`}>
                                <Plus className="w-3 h-3" /> Ajouter un contenu
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Content viewer */}
            <div className="flex-1 min-w-0">
              {!selectedItem ? (
                <div className={`rounded-2xl border p-10 text-center ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
                  <BookOpen className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-stone-700' : 'text-stone-300'}`} />
                  <h3 className={`font-bold mb-2 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    {modules.length === 0 ? (isAdmin ? 'Creez votre premier module' : 'Aucun contenu disponible') : 'Selectionnez un contenu'}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>
                    {modules.length === 0 && isAdmin ? 'Cliquez sur + pour ajouter un module.' : 'Choisissez un contenu dans la liste des modules.'}
                  </p>
                  {/* Mobile: show modules list */}
                  <div className="lg:hidden mt-6 space-y-2 text-left">
                    {modules.map((mod, mi) => (
                      <div key={mod.id} className={`rounded-xl border overflow-hidden ${isDark ? 'border-stone-800' : 'border-stone-200'}`}>
                        <button onClick={() => toggleModule(mod.id)} className={`w-full flex items-center gap-2 px-4 py-3 text-left ${isDark ? 'bg-stone-800/60' : 'bg-stone-50'}`}>
                          <ChevronDown className={`w-4 h-4 transition-transform ${expandedModules.has(mod.id) ? '' : '-rotate-90'} ${isDark ? 'text-stone-500' : 'text-stone-400'}`} />
                          <span className={`text-sm font-semibold ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>Module {mi + 1} — {mod.title}</span>
                        </button>
                        {expandedModules.has(mod.id) && (mod.items || []).map(item => (
                          <button key={item.id} onClick={() => selectItem(item)} className={`w-full flex items-center gap-3 px-4 py-2.5 text-left border-t ${isDark ? 'border-stone-800 hover:bg-stone-800/40' : 'border-stone-100 hover:bg-white'}`}>
                            <ItemIcon type={item.item_type} className={`w-4 h-4 ${isDark ? 'text-stone-400' : 'text-stone-500'}`} />
                            <span className={`text-sm ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>{item.title}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Item header */}
                  <div className={`rounded-2xl border p-5 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
                          <ItemIcon type={selectedItem.item_type} className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className={`font-bold ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{selectedItem.title}</h2>
                          {selectedItem.description && <p className={`text-sm mt-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{selectedItem.description}</p>}
                        </div>
                      </div>
                      {!isAdmin && (
                        <button
                          onClick={() => markItemProgress(selectedItem, !itemProgress.find(p => p.item_id === selectedItem.id)?.completed)}
                          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                            itemProgress.find(p => p.item_id === selectedItem.id)?.completed
                              ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                              : isDark ? 'border-stone-700 text-stone-400 hover:border-amber-500/40 hover:text-amber-400' : 'border-stone-300 text-stone-500 hover:border-amber-400 hover:text-amber-600'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {itemProgress.find(p => p.item_id === selectedItem.id)?.completed ? 'Complete' : 'Marquer complete'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Media content */}
                  {selectedItem.item_type === 'video' && selectedItem.content_url && (
                    <VideoPlayer url={selectedItem.content_url} title={selectedItem.title} isDark={isDark}
                      onProgress={secs => {
                        const prog = itemProgress.find(p => p.item_id === selectedItem.id);
                        if (prog) supabase.from('item_progress').update({ last_position_seconds: secs }).eq('id', prog.id);
                      }}
                    />
                  )}
                  {selectedItem.item_type === 'pdf' && selectedItem.content_url && (
                    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-stone-800' : 'border-stone-200'}`} style={{ height: '75vh' }}>
                      <PDFViewer url={selectedItem.content_url} title={selectedItem.title} isDark={isDark} />
                    </div>
                  )}
                  {selectedItem.item_type === 'image' && selectedItem.content_url && (
                    <ImageViewer url={selectedItem.content_url} title={selectedItem.title} isDark={isDark} />
                  )}
                  {selectedItem.item_type === 'audio' && selectedItem.content_url && (
                    <AudioPlayer url={selectedItem.content_url} title={selectedItem.title} isDark={isDark} />
                  )}
                  {selectedItem.content_body && (
                    <div className={`rounded-2xl border p-6 ${isDark ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white border-stone-200 text-stone-600'}`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedItem.content_body}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── FORUM VIEW ── */}
        {view === 'forum' && (
          <div className="flex-1 min-w-0 flex gap-4">
            <div className="flex-1 min-w-0 flex flex-col">
              {/* Pinned messages */}
              {pinnedMessages.length > 0 && (
                <div className={`rounded-2xl border mb-4 overflow-hidden ${isDark ? 'bg-amber-950/20 border-amber-800/30' : 'bg-amber-50 border-amber-200'}`}>
                  {pinnedMessages.map(pm => (
                    <div key={pm.id} className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 ${isDark ? 'border-amber-800/20' : 'border-amber-200'}`}>
                      <Pin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-semibold text-amber-500 mr-2">{(pm.profiles as unknown as { full_name: string })?.full_name}</span>
                        <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{pm.content}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Messages */}
              <div className={`flex-1 rounded-2xl border overflow-hidden flex flex-col ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`} style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
                <div className={`px-4 py-3 border-b flex items-center gap-2 ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
                  <Hash className="w-4 h-4 text-amber-500" />
                  <span className={`font-semibold text-sm ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>{classData?.name}</span>
                  <span className={`text-xs ml-auto ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>{messages.length} messages</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <MessageCircle className={`w-10 h-10 mb-3 ${isDark ? 'text-stone-700' : 'text-stone-300'}`} />
                      <p className={`text-sm ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>Aucun message. Lancez la discussion !</p>
                    </div>
                  )}
                  {messages.map(msg => {
                    const sender = msg.profiles as unknown as { full_name: string; email: string; role: string };
                    const isOwn = msg.sender_id === profile?.id;
                    const isTeacher = sender?.role === 'admin';
                    const replyMsg = replyTo?.id === msg.id;

                    return (
                      <div key={msg.id} className={`flex items-end gap-2 group ${isOwn ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isTeacher ? 'bg-amber-500 text-white' : isDark ? 'bg-stone-700 text-stone-300' : 'bg-stone-200 text-stone-600'}`}>
                          {isTeacher ? <Flame className="w-3.5 h-3.5" /> : (sender?.full_name?.[0] ?? '?')}
                        </div>
                        <div className={`max-w-xs lg:max-w-sm xl:max-w-md flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                          {!isOwn && (
                            <span className={`text-xs mb-1 ml-1 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                              {sender?.full_name}
                              {isTeacher && <span className="ml-1 text-amber-500 font-semibold">· Prof</span>}
                            </span>
                          )}
                          {msg.reply_to_id && (
                            <div className={`px-3 py-1.5 rounded-xl text-xs mb-1 w-full opacity-70 ${isDark ? 'bg-stone-800 text-stone-400 border border-stone-700' : 'bg-stone-100 text-stone-500 border border-stone-200'}`}>
                              <Reply className="w-3 h-3 inline mr-1" />
                              Message cite
                            </div>
                          )}
                          <div className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isOwn ? 'bg-amber-500 text-white rounded-br-sm' : isDark ? 'bg-stone-800 text-stone-200 rounded-bl-sm' : 'bg-stone-100 text-stone-700 rounded-bl-sm'
                          } ${msg.is_pinned ? 'ring-1 ring-amber-500/50' : ''}`}>
                            {msg.is_pinned && <Pin className="w-3 h-3 text-amber-400 inline mr-1 -mt-0.5" />}
                            {msg.content && msg.content !== '[IMAGE]' && msg.content !== '[PDF]' && msg.content !== '[VIDEO]' && (
                              <span>{msg.content}</span>
                            )}
                            {msg.image_url && (
                              <img src={msg.image_url} alt="image" className="mt-2 rounded-xl max-w-full max-h-60 object-cover cursor-zoom-in" onClick={() => window.open(msg.image_url, '_blank')} />
                            )}
                            {msg.video_url && (
                              <video src={msg.video_url} controls className="mt-2 rounded-xl max-w-full max-h-52" />
                            )}
                            {msg.pdf_url && (
                              <a href={msg.pdf_url} target="_blank" rel="noopener noreferrer" className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${isOwn ? 'bg-white/20 text-white hover:bg-white/30' : isDark ? 'bg-stone-700 text-stone-300 hover:bg-stone-600' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'} transition-colors`}>
                                <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{msg.pdf_url.split('/').pop() || 'Document PDF'}</span>
                              </a>
                            )}
                          </div>

                          {/* Actions on hover */}
                          <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? 'flex-row-reverse' : ''}`}>
                            {['👍', '❤️', '🙏', '🔥'].map(emoji => (
                              <button key={emoji} onClick={() => addReaction(msg.id, emoji)} className={`text-xs px-1.5 py-0.5 rounded-lg transition-colors ${isDark ? 'hover:bg-stone-800 text-stone-500 hover:text-stone-300' : 'hover:bg-stone-100 text-stone-400'}`}>
                                {emoji}
                              </button>
                            ))}
                            <button onClick={() => { setReplyTo(msg); inputRef.current?.focus(); }} className={`p-1 rounded-lg transition-colors ${isDark ? 'text-stone-600 hover:text-stone-400 hover:bg-stone-800' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'}`}>
                              <Reply className="w-3 h-3" />
                            </button>
                            {isAdmin && (
                              <>
                                <button onClick={() => togglePin(msg)} className={`p-1 rounded-lg transition-colors ${msg.is_pinned ? 'text-amber-500' : isDark ? 'text-stone-600 hover:text-amber-500' : 'text-stone-400 hover:text-amber-500'}`}>
                                  <Pin className="w-3 h-3" />
                                </button>
                                <button onClick={() => deleteMsg(msg.id)} className={`p-1 rounded-lg transition-colors ${isDark ? 'text-stone-600 hover:text-red-400' : 'text-stone-400 hover:text-red-500'}`}>
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                          <span className={`text-[10px] mx-1 ${isDark ? 'text-stone-700' : 'text-stone-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className={`p-3 border-t ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
                  {replyTo && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-2 text-xs ${isDark ? 'bg-stone-800 border border-stone-700' : 'bg-stone-100 border border-stone-200'}`}>
                      <Reply className="w-3 h-3 text-amber-500 flex-shrink-0" />
                      <span className={`truncate flex-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Reponse a : {replyTo.content}</span>
                      <button onClick={() => setReplyTo(null)} className={isDark ? 'text-stone-600 hover:text-stone-400' : 'text-stone-400 hover:text-stone-600'}><X className="w-3 h-3" /></button>
                    </div>
                  )}

                  {/* Admin media attachment */}
                  {isAdmin && (
                    <div className="mb-2">
                      {adminMediaType ? (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${isDark ? 'bg-stone-800 border border-stone-700' : 'bg-stone-100 border border-stone-200'}`}>
                          <span className={`font-semibold flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                            {adminMediaType === 'image' ? '🖼 Image' : adminMediaType === 'pdf' ? '📄 PDF' : '🎬 Video'}
                          </span>
                          <input
                            type="text"
                            value={adminMediaUrl}
                            onChange={e => setAdminMediaUrl(e.target.value)}
                            placeholder="URL du fichier..."
                            className={`flex-1 bg-transparent outline-none min-w-0 ${isDark ? 'text-stone-200 placeholder-stone-600' : 'text-stone-800 placeholder-stone-400'}`}
                          />
                          <button onClick={() => { setAdminMediaType(null); setAdminMediaUrl(''); }} className={isDark ? 'text-stone-600 hover:text-stone-400' : 'text-stone-400 hover:text-stone-600'}><X className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className={`text-xs mr-1 ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>Joindre :</span>
                          {(['image', 'pdf', 'video'] as const).map(type => (
                            <button
                              key={type}
                              onClick={() => setAdminMediaType(type)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${isDark ? 'border-stone-700 text-stone-400 hover:border-amber-500/40 hover:text-amber-400' : 'border-stone-300 text-stone-500 hover:border-amber-400 hover:text-amber-600'}`}
                            >
                              {type === 'image' ? <Image className="w-3 h-3" /> : type === 'pdf' ? <FileText className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                              {type === 'image' ? 'Image' : type === 'pdf' ? 'PDF' : 'Video'}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Ecrire un message..."
                      className={`flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${isDark ? 'bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-600' : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'}`}
                    />
                    <button onClick={sendMessage} disabled={(!messageInput.trim() && !(isAdmin && adminMediaType && adminMediaUrl.trim())) || sendingMsg} className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center text-white transition-colors flex-shrink-0">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Members panel */}
            <div className={`hidden xl:block w-56 flex-shrink-0 rounded-2xl border overflow-hidden self-start sticky top-20 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
              <div className={`px-4 py-3 border-b ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
                <span className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>Membres ({members.length})</span>
              </div>
              <div className="p-2 space-y-0.5 max-h-96 overflow-y-auto">
                {/* Teacher */}
                <div className={`flex items-center gap-2.5 px-2 py-2 rounded-xl ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                  <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-amber-500 truncate">Professeur</div>
                    <div className={`text-xs truncate ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>Mbuta Sita Toma</div>
                  </div>
                </div>
                {members.map((m, i) => (
                  <div key={i} className={`flex items-center gap-2.5 px-2 py-2 rounded-xl transition-colors ${isDark ? 'hover:bg-stone-800' : 'hover:bg-stone-50'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isDark ? 'bg-stone-700 text-stone-300' : 'bg-stone-200 text-stone-600'}`}>
                      {m.full_name?.[0]?.toUpperCase() ?? m.email[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-medium truncate ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>{m.full_name || 'Etudiant'}</div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span className={`text-xs ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>Inscrit</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── MEMBERS VIEW ── */}
        {view === 'members' && (
          <div className="flex-1 max-w-2xl mx-auto">
            <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
              <div className={`px-5 py-4 border-b ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
                <h3 className={`font-bold text-sm ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{members.length} membre{members.length !== 1 ? 's' : ''} inscrit{members.length !== 1 ? 's' : ''}</h3>
              </div>
              <div className="divide-y divide-stone-800/30">
                {members.map((m, i) => (
                  <div key={i} className={`flex items-center gap-4 px-5 py-3.5 ${isDark ? 'hover:bg-stone-800/30' : 'hover:bg-stone-50'} transition-colors`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {m.full_name?.[0]?.toUpperCase() ?? m.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold truncate ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>{m.full_name || 'Etudiant'}</div>
                      <div className={`text-xs truncate ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{m.email}</div>
                    </div>
                    <div className={`text-xs flex-shrink-0 ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>
                      Inscrit le {new Date(m.enrolled_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}

      {/* Add Module */}
      {showAddModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl ${isDark ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-stone-200'}`}>
            <h3 className={`font-bold mb-4 ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>Nouveau module</h3>
            <div className="space-y-3">
              <input type="text" value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} placeholder="Titre du module" className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${isDark ? 'bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-600' : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'}`} />
              <textarea value={newModuleDesc} onChange={e => setNewModuleDesc(e.target.value)} placeholder="Description (optionnel)" rows={2} className={`w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${isDark ? 'bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-600' : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'}`} />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddModule(false)} className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold ${isDark ? 'border-stone-700 text-stone-400' : 'border-stone-300 text-stone-500'}`}>Annuler</button>
              <button onClick={addModule} disabled={!newModuleTitle.trim()} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors">Creer</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item */}
      {showAddItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${isDark ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-stone-200'}`}>
            <h3 className={`font-bold mb-4 ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>Ajouter un contenu</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-1.5">
                {(['video', 'pdf', 'image', 'audio', 'text'] as const).map(t => (
                  <button key={t} onClick={() => setNewItemType(t)} className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold border transition-all capitalize ${newItemType === t ? 'bg-amber-500 border-amber-500 text-white' : isDark ? 'border-stone-700 text-stone-400 hover:border-stone-600' : 'border-stone-300 text-stone-500 hover:border-stone-400'}`}>
                    <ItemIcon type={t} className="w-4 h-4" />
                    {t}
                  </button>
                ))}
              </div>
              <input type="text" value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} placeholder="Titre du contenu" className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${isDark ? 'bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-600' : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'}`} />
              {newItemType !== 'text' && (
                <input type="text" value={newItemUrl} onChange={e => setNewItemUrl(e.target.value)} placeholder={`URL du ${newItemType}`} className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${isDark ? 'bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-600' : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'}`} />
              )}
              <textarea value={newItemBody} onChange={e => setNewItemBody(e.target.value)} placeholder={newItemType === 'text' ? 'Contenu textuel...' : 'Description (optionnel)'} rows={3} className={`w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${isDark ? 'bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-600' : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'}`} />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddItem(null)} className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold ${isDark ? 'border-stone-700 text-stone-400' : 'border-stone-300 text-stone-500'}`}>Annuler</button>
              <button onClick={() => addItem(showAddItem)} disabled={savingItem || !newItemTitle.trim()} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                {savingItem ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
