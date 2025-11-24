import React, { useMemo } from 'react';
import { StudyEntry, DailyStats } from '../types';
import { getReviewStatus } from '../services/srsService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowRight, Brain, CheckCircle, Clock } from 'lucide-react';

interface DashboardProps {
  entries: StudyEntry[];
  stats: DailyStats[];
  onStartReview: () => void;
  onAddVideo: () => void;
}

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      <p className="text-xs text-slate-400 mt-2">{sub}</p>
    </div>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ entries, stats, onStartReview, onAddVideo }) => {
  const { due } = useMemo(() => getReviewStatus(entries), [entries]);
  
  const chartData = useMemo(() => {
    // Generate last 7 days data, filling zeros if needed
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const stat = stats.find(s => s.date === dateStr) || { reviewsCompleted: 0, newItemsLearned: 0 };
      
      // Format label like "Mon" or "Oct 24" (using short date for chart)
      const label = d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
      result.push({ name: label, reviews: stat.reviewsCompleted, learned: stat.newItemsLearned });
    }
    return result;
  }, [stats]);

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">欢迎回来！ 👋</h1>
        <p className="text-slate-500">这是你今天的学习概览。</p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="今日待复盘" 
          value={due.length} 
          sub={due.length > 0 ? "别让它们堆积起来！" : "目前已全部完成。"} 
          icon={Brain} 
          color="bg-primary-500" 
        />
        <StatCard 
          title="视频总数" 
          value={entries.length} 
          sub="继续扩展你的知识库。" 
          icon={CheckCircle} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="打卡状态" 
          value={stats.length > 0 ? "活跃中" : "0 天"} 
          sub="坚持是关键。" 
          icon={Clock} 
          color="bg-orange-400" 
        />
      </div>

      {/* Main Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">学习动态</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
                  cursor={{fill: '#f1f5f9'}}
                />
                <Bar dataKey="learned" name="新增视频" fill="#818cf8" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="reviews" name="复盘数量" fill="#4ade80" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          
          <div>
            <h3 className="text-xl font-bold mb-2">今日重点</h3>
            <p className="text-slate-300 text-sm mb-6">你有 {due.length} 个条目等待复盘。科学的重复能确保你过目不忘。</p>
          </div>

          <div className="space-y-3 relative z-10">
            <button 
              onClick={onStartReview}
              disabled={due.length === 0}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium ${
                due.length > 0 
                  ? 'bg-primary-500 hover:bg-primary-400 text-white shadow-lg shadow-primary-900/20' 
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>开始复盘</span>
              <Brain size={18} />
            </button>
            <button 
              onClick={onAddVideo}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all font-medium backdrop-blur-md"
            >
              <span>记录新视频</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;