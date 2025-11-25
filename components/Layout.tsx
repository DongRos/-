// components/Layout.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ViewState } from '../types';
import { User } from 'firebase/auth'; // 👈 引入 User 类型
import { LayoutDashboard, PlusCircle, BookOpen, Library, Menu, X, User as UserIcon, LogOut, Heart, Settings, ChevronUp } from 'lucide-react';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
  user: User | null; // 👈 新增
  onLogout: () => void; // 👈 新增
}

const NavItem = ({ 
  view, 
  current, 
  label, 
  icon: Icon, 
  onClick 
}: { 
  view: ViewState; 
  current: ViewState; 
  label: string; 
  icon: any; 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 mb-2 rounded-lg transition-all duration-200 group ${
      current === view 
        ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200' 
        : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900'
    }`}
  >
    <Icon size={20} className={`mr-3 ${current === view ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
    <span className="font-medium">{label}</span>
  </button>
);

// 用户菜单组件
const UserMenu = ({ user, onLogout, onNavigate }: { user: User, onLogout: () => void, onNavigate: (v: ViewState) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all text-left"
      >
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold mr-3 border-2 border-white shadow-sm overflow-hidden">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            user.email ? user.email[0].toUpperCase() : 'U'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{user.displayName || user.email?.split('@')[0]}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
        <ChevronUp size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropup Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-fade-in-up z-50">
           <button onClick={() => { onNavigate('profile'); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center">
             <UserIcon size={16} className="mr-2 text-slate-400" /> 账户管理
           </button>
           <button onClick={() => { onNavigate('favorites'); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center">
             <Heart size={16} className="mr-2 text-slate-400" /> 我的收藏
           </button>
           <div className="h-px bg-slate-100 my-1"></div>
           <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
             <LogOut size={16} className="mr-2" /> 退出登录
           </button>
        </div>
      )}
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm z-20 sticky top-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-indigo-400 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">智</div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">智能英语复盘</span>
        </div>
        <div className="flex items-center space-x-4">
           {/* Mobile Avatar (Simple Navigate to Profile) */}
           {user && (
             <button onClick={() => onNavigate('profile')} className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-slate-200 overflow-hidden">
                {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover"/> : (user.email ? user.email[0].toUpperCase() : 'U')}
             </button>
           )}
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
             {isMobileMenuOpen ? <X /> : <Menu />}
           </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-10 w-64 bg-white/80 backdrop-blur-md border-r border-slate-200 p-6 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen flex flex-col justify-between
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div>
          <div className="hidden md:flex items-center space-x-3 mb-10 px-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-indigo-400 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary-200">智</div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">智能英语复盘</span>
          </div>

          <nav>
            <div className="px-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">菜单</div>
            <NavItem view="dashboard" current={currentView} label="学习概览" icon={LayoutDashboard} onClick={() => { onNavigate('dashboard'); setIsMobileMenuOpen(false); }} />
            <NavItem view="review" current={currentView} label="每日复盘" icon={BookOpen} onClick={() => { onNavigate('review'); setIsMobileMenuOpen(false); }} />
            <NavItem view="add-video" current={currentView} label="记录视频" icon={PlusCircle} onClick={() => { onNavigate('add-video'); setIsMobileMenuOpen(false); }} />
            
            <div className="px-2 mt-8 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">归档</div>
            <NavItem view="library" current={currentView} label="知识库" icon={Library} onClick={() => { onNavigate('library'); setIsMobileMenuOpen(false); }} />
            <NavItem view="favorites" current={currentView} label="我的收藏" icon={Heart} onClick={() => { onNavigate('favorites'); setIsMobileMenuOpen(false); }} />
          </nav>
        </div>

        {/* User Profile Area (Replaces the Quote Card) */}
        {user && (
           <div className="mt-auto pt-6 border-t border-slate-100">
              <UserMenu user={user} onLogout={onLogout} onNavigate={onNavigate} />
           </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen p-4 md:p-8 lg:p-10 relative">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-0 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
