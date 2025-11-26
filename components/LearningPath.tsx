import React from 'react';
import { LearningPathItem } from '../types';
import { CheckCircle2, Calendar, ArrowRight } from 'lucide-react';

interface LearningPathProps {
  items: LearningPathItem[];
}

export const LearningPath: React.FC<LearningPathProps> = ({ items }) => {
  return (
    <div className="space-y-8">
      {items.map((item, index) => (
        <div key={index} className="relative pl-8 sm:pl-0 group">
          {/* Timeline Line for Desktop */}
          <div className="hidden sm:block absolute left-[50%] top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2 group-last:bottom-auto group-last:h-full"></div>
          
          {/* Timeline Line for Mobile */}
          <div className="sm:hidden absolute left-[19px] top-0 bottom-0 w-px bg-slate-200 group-last:bottom-auto group-last:h-full"></div>
          
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between w-full ${index % 2 === 0 ? 'sm:flex-row-reverse' : ''}`}>
            
            {/* Content Box */}
            <div className="w-full sm:w-[45%] mb-4 sm:mb-0 bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:border-indigo-200">
               <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-2">
                  <Calendar size={16} />
                  <span>{item.timeframe}</span>
               </div>
               <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
               <p className="text-slate-600 text-sm mb-4">{item.description}</p>
               
               <div className="space-y-2">
                 {item.actionItems.map((action, idx) => (
                   <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                     <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                     <span>{action}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* Center Dot */}
            <div className="absolute left-[19px] sm:left-[50%] top-6 sm:top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-indigo-50 border-4 border-white shadow-sm flex items-center justify-center z-10">
                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
            </div>
            
            {/* Spacer for alternating layout */}
            <div className="hidden sm:block w-[45%]"></div>
          </div>
        </div>
      ))}
      
      <div className="flex justify-center pt-4">
         <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
            <ArrowRight size={16} />
            <span>Tiếp tục đánh giá sau mỗi giai đoạn</span>
         </div>
      </div>
    </div>
  );
};
