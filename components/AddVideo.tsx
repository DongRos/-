import React, { useState, useRef } from 'react';
import { StudyEntry, SRSStage, Vocabulary, GrammarPoint } from '../types';
import { analyzeRawNotes } from '../services/geminiService';
import { 
  Save, Sparkles, Loader2, Video, FileText, CheckCircle, Circle,
  Bold, Italic, Underline, Strikethrough, List, Heading1, Heading2, Quote, Code, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';

interface AddVideoProps {
  onSave: (entry: StudyEntry) => void;
  onCancel: () => void;
}

// 修复点1：使用 onMouseDown 代替 onClick，防止按钮点击时输入框失去焦点
const ToolbarBtn = ({ icon: Icon, action, title, active = false }: any) => (
  <button
    onMouseDown={(e) => { 
      e.preventDefault(); // 阻止默认行为（防止失去焦点）
      action(); 
    }}
    title={title}
    className={`p-2 rounded-lg transition-all ${
      active 
        ? 'bg-indigo-100 text-indigo-700' 
        : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
    }`}
  >
    <Icon size={18} />
  </button>
);

const AddVideo: React.FC<AddVideoProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState(''); // 存储 HTML
  const editorRef = useRef<HTMLDivElement>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<{ vocab: Vocabulary[], grammar: GrammarPoint[], summary: string } | null>(null);
  
  const [selectedVocabIndices, setSelectedVocabIndices] = useState<Set<number>>(new Set());
  const [selectedGrammarIndices, setSelectedGrammarIndices] = useState<Set<number>>(new Set());

  // 执行命令
  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    // 确保命令执行后输入框重新获得焦点（双重保险）
    if (editorRef.current) {
       editorRef.current.focus();
    }
  };

  const handleAnalyze = async () => {
    const rawText = editorRef.current?.innerText || '';
    if (!rawText.trim()) {
      alert("请先输入笔记内容");
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeRawNotes(rawText);
      setAnalyzedData(result);
      if (result) {
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
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setSelectedVocabIndices(newSet);
  };

  const toggleGrammar = (index: number) => {
    const newSet = new Set(selectedGrammarIndices);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setSelectedGrammarIndices(newSet);
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const finalVocab = analyzedData ? analyzedData.vocab.filter((_, i) => selectedVocabIndices.has(i)) : [];
    const finalGrammar = analyzedData ? analyzedData.grammar.filter((_, i) => selectedGrammarIndices.has(i)) : [];

    const newEntry: StudyEntry = {
      id: crypto.randomUUID(),
      title,
      dateCreated: Date.now(),
      rawNotes: notes, // 保存带样式的 HTML
      structuredVocabulary: finalVocab,
      structuredGrammar: finalGrammar,
      summary: analyzedData?.summary || '',
      nextReviewDate: Date.now(),
      interval: 0,
      easeFactor: 2.5,
      repetitionCount: 0,
      stage: SRSStage.New
    };

    onSave(newEntry);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up pb-10">
      
      {/* 修复点2：手动注入 CSS 样式，解决 Tailwind 重置导致 H1/H2 看起来像普通文本的问题 */}
      <style>{`
        .rich-editor h3 { font-size: 1.5em; font-weight: bold; margin-top: 0.5em; margin-bottom: 0.25em; color: #1e293b; }
        .rich-editor h4 { font-size: 1.25em; font-weight: bold; margin-top: 0.5em; margin-bottom: 0.25em; color: #334155; }
        .rich-editor ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.5em; }
        .rich-editor ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.5em; }
        .rich-editor blockquote { border-left: 4px solid #cbd5e1; padding-left: 1em; color: #64748b; font-style: italic; margin-bottom: 0.5em; }
        .rich-editor pre { background-color: #f1f5f9; padding: 0.75em; border-radius: 0.5em; font-family: monospace; font-size: 0.9em; overflow-x: auto; margin-bottom: 0.5em; border: 1px solid #e2e8f0; }
        .rich-editor b, .rich-editor strong { font-weight: 700; }
        .rich-editor i, .rich-editor em { font-style: italic; }
        .rich-editor u { text-decoration: underline; }
      `}</style>

      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">记录新视频</h2>
          <p className="text-slate-500">记录你的学习内容，支持富文本编辑，AI 帮你整理。</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 font-medium text-sm">取消</button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
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

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
            <FileText size={16} className="mr-2 text-primary-500" /> 原始笔记 (支持格式编辑)
          </label>
          
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white focus-within:ring-4 focus-within:ring-primary-500/10 focus-within:border-primary-500 transition-all">
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/50 select-none">
              <div className="flex space-x-1 border-r border-slate-200 pr-2 mr-1">
                <ToolbarBtn icon={Bold} title="加粗" action={() => execCmd('bold')} />
                <ToolbarBtn icon={Italic} title="斜体" action={() => execCmd('italic')} />
                <ToolbarBtn icon={Underline} title="下划线" action={() => execCmd('underline')} />
                <ToolbarBtn icon={Strikethrough} title="删除线" action={() => execCmd('strikeThrough')} />
              </div>
              
              <div className="flex space-x-1 border-r border-slate-200 pr-2 mr-1">
                <ToolbarBtn icon={Heading1} title="大标题" action={() => execCmd('formatBlock', 'H3')} />
                <ToolbarBtn icon={Heading2} title="小标题" action={() => execCmd('formatBlock', 'H4')} />
                <ToolbarBtn icon={Quote} title="引用块" action={() => execCmd('formatBlock', 'BLOCKQUOTE')} />
                <ToolbarBtn icon={Code} title="代码块" action={() => execCmd('formatBlock', 'PRE')} />
              </div>

              <div className="flex space-x-1 border-r border-slate-200 pr-2 mr-1">
                 <ToolbarBtn icon={List} title="列表" action={() => execCmd('insertUnorderedList')} />
              </div>

              <div className="flex space-x-1">
                 <ToolbarBtn icon={AlignLeft} title="左对齐" action={() => execCmd('justifyLeft')} />
                 <ToolbarBtn icon={AlignCenter} title="居中" action={() => execCmd('justifyCenter')} />
                 <ToolbarBtn icon={AlignRight} title="右对齐" action={() => execCmd('justifyRight')} />
              </div>
            </div>

            <div
              ref={editorRef}
              contentEditable
              className="rich-editor w-full p-5 outline-none overflow-y-auto max-w-none text-slate-700 leading-relaxed"
              style={{ minHeight: '320px', maxHeight: '500px' }}
              onInput={(e) => setNotes(e.currentTarget.innerHTML)}
            />
          </div>
          
          <div className="mt-4 flex justify-between items-center text-sm text-slate-400">
             <span>字数: {editorRef.current?.innerText.length || 0}</span>
             <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 shadow-md shadow-indigo-200"
            >
              {isAnalyzing ? (
                <><Loader2 size={18} className="mr-2 animate-spin" /> 正在深度分析...</>
              ) : (
                <><Sparkles size={18} className="mr-2" /> AI 智能整理笔记</>
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
