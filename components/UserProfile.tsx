import React from 'react';
import { User } from 'firebase/auth';
import { User as UserIcon, Mail, Shield, LogOut } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">账户管理</h1>
        <p className="text-slate-500">查看你的账户信息。</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 flex items-center space-x-6">
          <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white/20 shadow-lg">
             {user.photoURL ? (
               <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
             ) : (
               user.email ? user.email[0].toUpperCase() : 'U'
             )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {user.displayName || '用户'}
            </h2>
            <p className="text-slate-300 flex items-center text-sm">
              <Mail size={14} className="mr-2" />
              {user.email}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
           <div className="flex items-start p-4 bg-slate-50 rounded-xl border border-slate-100">
             <Shield className="text-green-600 mt-1 mr-4" size={24} />
             <div>
               <h3 className="font-bold text-slate-900">账户状态</h3>
               <p className="text-sm text-slate-500 mt-1">你的账户已激活，数据正在安全同步到云端。</p>
               <div className="mt-2 inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                 已认证
               </div>
             </div>
           </div>

           <div className="pt-6 border-t border-slate-100">
             <button 
               onClick={onLogout}
               className="w-full flex items-center justify-center px-6 py-4 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors border border-red-100"
             >
               <LogOut size={20} className="mr-2" />
               退出当前账户
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
