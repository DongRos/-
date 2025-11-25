import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, PlusCircle, BookOpen, Library, Menu, X } from 'lucide-react';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
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

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm z-20 sticky top-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-indigo-400 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">智</div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">智能英语复盘</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-10 w-64 bg-white/80 backdrop-blur-md border-r border-slate-200 p-6 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
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
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 text-white shadow-lg">
            <h4 className="font-semibold text-sm mb-1">坚持就是胜利！</h4>
            <p className="text-xs text-slate-300">每日复盘是掌握语言的关键。</p>
          </div>
        </div>
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