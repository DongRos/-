import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AddVideo from './components/AddVideo';
import ReviewSession from './components/ReviewSession';
import VideoLibrary from './components/VideoLibrary';
import { ViewState, StudyEntry, DailyStats } from './types';
import { getEntries, saveEntries, getStats, saveStats, recordActivity } from './services/storageService';
import { getReviewStatus } from './services/srsService';
import { auth, provider } from './firebase';
import { signInWithPopup, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Loader2, LogIn } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>('dashboard');
  const [entries, setEntries] = useState<StudyEntry[]>([]);
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [reviewQueue, setReviewQueue] = useState<StudyEntry[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const cloudEntries = await getEntries();
        const cloudStats = await getStats();
        setEntries(cloudEntries);
        setStats(cloudStats);
      } else {
        setEntries([]);
        setStats([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. 保存数据
  useEffect(() => {
    // 只要加载完了(loading为false)且有人登录，就同步数据（即使是空数组也要存）
    if (!loading && user) {
      saveEntries(entries);
    }
  }, [entries, user, loading]); // 👈 别忘了这里 dependency 数组里要加上 loading

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert("登录失败，请重试: " + error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleNavigate = (newView: ViewState) => {
    setView(newView);
  };

  const handleAddEntry = (entry: StudyEntry) => {
    const updatedEntries = [...entries, entry];
    setEntries(updatedEntries);
    recordActivity('learn');
    setView('library');
  };

  const handleUpdateEntries = (updatedEntries: StudyEntry[]) => {
    setEntries(updatedEntries);
  };

  const startReview = () => {
    const { due } = getReviewStatus(entries);
    setReviewQueue(due);
    setView('review');
  };

  const handleReviewComplete = (updatedEntry: StudyEntry) => {
    const updatedEntries = entries.map(e => e.id === updatedEntry.id ? updatedEntry : e);
    setEntries(updatedEntries);
    recordActivity('review');
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">欢迎使用智能复盘</h1>
          <p className="text-slate-500 mb-8">请登录以同步你的学习数据</p>
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Google 账号登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Layout currentView={view} onNavigate={handleNavigate}>
        {view === 'dashboard' && <Dashboard entries={entries} stats={stats} onStartReview={startReview} onAddVideo={() => setView('add-video')} />}
        {view === 'add-video' && <AddVideo onSave={handleAddEntry} onCancel={() => setView('dashboard')} />}
        {view === 'review' && <ReviewSession entriesToReview={reviewQueue} onCompleteItem={handleReviewComplete} onExit={() => setView('dashboard')} />}
        {view === 'library' && <VideoLibrary entries={entries} onUpdateEntries={handleUpdateEntries} />}
      </Layout>
      <button onClick={handleLogout} className="fixed bottom-4 right-4 text-xs text-slate-400 hover:text-red-500 z-50">
        退出登录
      </button>
    </div>
  );
};

export default App;
