import React, { useState } from 'react';
import { StudyEntry, SRSStage, Vocabulary, GrammarPoint } from '../types';
import { analyzeRawNotes } from '../services/geminiService';
import { Save, Sparkles, Loader2, Video, FileText, CheckCircle, Circle } from 'lucide-react';

interface AddVideoProps {
  onSave: (entry: StudyEntry) => void;
  onCancel: () => void;
}

const AddVideo: React.FC<AddVideoProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<{ vocab: Vocabulary[], grammar: GrammarPoint[], summary: string } | null>(null);
  
  // State for selection
  const [selectedVocabIndices, setSelectedVocabIndices] = useState<Set<number>>(new Set());
  const [selectedGrammarIndices, setSelectedGrammarIndices] = useState<Set<number>>(new Set());

  const handleAnalyze = async () => {
    if (!notes.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeRawNotes(notes);
      setAnalyzedData(result);
      if (result) {
        // Default select all
        setSelectedVocabIndices(new Set(result.vocab.map((_, i) => i)));
        setSelectedGrammarIndices(new Set(result.grammar.map((_, i) => i)));
      }
    } catch (e) {
      alert("AI 分析失败。请检查网络或 API Key。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleVocab = (index: number) => {
    const newSet = new Set(selectedVocabIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedVocabIndices(newSet);
  };

  const toggleGrammar = (index: number) => {
    const newSet = new Set(selectedGrammarIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedGrammarIndices(newSet);
  };

  const handleSave = () => {
    if (!title.trim()) return;

    // Filter data based on user selection
    const finalVocab = analyzedData ? analyzedData.vocab.filter((_, i) => selectedVocabIndices.has(i)) : [];
    const finalGrammar = analyzedData ? analyzedData.grammar.filter((_, i) => selectedGrammarIndices.has(i)) : [];

    const newEntry: StudyEntry = {
      id: crypto.randomUUID(),
      title,
      dateCreated: Date.now(),
      rawNotes: notes,
      structuredVocabulary: finalVocab,
      structuredGrammar: finalGrammar,
      summary: analyzedData?.summary || '',
      nextReviewDate: Date.now(), // Due immediately for first view
      interval: 0,
      easeFactor: 2.5,
      repetitionCount: 0,
      stage: SRSStage.New
    };

    onSave(newEntry);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">记录新视频</h2>
          <p className="text-slate-500">记录你的学习内容，AI 帮你整理后可点选保存。</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 font-medium text-sm">取消</button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
            <Video size={16} className="mr-2 text-primary-500" /> 视频标题 / 主题
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none bg-slate-50 focus:bg-white"
            placeholder="例如：在星巴克点咖啡"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Notes Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
            <FileText size={16} className="mr-2 text-primary-500" /> 原始笔记
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none bg-slate-50 focus:bg-white h-40 resize-none"
            placeholder="粘贴你听到的句子、单词或语法规则..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !notes.trim()}
              className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 shadow-md shadow-indigo-200"
            >
              {isAnalyzing ? (
                <><Loader2 size={16} className="mr-2 animate-spin" /> 正在分析...</>
              ) : (
                <><Sparkles size={16} className="mr-2" /> AI 智能整理笔记</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Results Preview */}
      {analyzedData && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="text-indigo-500" size={20} />
              <h3 className="font-bold text-lg text-slate-800">AI 分析结果</h3>
            </div>
            <span className="text-xs text-slate-400">点击卡片选中需要保存的内容</span>
          </div>

          {analyzedData.summary && (
             <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
               <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-1">摘要</h4>
               <p className="text-indigo-900 text-sm">{analyzedData.summary}</p>
             </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Vocabulary Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide">重点词汇 ({selectedVocabIndices.size})</h4>
              </div>
              {analyzedData.vocab.length === 0 ? <p className="text-slate-400 text-sm italic">未发现特定词汇。</p> : (
                <ul className="space-y-3">
                  {analyzedData.vocab.map((v, i) => {
                    const isSelected = selectedVocabIndices.has(i);
                    return (
                      <li 
                        key={i} 
                        onClick={() => toggleVocab(i)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all relative group ${
                          isSelected 
                            ? 'bg-primary-50 border-primary-500 shadow-sm' 
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="absolute top-3 right-3 transition-colors">
                          {isSelected 
                            ? <CheckCircle size={18} className="text-primary-500 fill-primary-100" /> 
                            : <Circle size={18} className="text-slate-300 group-hover:text-slate-400" />
                          }
                        </div>
                        <div className="pr-6">
                          <div className={`font-bold transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{v.word}</div>
                          <div className="text-xs text-slate-500 mb-1">{v.definition}</div>
                          <div className="text-xs text-slate-600 italic">"{v.example}"</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Grammar Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide">语法知识点 ({selectedGrammarIndices.size})</h4>
              </div>
               {analyzedData.grammar.length === 0 ? <p className="text-slate-400 text-sm italic">未发现特定语法点。</p> : (
                <ul className="space-y-3">
                  {analyzedData.grammar.map((g, i) => {
                    const isSelected = selectedGrammarIndices.has(i);
                    return (
                      <li 
                        key={i} 
                        onClick={() => toggleGrammar(i)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all relative group ${
                          isSelected 
                            ? 'bg-primary-50 border-primary-500 shadow-sm' 
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="absolute top-3 right-3 transition-colors">
                          {isSelected 
                            ? <CheckCircle size={18} className="text-primary-500 fill-primary-100" /> 
                            : <Circle size={18} className="text-slate-300 group-hover:text-slate-400" />
                          }
                        </div>
                        <div className="pr-6">
                          <div className={`font-bold text-sm transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{g.title}</div>
                          <div className="text-xs text-slate-500 mb-1">{g.explanation}</div>
                          <div className="text-xs text-slate-600 italic border-l-2 border-primary-300 pl-2 mt-2">{g.example}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="flex items-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
        >
          <Save size={20} className="mr-2" />
          {analyzedData ? `保存选中内容 (${selectedVocabIndices.size + selectedGrammarIndices.size})` : '保存到知识库'}
        </button>
      </div>
    </div>
  );
};

export default AddVideo;