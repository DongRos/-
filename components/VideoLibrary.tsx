import React, { useState, useEffect } from 'react';
import { StudyEntry } from '../types';
import { Search, Calendar, ChevronRight, ArrowLeft, Book, Type, FileText, Hash, Star, Settings, Trash2, Pin, CheckSquare, Square, X, Check, AlertCircle } from 'lucide-react';

interface LibraryProps {
  entries: StudyEntry[];
  onUpdateEntries: (entries: StudyEntry[]) => void;
  onlyFavorites?: boolean;
}

const VideoLibrary: React.FC<LibraryProps> = ({ entries, onUpdateEntries, onlyFavorites = false }) => {
  const [search, setSearch] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<StudyEntry | null>(null);
  
  const [isManaging, setIsManaging] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    setDeleteConfirm(false);
  }, [selectedIds, isManaging]);

  const filtered = entries.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                          e.rawNotes.toLowerCase().includes(search.toLowerCase());
    const matchesFav = onlyFavorites ? e.isFavorite : true;
    return matchesSearch && matchesFav;
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.dateCreated - a.dateCreated;
  });

  const handleTogglePin = (e: React.MouseEvent, entry: StudyEntry) => {
    e.stopPropagation();
    const updated = entries.map(item => 
      item.id === entry.id ? { ...item, isPinned: !item.isPinned } : item
    );
    onUpdateEntries(updated);
  };

  const handleToggleFavorite = (e: React.MouseEvent, entry: StudyEntry) => {
    e.stopPropagation();
    const updated = entries.map(item => 
      item.id === entry.id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    onUpdateEntries(updated);
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(e => e.id)));
    }
  };

  const handleBatchAction = (action: 'pin' | 'favorite') => {
    if (selectedIds.size === 0) return;
    setDeleteConfirm(false);
    let updated = [...entries];
    if (action === 'pin') {
      const selectedEntries = updated.filter(e => selectedIds.has(e.id));
      const allPinned = selectedEntries.every(e => e.isPinned);
      updated = updated.map(e => selectedIds.has(e.id) ? { ...e, isPinned: !allPinned } : e);
    } else if (action === 'favorite') {
       const selectedEntries = updated.filter(e => selectedIds.has(e.id));
       const allFav = selectedEntries.every(e => e.isFavorite);
       updated = updated.map(e => selectedIds.has(e.id) ? { ...e, isFavorite: !allFav } : e);
    }
    onUpdateEntries(updated);
  };

  const handleDelete = () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    const updated = entries.filter(e => !selectedIds.has(e.id));
    onUpdateEntries(updated);
    setIsManaging(false);
    setSelectedIds(new Set());
    setDeleteConfirm(false);
  };

  if (selectedEntry) {
    return (
      <div className="animate-fade-in space-y-8 pb-10">
        <style>{`
          .rich-text-display h3 { font-size: 1.5em; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; color: #1e293b; }
          .rich-text-display h4 { font-size: 1.25em; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; color: #334155; }
          .rich-text-display ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.5em; }
          .rich-text-display ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.5em; }
          .rich-text-display blockquote { border-left: 4px solid #cbd5e1; padding-left: 1em; color: #64748b; font-style: italic; margin-bottom: 0.5em; background: #f8fafc; py-2; }
          .rich-text-display pre { background-color: #f1f5f9; padding: 1em; border-radius: 0.5em; font-family: monospace; font-size: 0.9em; overflow-x: auto; margin-bottom: 0.5em; border: 1px solid #e2e8f0; }
          .rich-text-display b, .rich-text-display strong { font-weight: 700; color: #0f172a; }
          .rich-text-display i, .rich-text-display em { font-style: italic; }
          .rich-text-display u { text-decoration: underline; text-decoration-color: #cbd5e1; text-underline-offset: 4px; }
          .rich-text-display p { margin-bottom: 0.75em; line-height: 1.7; }
        `}</style>

        <div className="flex items-start justify-between">
          <div className="space-y-4 w-full">
            <button 
              onClick={() => setSelectedEntry(null)}
              className="flex items-center text-slate-500 hover:text-slate-800 transition-colors font-medium group"
            >
              <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              返回列表
            </button>
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-slate-900 leading-tight flex items-center">
                {selectedEntry.title}
                {selectedEntry.isFavorite && <Star className="ml-3 text-yellow-400 fill-yellow-400" size={24} />}
                {selectedEntry.isPinned && <Pin className="ml-2 text-primary-500 fill-primary-500" size={24} />}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span className="flex items-center"><Calendar size={14} className="mr-1" /> {new Date(selectedEntry.dateCreated).toLocaleDateString('zh-CN')}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center ${
                selectedEntry.stage === 3 ? 'bg-green-100 text-green-700' :
                selectedEntry.stage === 2 ? 'bg-blue-100 text-blue-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {selectedEntry.stage === 0 ? '新学' : selectedEntry.stage === 3 ? '已掌握' : '学习中'}
              </span>
            </div>
          </div>
        </div>

        {/* 1. 内容摘要 (保持在最上面) */}
        {selectedEntry.summary && (
          <div className="bg-gradient-to-r from-indigo-50 to-slate-50 p-6 rounded-2xl border border-indigo-100">
            <div className="flex items-center mb-3">
              <Hash size={18} className="text-indigo-500 mr-2" />
              <h3 className="font-bold text-indigo-900">内容摘要</h3>
            </div>
            <p className="text-indigo-800/80 text-sm leading-relaxed">{selectedEntry.summary}</p>
          </div>
        )}

        {/* 2. 原始笔记 (从最下面移到了这里) */}
        <div className="pt-4 border-t border-slate-200">
           <div className="flex items-center mb-4 text-slate-400">
             <FileText size={16} className="mr-2" />
             <h3 className="text-sm font-bold uppercase tracking-wider">原始笔记</h3>
           </div>
           <div 
             className="rich-text-display bg-slate-50 p-6 rounded-xl text-sm text-slate-600 leading-relaxed border border-slate-100"
             dangerouslySetInnerHTML={{ __html: selectedEntry.rawNotes }}
           />
        </div>

        {/* 3. 重点词汇 */}
        <div>
          <div className="flex items-center mb-4 space-x-2">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
              <Type size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">重点词汇 ({selectedEntry.structuredVocabulary.length})</h2>
          </div>
          {selectedEntry.structuredVocabulary.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedEntry.structuredVocabulary.map((vocab, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-lg font-bold text-slate-800 group-hover:text-orange-600 transition-colors">{vocab.word}</span>
                  </div>
                  <div className="text-sm text-slate-600 mb-3 font-medium">{vocab.definition}</div>
                  <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500 italic border-l-2 border-slate-200 group-hover:border-orange-300 transition-colors">
                    "{vocab.example}"
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 text-sm italic pl-2">无记录的词汇。</div>
          )}
        </div>

        {/* 4. 语法知识 (放在最后) */}
        <div>
          <div className="flex items-center mb-4 space-x-2">
             <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Book size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">语法知识 ({selectedEntry.structuredGrammar.length})</h2>
          </div>
          {selectedEntry.structuredGrammar.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {selectedEntry.structuredGrammar.map((grammar, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                  <h3 className="text-base font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{grammar.title}</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">{grammar.explanation}</p>
                  <div className="flex items-center bg-blue-50/50 p-3 rounded-lg border border-blue-50 text-blue-800/80 text-xs font-medium">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] uppercase mr-2 tracking-wider">Example</span>
                    {grammar.example}
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-slate-400 text-sm italic pl-2">无记录的语法点。</div>
          )}
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in relative pb-20">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{onlyFavorites ? '我的收藏' : '我的知识库'}</h1>
          <p className="text-slate-500">
            {isManaging ? `已选择 ${selectedIds.size} 个项目` : (onlyFavorites ? '回顾你收藏的重点内容。' : '管理和回顾你的学习笔记。')}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`relative transition-all duration-300 ${isManaging ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100 w-full md:w-auto'}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="搜索主题..."
              className="pl-10 pr-4 py-2 rounded-lg bg-slate-800 border-2 border-primary-500 text-white placeholder-slate-400 focus:ring-4 focus:ring-primary-500/20 outline-none w-full md:w-64 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button 
            onClick={() => {
              setIsManaging(!isManaging);
              setSelectedIds(new Set());
              setDeleteConfirm(false);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center ${
              isManaging 
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {isManaging ? <><X size={18} className="mr-2"/> 取消</> : <><Settings size={18} className="mr-2"/> 管理</>}
          </button>
        </div>
      </div>

      {isManaging && (
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200 flex items-center justify-between animate-slide-in-down mb-4">
          <button onClick={toggleAll} className="flex items-center text-sm font-bold text-slate-600 hover:text-slate-900">
             {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare className="mr-2 text-primary-500" /> : <Square className="mr-2" />}
             全选
          </button>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => handleBatchAction('favorite')}
              disabled={selectedIds.size === 0}
              className="p-2 rounded-lg hover:bg-yellow-50 text-slate-500 hover:text-yellow-500 transition-colors disabled:opacity-50"
              title="收藏/取消收藏"
            >
              <Star size={20} className={selectedIds.size > 0 ? "fill-current" : ""} />
            </button>
            <button 
              onClick={() => handleBatchAction('pin')}
              disabled={selectedIds.size === 0}
              className="p-2 rounded-lg hover:bg-primary-50 text-slate-500 hover:text-primary-600 transition-colors disabled:opacity-50"
              title="置顶/取消置顶"
            >
              <Pin size={20} className={selectedIds.size > 0 ? "fill-current" : ""} />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-2 self-center"></div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={selectedIds.size === 0}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                deleteConfirm 
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-md ring-2 ring-red-600 ring-offset-1' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              {deleteConfirm ? <AlertCircle size={18} className="mr-2" /> : <Trash2 size={18} className="mr-2" />}
              {deleteConfirm ? '确认删除？' : `删除 (${selectedIds.size})`}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              {onlyFavorites ? <Star size={32} className="opacity-50" /> : <Book size={32} className="opacity-50" />}
            </div>
            <p>{onlyFavorites ? '你还没有收藏任何笔记。' : '没有找到相关条目。'}</p>
          </div>
        ) : (
          filtered.map(entry => {
            const isSelected = selectedIds.has(entry.id);
            return (
              <div 
                key={entry.id} 
                onClick={() => isManaging ? toggleSelection(entry.id) : setSelectedEntry(entry)}
                className={`
                  bg-white p-5 rounded-xl border shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between group relative overflow-hidden
                  ${isManaging ? 'cursor-pointer' : 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5'}
                  ${isSelected ? 'border-primary-500 ring-1 ring-primary-500 bg-primary-50/10' : 'border-slate-100'}
                `}
              >
                <div className="absolute top-0 right-0 p-2 flex space-x-1 z-10 pointer-events-none">
                   {entry.isPinned && <Pin size={16} className="text-primary-500 fill-primary-500 transform rotate-45" />}
                   {entry.isFavorite && <Star size={16} className="text-yellow-400 fill-yellow-400" />}
                </div>

                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                   entry.stage === 3 ? 'bg-green-500' :
                   entry.stage === 2 ? 'bg-blue-500' :
                   'bg-slate-300'
                }`} />

                <div className="flex items-center w-full">
                  {isManaging && (
                    <div className="mr-4 pl-2 flex-shrink-0 text-slate-400">
                      {isSelected 
                        ? <CheckSquare className="text-primary-500" size={24} /> 
                        : <Square size={24} />
                      }
                    </div>
                  )}

                  <div className="mb-4 md:mb-0 pl-3 flex-1 min-w-0">
                    <h3 className={`font-bold text-lg transition-colors truncate pr-8 ${isSelected ? 'text-primary-700' : 'text-slate-800 group-hover:text-primary-600'}`}>
                      {entry.title}
                    </h3>
                    <div className="flex items-center text-xs text-slate-400 mt-2 space-x-3">
                      <span className="flex items-center"><Calendar size={12} className="mr-1" /> {new Date(entry.dateCreated).toLocaleDateString('zh-CN')}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>
                        {entry.stage === 0 ? '新学' : entry.stage === 3 ? '已掌握' : '学习中'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-1 max-w-xl opacity-80"
                       dangerouslySetInnerHTML={{ __html: entry.summary || entry.rawNotes.replace(/<[^>]+>/g, '') }}
                    ></p>
                  </div>
                  
                  {!isManaging && (
                    <div className="flex items-center pl-3 md:pl-0 flex-shrink-0 space-x-2">
                       <button 
                          onClick={(e) => handleTogglePin(e, entry)}
                          className={`p-2 rounded-full transition-colors ${entry.isPinned ? 'text-primary-500 bg-primary-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`}
                          title={entry.isPinned ? "取消置顶" : "置顶"}
                       >
                         <Pin size={18} className={entry.isPinned ? "fill-current" : ""} />
                       </button>

                       <button 
                          onClick={(e) => handleToggleFavorite(e, entry)}
                          className={`p-2 rounded-full transition-colors ${entry.isFavorite ? 'text-yellow-400 bg-yellow-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`}
                          title={entry.isFavorite ? "取消收藏" : "收藏"}
                       >
                         <Star size={18} className={entry.isFavorite ? "fill-current" : ""} />
                       </button>

                       <div className="w-px h-5 bg-slate-200 mx-2"></div>

                       <ChevronRight className="text-slate-300 group-hover:text-primary-500 transition-colors" size={20} />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VideoLibrary;
