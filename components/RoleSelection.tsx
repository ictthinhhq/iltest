import React, { useState } from 'react';
import { GraduationCap, School, ArrowRight, Lock, X } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: 'student' | 'teacher') => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleTeacherClick = () => {
    setShowAuth(true);
    setError('');
    setPassword('');
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'teacher') {
      onSelectRole('teacher');
    } else {
      setError('Mã truy cập không đúng.');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-500 relative">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Chào mừng đến <span className="text-emerald-600">BioLab Pro</span>
        </h1>
        <p className="text-lg text-slate-600">
          Vui lòng chọn vai trò để tiếp tục
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Student Card */}
        <button
          onClick={() => onSelectRole('student')}
          className="group relative bg-white hover:bg-emerald-50 border-2 border-slate-100 hover:border-emerald-500 rounded-3xl p-8 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
          <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
            <GraduationCap size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Học sinh</h2>
          <p className="text-slate-500 mb-6">
            Làm bài kiểm tra năng lực đầu vào, nhập liệu dự án và nhận đánh giá chi tiết.
          </p>
          <div className="flex items-center text-emerald-600 font-semibold group-hover:translate-x-2 transition-transform">
            Bắt đầu làm bài <ArrowRight size={20} className="ml-2" />
          </div>
        </button>

        {/* Teacher Card */}
        <button
          onClick={handleTeacherClick}
          className="group relative bg-white hover:bg-indigo-50 border-2 border-slate-100 hover:border-indigo-500 rounded-3xl p-8 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
          <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
            <School size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Giáo viên</h2>
          <p className="text-slate-500 mb-6">
            Quản lý lớp học, xem tổng hợp kết quả đánh giá năng lực và xuất báo cáo.
          </p>
          <div className="flex items-center text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform">
            Vào trang quản lý <ArrowRight size={20} className="ml-2" />
          </div>
        </button>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Lock size={20} className="text-indigo-600" />
                Xác thực giáo viên
              </h3>
              <button 
                onClick={() => setShowAuth(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAuthSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Mã truy cập (Access Code)</label>
                <input 
                  type="password" 
                  autoFocus
                  className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Nhập mã truy cập..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors"
              >
                Đăng nhập Dashboard
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};