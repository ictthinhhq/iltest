import React from 'react';
import { FlaskConical } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-emerald-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-600 rounded-lg text-white">
            <FlaskConical size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">BioLab Pro</h1>
            <p className="text-xs text-emerald-600 font-medium">Đánh giá Năng lực KHTN 2018</p>
          </div>
        </div>
        <div className="hidden md:flex text-sm text-slate-500">
          Dự án: Sự sinh trưởng của vi khuẩn
        </div>
      </div>
    </header>
  );
};