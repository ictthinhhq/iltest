import React, { useState } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { AnalysisView } from './components/AnalysisView';
import { RoleSelection } from './components/RoleSelection';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdaptiveQuiz } from './components/AdaptiveQuiz';
import { AnalysisResult, AnalysisStatus, ExperimentDesign, ExperimentData, ExperimentApplication, StudentSubmission, QuizResult } from './types';
import { analyzeStudentPerformance } from './services/geminiService';
import { AlertCircle, ChevronLeft } from 'lucide-react';

// Mock Data Generator for Teacher View
const MOCK_SUBMISSIONS: StudentSubmission[] = [
  {
    id: '1',
    studentName: 'Nguyễn Văn An',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    quizResult: { score: 1, level: 'Cơ bản', details: 'Cần củng cố kiến thức nền tảng.' },
    design: { bacteriaType: 'E. coli', temperature: '45', ph: '7', nutrient: 'LB', prediction: 'Vi khuẩn mọc nhanh' },
    data: { dataPoints: [], observation: 'Đục nhanh' },
    application: { conclusion: '', practicalApp: '' },
    analysis: {
      summary: 'Học sinh nắm được quy trình cơ bản nhưng sai kiến thức về nhiệt độ tối ưu cho E.coli.',
      strengths: ['Thao tác đo đạc cẩn thận', 'Ghi chép đầy đủ'],
      weaknesses: ['Sai nhiệt độ nuôi cấy (45 độ C thay vì 37 độ C)', 'Chưa giải thích được cơ chế'],
      competencies: [
        { name: 'Nhận thức KHTN', score: 65, description: 'Hiểu khái niệm nhưng sai điều kiện môi trường.' },
        { name: 'Tìm hiểu Tự nhiên', score: 75, description: 'Thu thập dữ liệu khá tốt.' },
        { name: 'Vận dụng kiến thức KHTN', score: 60, description: 'Chưa đề xuất được giải pháp khắc phục.' }
      ],
      learningPath: []
    }
  },
  {
    id: '2',
    studentName: 'Trần Thị Bình',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    quizResult: { score: 3, level: 'Nâng cao', details: 'Kiến thức nền tảng rất tốt.' },
    design: { bacteriaType: 'E. coli', temperature: '37', ph: '7', nutrient: 'Agar', prediction: 'Mọc tốt ở 37 độ' },
    data: { dataPoints: [], observation: '' },
    application: { conclusion: '', practicalApp: '' },
    analysis: {
      summary: 'Bài làm xuất sắc, quy trình chuẩn xác và biện luận logic.',
      strengths: ['Thiết kế thí nghiệm chính xác', 'Phân tích đồ thị sâu sắc'],
      weaknesses: [],
      competencies: [
        { name: 'Nhận thức KHTN', score: 95, description: 'Kiến thức nền tảng vững chắc.' },
        { name: 'Tìm hiểu Tự nhiên', score: 90, description: 'Kỹ năng xử lý số liệu tốt.' },
        { name: 'Vận dụng kiến thức KHTN', score: 85, description: 'Liên hệ thực tế tốt.' }
      ],
      learningPath: []
    }
  }
];

const App: React.FC = () => {
  // Application State
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);
  
  // Student Flow State
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Teacher Flow / Database State
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(MOCK_SUBMISSIONS);
  const [selectedStudentForReview, setSelectedStudentForReview] = useState<StudentSubmission | null>(null);

  const handleSelectRole = (r: 'student' | 'teacher') => {
    setRole(r);
    if (r === 'student') {
      setStatus(AnalysisStatus.QUIZ); // Start with Quiz for students
    }
  };

  const handleLogout = () => {
    setRole(null);
    setStatus(AnalysisStatus.IDLE);
    setCurrentResult(null);
    setQuizResult(null);
    setSelectedStudentForReview(null);
  };

  const handleQuizComplete = (result: QuizResult) => {
    setQuizResult(result);
    setStatus(AnalysisStatus.INPUT); // Move to input section
  };

  const handleAnalyze = async (
    studentName: string,
    design: ExperimentDesign,
    data: ExperimentData,
    app: ExperimentApplication,
    imageBase64: string | undefined
  ) => {
    setStatus(AnalysisStatus.ANALYZING);
    setError(null);
    
    try {
      const analysis = await analyzeStudentPerformance(design, data, app, imageBase64, quizResult);
      setCurrentResult(analysis);
      setStatus(AnalysisStatus.SUCCESS);

      // Auto-save to "Database"
      const newSubmission: StudentSubmission = {
        id: Date.now().toString(),
        studentName,
        timestamp: new Date(),
        quizResult: quizResult || undefined,
        design,
        data,
        application: app,
        analysis
      };
      setSubmissions(prev => [newSubmission, ...prev]);

    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra trong quá trình phân tích dữ liệu thí nghiệm. Vui lòng thử lại.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleResetStudent = () => {
    setStatus(AnalysisStatus.QUIZ); // Reset back to quiz
    setCurrentResult(null);
    setQuizResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      <Header role={role} onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ROLE SELECTION */}
        {!role && (
          <RoleSelection onSelectRole={handleSelectRole} />
        )}

        {/* STUDENT VIEW */}
        {role === 'student' && (
          <>
            {/* Header / Intro for Student */}
            {status === AnalysisStatus.QUIZ && (
               <div className="text-center max-w-3xl mx-auto mb-8 animate-in fade-in">
                 <h2 className="text-3xl font-bold text-slate-900 mb-2">Kiểm tra năng lực đầu vào</h2>
                 <p className="text-slate-600">Trả lời nhanh 3 câu hỏi để BioLab AI cá nhân hóa lộ trình cho bạn.</p>
               </div>
            )}

            {/* Step 1: Adaptive Quiz */}
            {status === AnalysisStatus.QUIZ && (
              <AdaptiveQuiz onComplete={handleQuizComplete} />
            )}

            {/* Step 2: Project Input */}
            {(status === AnalysisStatus.INPUT || status === AnalysisStatus.ANALYZING || status === AnalysisStatus.ERROR) && (
              <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-8">
                {/* Quiz Result Banner */}
                {quizResult && (
                   <div className="mb-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <p className="text-xs font-medium opacity-90 uppercase tracking-wide">Level năng lực hiện tại</p>
                        <p className="text-2xl font-bold">{quizResult.level}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-sm opacity-90">{quizResult.details}</p>
                      </div>
                   </div>
                )}
                
                <InputSection 
                  onAnalyze={handleAnalyze} 
                  isLoading={status === AnalysisStatus.ANALYZING} 
                />
                
                {status === AnalysisStatus.ERROR && (
                  <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Analysis Result */}
            {status === AnalysisStatus.SUCCESS && currentResult && (
              <AnalysisView result={currentResult} onReset={handleResetStudent} />
            )}
          </>
        )}

        {/* TEACHER VIEW */}
        {role === 'teacher' && (
          <>
            {!selectedStudentForReview ? (
               <TeacherDashboard 
                  submissions={submissions} 
                  onViewStudent={setSelectedStudentForReview}
               />
            ) : (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <button 
                  onClick={() => setSelectedStudentForReview(null)}
                  className="mb-6 flex items-center gap-2 text-indigo-600 font-medium hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors w-fit"
                >
                  <ChevronLeft size={20} /> Quay lại danh sách lớp
                </button>
                
                <div className="mb-6 border-l-4 border-indigo-500 pl-4 bg-white p-4 rounded-r-xl shadow-sm border-y border-r border-slate-100">
                   <div className="flex justify-between items-start">
                     <div>
                       <h2 className="text-2xl font-bold text-slate-800">{selectedStudentForReview.studentName}</h2>
                       <p className="text-slate-500 text-sm">
                         Nộp bài lúc: {selectedStudentForReview.timestamp.toLocaleString('vi-VN')}
                       </p>
                     </div>
                     {selectedStudentForReview.quizResult && (
                       <div className="text-right">
                          <span className="text-xs text-slate-500 uppercase font-bold">Quiz Level</span>
                          <p className="text-lg font-bold text-indigo-600">{selectedStudentForReview.quizResult.level}</p>
                       </div>
                     )}
                   </div>
                </div>

                <AnalysisView 
                  result={selectedStudentForReview.analysis} 
                  onReset={() => setSelectedStudentForReview(null)} 
                />
              </div>
            )}
          </>
        )}

      </main>

      {role && (
        <footer className="border-t border-slate-200 mt-auto bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} BioLab Pro. GDPT 2018 Standard.</p>
            <p className="mt-2 md:mt-0">Powered by Google Gemini 2.5 Flash</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;