import React from 'react';
import { AnalysisResult } from '../types';
import { CompetencyChart } from './CompetencyChart';
import { LearningPath } from './LearningPath';
import { TrendingUp, AlertTriangle, BrainCircuit, Map, Leaf } from 'lucide-react';

interface AnalysisViewProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ result, onReset }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Top Grid: Summary & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Summary Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 flex flex-col">
          <div className="mb-4 flex items-center gap-2">
            <Leaf className="text-emerald-600" size={24} />
            <h2 className="text-xl font-bold text-slate-800">Đánh giá quá trình</h2>
          </div>
          <p className="text-slate-600 leading-relaxed mb-6 flex-grow text-sm">
            {result.summary}
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-emerald-700 flex items-center gap-2 mb-2">
                <TrendingUp size={16} /> Điểm mạnh quy trình
              </h3>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2 bg-emerald-50/50 p-2 rounded-lg">
                    <span className="block w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-700 flex items-center gap-2 mb-2">
                <AlertTriangle size={16} /> Lỗ hổng / Sai số
              </h3>
              <ul className="space-y-2">
                {result.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2 bg-amber-50/50 p-2 rounded-lg">
                    <span className="block w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 flex flex-col items-center justify-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
           <h2 className="text-lg font-bold text-slate-800 w-full mb-2">Biểu đồ Năng lực KHTN</h2>
           <CompetencyChart data={result.competencies} />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-4">
             {result.competencies.map((comp, idx) => (
               <div key={idx} className="text-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                 <div className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">{comp.name}</div>
                 <div className="text-xl font-black text-emerald-600">{comp.score}/100</div>
                 <p className="text-xs text-slate-400 mt-1 line-clamp-2">{comp.description}</p>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Learning Path Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 border-b border-emerald-50 pb-4">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
               <Map size={24} />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-slate-800">Lộ trình bồi dưỡng</h2>
               <p className="text-slate-500">Kế hoạch khắc phục sai số và phát triển năng lực KHTN</p>
             </div>
          </div>
          <button 
            onClick={onReset}
            className="mt-4 md:mt-0 text-sm font-medium text-slate-500 hover:text-emerald-600 px-4 py-2 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            Đánh giá dự án mới
          </button>
        </div>

        <LearningPath items={result.learningPath} />
      </div>

    </div>
  );
};