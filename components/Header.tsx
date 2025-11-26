import React from 'react';
import { FlaskConical, LogOut } from 'lucide-react';

interface HeaderProps {
  role: 'student' | 'teacher' | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ role, onLogout }) => {
  return (
    <header className="bg-white border-b border-emerald-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onLogout}>
          <div className="p-2 bg-emerald-600 rounded-lg text-white">
            <FlaskConical size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">BioLab Pro</h1>
            <p className="text-xs text-emerald-600 font-medium">Đánh giá Năng lực KHTN 2018</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex text-sm text-slate-500">
            Dự án: Sự sinh trưởng của vi khuẩn
          </div>
          {role && (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                role === 'teacher' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
              </span>
              <button 
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Đổi vai trò"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};