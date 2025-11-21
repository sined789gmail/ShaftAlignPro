import React, { useState } from 'react';
import { Sparkles, Send, Loader2, AlertTriangle } from 'lucide-react';
import { AlignmentState, SimulationResult } from '../types';
import { getAlignmentAdvice } from '../services/geminiService';

interface AIHelpProps {
  alignment: AlignmentState;
  results: SimulationResult;
}

export const AIHelp: React.FC<AIHelpProps> = ({ alignment, results }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const answer = await getAlignmentAdvice(alignment, results, query);
      setResponse(answer);
    } catch (e) {
      setResponse("Ошибка соединения.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate rough severity for color coding
  const isMisaligned = Math.abs(results.verticalOffset) > 0.05 || Math.abs(results.angularMisalignment * 100) > 0.05;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
        <div 
            className={`p-4 flex items-center justify-between cursor-pointer ${isMisaligned ? 'bg-amber-50' : 'bg-slate-50'}`}
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="flex items-center gap-2">
                <Sparkles className={isMisaligned ? "text-amber-500" : "text-purple-500"} size={20} />
                <h3 className="font-bold text-slate-800">AI Помощник</h3>
                {isMisaligned && <span className="px-2 py-0.5 text-xs bg-amber-200 text-amber-800 rounded-full font-medium">Требуется внимание</span>}
            </div>
            <button className="text-xs text-blue-600 hover:underline">
                {isOpen ? 'Свернуть' : 'Развернуть'}
            </button>
        </div>

        {isOpen && (
            <div className="p-4 flex flex-col gap-4">
                <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 border border-slate-200">
                    <p className="mb-2">Я проанализирую текущее положение валов и подскажу, сколько пластин нужно добавить или убрать.</p>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                         <button 
                            onClick={() => setQuery("Как устранить угловую расцентровку?")}
                            className="text-xs bg-white px-2 py-1 rounded border hover:border-blue-400 transition-colors"
                        >
                            Как убрать "излом"?
                        </button>
                        <button 
                            onClick={() => setQuery("Рассчитай толщину пластин для идеальной центровки.")}
                            className="text-xs bg-white px-2 py-1 rounded border hover:border-blue-400 transition-colors"
                        >
                            Рассчитать коррекцию
                        </button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Задайте вопрос..."
                        className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        onClick={handleAsk}
                        disabled={loading}
                        className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20}/> : <Send size={20} />}
                    </button>
                </div>

                {response && (
                    <div className="mt-2 p-4 bg-blue-50 rounded-lg text-slate-800 text-sm leading-relaxed border border-blue-100 animate-in fade-in slide-in-from-bottom-2">
                        <div className="font-semibold mb-1 text-blue-800 flex items-center gap-2">
                            <Sparkles size={14} /> Ответ:
                        </div>
                        {response}
                    </div>
                )}
            </div>
        )}
    </div>
  );
};
