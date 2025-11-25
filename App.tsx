// App.tsx
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AddVideo from './components/AddVideo';
import ReviewSession from './components/ReviewSession';
import VideoLibrary from './components/VideoLibrary';
import UserProfile from './components/UserProfile'; // 👈 引入新组件
import { ViewState, StudyEntry, DailyStats } from './types';
import { getEntries, saveEntries, getStats, saveStats, recordActivity } from './services/storageService';
import { getReviewStatus } from './services/srsService';
import { auth, provider } from './firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Loader2, LogIn, Mail, Lock } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

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

  useEffect(() => {
    if (!loading && user) {
      saveEntries(entries);
    }
  }, [entries, user, loading]);

  const handleGoogleLogin = async () => {
    try {
      setAuthError('');
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      setAuthError("Google 登录失败: " + error.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (!email || !password) {
      setAuthError("请输入邮箱和密码");
      return;
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("auth/invalid-email")) msg = "邮箱格式不正确";
      if (msg.includes("auth/user-not-found")) msg = "该邮箱尚未注册";
      if (msg.includes("auth/wrong-password")) msg = "密码错误";
      if (msg.includes("auth/email-already-in-use")) msg = "该邮箱已被注册";
      if (msg.includes("auth/weak-password")) msg = "密码太弱（至少6位）";
      setAuthError(msg);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setEmail('');
    setPassword('');
    setView('dashboard'); // 退出后重置视图
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full transition-all">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
            {isRegistering ? '注册新账号' : '欢迎回来'}
          </h1>
          <p className="text-slate-500 mb-8 text-center">同步你的学习数据到云端</p>

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="email" 
                placeholder="邮箱地址" 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="password" 
                placeholder="密码" 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            
            {authError && <div className="text-red-500 text-sm text-center">{authError}</div>}

            <button 
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              {isRegistering ? '立即注册' : '登录'}
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-sm">或者</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="mt-4 space-y-4">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              Google 账号登录
            </button>
            
            <div className="text-center text-sm text-slate-500">
              {isRegistering ? '已有账号？' : '还没有账号？'} 
              <button 
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setAuthError('');
                }}
                className="text-indigo-600 font-bold ml-1 hover:underline"
              >
                {isRegistering ? '去登录' : '去注册'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 👇👇👇 这里的 Layout 现在接收 user 和 onLogout 属性 👇👇👇
  return (
    <div className="relative">
      <Layout currentView={view} onNavigate={handleNavigate} user={user} onLogout={handleLogout}>
        {view === 'dashboard' && <Dashboard entries={entries} stats={stats} onStartReview={startReview} onAddVideo={() => setView('add-video')} />}
        {view === 'add-video' && <AddVideo onSave={handleAddEntry} onCancel={() => setView('dashboard')} />}
        {view === 'review' && <ReviewSession entriesToReview={reviewQueue} onCompleteItem={handleReviewComplete} onExit={() => setView('dashboard')} />}
        {view === 'library' && <VideoLibrary entries={entries} onUpdateEntries={handleUpdateEntries} />}
        {/* 👇 新增的两个页面 */}
        {view === 'favorites' && <VideoLibrary entries={entries} onUpdateEntries={handleUpdateEntries} onlyFavorites={true} />}
        {view === 'profile' && <UserProfile user={user} onLogout={handleLogout} />}
      </Layout>
    </div>
  );
};

export default App;
