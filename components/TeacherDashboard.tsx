import React, { useMemo, useState } from 'react';
import { StudentSubmission, ClassAnalysisResult } from '../types';
import { CompetencyChart } from './CompetencyChart';
import { Users, FileText, TrendingUp, Search, Eye, Download, Sparkles, AlertTriangle, Lightbulb, X, Loader2 } from 'lucide-react';
import { analyzeClassPerformance } from '../services/geminiService';

interface TeacherDashboardProps {
  submissions: StudentSubmission[];
  onViewStudent: (submission: StudentSubmission) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ submissions, onViewStudent }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [classAnalysis, setClassAnalysis] = useState<ClassAnalysisResult | null>(null);
  
  // Calculate class average competencies
  const classAverages = useMemo(() => {
    if (submissions.length === 0) return [];

    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};

    submissions.forEach(sub => {
      sub.analysis.competencies.forEach(comp => {
        if (!sums[comp.name]) {
          sums[comp.name] = 0;
          counts[comp.name] = 0;
        }
        sums[comp.name] += comp.score;
        counts[comp.name] += 1;
      });
    });

    return Object.keys(sums).map(name => ({
      name,
      score: Math.round(sums[name] / counts[name]),
      description: "Điểm trung bình của cả lớp"
    }));
  }, [submissions]);

  const handleExportCSV = () => {
    // UTF-8 BOM for Excel compatibility
    const BOM = "\uFEFF";
    const headers = "ID,Họ tên,Thời gian,Level Quiz,Dự đoán,Nhận thức KHTN,Tìm hiểu Tự nhiên,Vận dụng KHTN,Lộ trình đề xuất\n";
    
    const rows = submissions.map(sub => {
      const scores = sub.analysis.competencies.reduce((acc, curr) => ({...acc, [curr.name]: curr.score}), {} as Record<string, number>);
      const learningSummary = sub.analysis.learningPath.map(l => l.title).join(' -> ');
      const quizLevel = sub.quizResult ? sub.quizResult.level : 'N/A';
      
      // Escape quotes for CSV
      const escape = (text: string) => `"${text.replace(/"/g, '""')}"`;

      return [
        sub.id,
        escape(sub.studentName),
        sub.timestamp.toLocaleString('vi-VN'),
        escape(quizLevel),
        escape(sub.design.prediction),
        scores['Nhận thức KHTN'] || 0,
        scores['Tìm hiểu Tự nhiên'] || 0,
        scores['Vận dụng kiến thức KHTN'] || 0,
        escape(learningSummary)
      ].join(',');
    }).join('\n');

    const csvContent = BOM + headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BioLab_BaoCao_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAIAnalysis = async () => {
    if (submissions.length === 0) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeClassPerformance(submissions);
      setClassAnalysis(result);
    } catch (error) {
      console.error(error);
      alert("Có lỗi khi phân tích dữ liệu lớp học.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Tổng quan lớp học</h2>
           <p className="text-slate-500">Thống kê năng lực KHTN của tất cả học sinh tham gia dự án.</p>
        </div>
        <div className="flex flex-wrap gap-3">
            <button 
                onClick={handleAIAnalysis}
                disabled={isAnalyzing || submissions.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-2 rounded-lg shadow-md shadow-indigo-200 flex items-center gap-2 font-medium transition-all transform active:scale-95"
            >
                {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                {isAnalyzing ? "Đang phân tích..." : "Phân tích Lớp học (AI)"}
            </button>

            <button 
                onClick={handleExportCSV}
                className="bg-white hover:bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 text-slate-700 font-medium transition-colors"
            >
                <Download size={20} className="text-emerald-600" />
                Xuất Excel
            </button>
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                <Users size={20} className="text-indigo-600" />
                <span className="font-bold text-slate-800">{submissions.length}</span>
                <span className="text-slate-500 text-sm hidden sm:inline">Học sinh</span>
            </div>
        </div>
      </div>

      {/* AI Class Analysis Result */}
      {classAnalysis && (
        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm relative animate-in zoom-in-95 duration-300">
           <button 
             onClick={() => setClassAnalysis(null)}
             className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
           >
             <X size={20} />
           </button>
           <div className="flex items-center gap-2 mb-4">
             <div className="p-2 bg-indigo-600 rounded-lg text-white">
               <Sparkles size={20} />
             </div>
             <h3 className="text-xl font-bold text-slate-800">Thông tin chi tiết từ AI (Class Insight)</h3>
           </div>
           
           <div className="mb-6">
             <p className="text-slate-700 leading-relaxed italic border-l-4 border-indigo-300 pl-4 py-1">
               "{classAnalysis.overallAssessment}"
             </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm">
                <h4 className="flex items-center gap-2 font-bold text-amber-700 mb-3">
                   <AlertTriangle size={18} /> Các lỗi sai phổ biến
                </h4>
                <ul className="space-y-2">
                  {classAnalysis.commonMisconceptions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                       <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                       {item}
                    </li>
                  ))}
                </ul>
             </div>

             <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm">
                <h4 className="flex items-center gap-2 font-bold text-emerald-700 mb-3">
                   <Lightbulb size={18} /> Đề xuất giảng dạy
                </h4>
                <ul className="space-y-2">
                  {classAnalysis.recommendedTeachingStrategies.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                       <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                       {item}
                    </li>
                  ))}
                </ul>
             </div>
           </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Class Chart */}
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-emerald-600" size={20} />
              <h3 className="font-bold text-slate-800">Biểu đồ năng lực trung bình</h3>
            </div>
            <div className="flex-grow flex items-center justify-center">
               {classAverages.length > 0 ? (
                 <CompetencyChart data={classAverages} />
               ) : (
                 <div className="text-slate-400 text-sm">Chưa có dữ liệu</div>
               )}
            </div>
         </div>

         {/* Quick Stats / Highlights */}
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Phân tích nhanh</h3>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                 <div className="text-sm text-indigo-800 font-semibold mb-1">Năng lực tốt nhất</div>
                 <div className="text-2xl font-bold text-indigo-900">
                    {classAverages.length > 0 
                      ? classAverages.reduce((prev, current) => (prev.score > current.score) ? prev : current).name 
                      : 'N/A'}
                 </div>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                 <div className="text-sm text-amber-800 font-semibold mb-1">Cần cải thiện</div>
                 <div className="text-2xl font-bold text-amber-900">
                    {classAverages.length > 0 
                      ? classAverages.reduce((prev, current) => (prev.score < current.score) ? prev : current).name 
                      : 'N/A'}
                 </div>
              </div>
            </div>
         </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <FileText size={20} className="text-slate-400" />
            Danh sách bài làm
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Tìm kiếm học sinh..." 
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-6 py-4">Học sinh</th>
                <th className="px-6 py-4">Level Đầu vào</th>
                <th className="px-6 py-4">Dự đoán</th>
                <th className="px-6 py-4 text-center">Nhận thức</th>
                <th className="px-6 py-4 text-center">Tìm hiểu</th>
                <th className="px-6 py-4 text-center">Vận dụng</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Chưa có bài làm nào được nộp.</td>
                </tr>
              ) : (
                submissions.map((sub) => {
                  const compScores = sub.analysis.competencies.reduce((acc, curr) => ({...acc, [curr.name]: curr.score}), {} as Record<string, number>);
                  const score1 = compScores['Nhận thức KHTN'] || 0;
                  const score2 = compScores['Tìm hiểu Tự nhiên'] || 0;
                  const score3 = compScores['Vận dụng kiến thức KHTN'] || 0;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{sub.studentName}</div>
                        <div className="text-xs text-slate-400">{sub.timestamp.toLocaleDateString('vi-VN')}</div>
                      </td>
                      <td className="px-6 py-4">
                         {sub.quizResult ? (
                           <span className={`text-xs px-2 py-1 rounded font-semibold ${
                             sub.quizResult.level === 'Nâng cao' ? 'bg-purple-100 text-purple-700' :
                             sub.quizResult.level === 'Khá' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                           }`}>
                             {sub.quizResult.level}
                           </span>
                         ) : <span className="text-xs text-slate-400">N/A</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm truncate max-w-xs" title={sub.design.prediction}>
                        {sub.design.prediction || 'Không có dự đoán'}
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded text-xs font-bold ${
                           score1 >= 80 ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-500/20' : 'bg-slate-100 text-slate-500'
                         }`}>
                           {score1}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded text-xs font-bold ${
                           score2 >= 80 ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20' : 'bg-slate-100 text-slate-500'
                         }`}>
                           {score2}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded text-xs font-bold ${
                           score3 >= 80 ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-500/20' : 'bg-slate-100 text-slate-500'
                         }`}>
                           {score3}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => onViewStudent(sub)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};