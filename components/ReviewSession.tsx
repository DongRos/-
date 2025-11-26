import React, { useState } from 'react';
import { StudyEntry } from '../types';
import { calculateNextReview } from '../services/srsService';
import { Check, RotateCcw, GraduationCap, Clock } from 'lucide-react';

interface ReviewSessionProps {
  entriesToReview: StudyEntry[];
  onCompleteItem: (updatedEntry: StudyEntry) => void;
  onExit: () => void;
}

const ReviewSession: React.FC<ReviewSessionProps> = ({ entriesToReview, onCompleteItem, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  if (entriesToReview.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
           <GraduationCap className="text-primary-600" size={40} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">全部完成！</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">你已完成今日的所有复盘任务。保持进度的感觉真棒！</p>
        <button 
          onClick={onExit}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
        >
          返回概览
        </button>
      </div>
    );
  }

  const currentEntry = entriesToReview[currentIndex];

  const handleRate = (rating: number) => {
    const updated = calculateNextReview(currentEntry, rating);
    onCompleteItem(updated);

    if (currentIndex < entriesToReview.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Completed current batch
      onExit();
    }
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-140px)] flex flex-col justify-center animate-fade-in">
      
      {/* 注入富文本样式 */}
      <style>{`
        .rich-text-display h3 { font-size: 1.25em; font-weight: bold; margin-top: 0.75em; margin-bottom: 0.25em; color: #1e293b; }
        .rich-text-display h4 { font-size: 1.1em; font-weight: bold; margin-top: 0.75em; margin-bottom: 0.25em; color: #334155; }
        .rich-text-display ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.5em; }
        .rich-text-display ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.5em; }
        .rich-text-display blockquote { border-left: 4px solid #cbd5e1; padding-left: 1em; color: #64748b; font-style: italic; margin-bottom: 0.5em; background: #f8fafc; padding-top: 2px; padding-bottom: 2px; }
        .rich-text-display pre { background-color: #f1f5f9; padding: 0.5em; border-radius: 0.5em; font-family: monospace; font-size: 0.9em; overflow-x: auto; margin-bottom: 0.5em; border: 1px solid #e2e8f0; }
        .rich-text-display b, .rich-text-display strong { font-weight: 700; color: #0f172a; }
        .rich-text-display i, .rich-text-display em { font-style: italic; }
        .rich-text-display u { text-decoration: underline; text-decoration-color: #cbd5e1; text-underline-offset: 4px; }
        .rich-text-display p { margin-bottom: 0.5em; line-height: 1.6; }
      `}</style>

      {/* Progress Bar */}
      <div className="mb-6 flex items-center justify-between text-sm font-medium text-slate-400">
        <span>复盘进度</span>
        <span>{currentIndex + 1} / {entriesToReview.length}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-primary-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / entriesToReview.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative flex-1 flex flex-col">
        {/* Front (Always Visible) */}
        <div className="p-8 md:p-12 flex-1 flex flex-col items-center justify-center text-center border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/50">
           <h3 className="text-xs font-bold tracking-widest text-primary-500 uppercase mb-4">主题</h3>
           <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">{currentEntry.title}</h2>
           {!showAnswer && (
             <p className="text-slate-400 text-sm">点击显示来回忆你的笔记、词汇和语法。</p>
           )}
        </div>

        {/* Back (Conditional) */}
        {showAnswer ? (
          <div className="p-8 bg-slate-50 flex-1 overflow-y-auto max-h-[400px] animate-fade-in">
             <div className="space-y-6 text-left">
                {currentEntry.summary && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">摘要</h4>
                    <p className="text-slate-700">{currentEntry.summary}</p>
                  </div>
                )}

                {currentEntry
