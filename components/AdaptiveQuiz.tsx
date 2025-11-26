import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizResult } from '../types';
import { BrainCircuit, CheckCircle, XCircle, Loader2, RefreshCcw, AlertTriangle } from 'lucide-react';
import { generateAdaptiveQuiz } from '../services/geminiService';

interface AdaptiveQuizProps {
  onComplete: (result: QuizResult) => void;
}

export const AdaptiveQuiz: React.FC<AdaptiveQuizProps> = ({ onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuiz = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const generatedQuestions = await generateAdaptiveQuiz();
      setQuestions(generatedQuestions);
      setCurrentIdx(0);
      setScore(0);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to generate quiz:", err);
      setError("Không thể tạo bài kiểm tra lúc này. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  // Initialize Quiz on Mount
  useEffect(() => {
    fetchQuiz();
  }, []);

  const handleSelect = (idx: number) => {
    if (showFeedback) return;
    setSelectedOption(idx);
    setShowFeedback(true);
    
    const currentQ = questions[currentIdx];
    if (idx === currentQ.correctAnswer) {
      setScore(s => s + 1);
    }

    // Auto move or wait
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(c => c + 1);
        setSelectedOption(null);
        setShowFeedback(false);
      } else {
        // Calculate based on the NEW score (include current question if correct)
        const finalScore = score + (idx === currentQ.correctAnswer ? 1 : 0);
        finishQuiz(finalScore);
      }
    }, 1200);
  };

  const finishQuiz = (finalScore: number) => {
    let level: QuizResult['level'] = 'Cơ bản';
    let details = 'Cần củng cố kiến thức nền tảng.';
    
    // Grading Scale for 10 Questions
    if (finalScore >= 8) {
      level = 'Nâng cao';
      details = 'Kiến thức nền tảng rất tốt, sẵn sàng cho các bài tập tư duy cao.';
    } else if (finalScore >= 5) {
      level = 'Khá';
      details = 'Nắm vững kiến thức cơ bản, cần rèn luyện thêm kỹ năng vận dụng.';
    } else {
      level = 'Cơ bản';
      details = 'Cần ôn tập lại các khái niệm KHTN cơ bản trước khi thực hiện dự án.';
    }

    onComplete({
      score: finalScore,
      level,
      details
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in bg-white rounded-2xl border border-emerald-50 p-8 shadow-sm">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25"></div>
          <div className="bg-emerald-50 p-4 rounded-full relative z-10">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
          </div>
        </div>
        <h3 className="mt-6 text-lg font-bold text-slate-800">Đang khởi tạo bài thi thông minh...</h3>
        <p className="text-slate-500 text-sm mt-2 text-center max-w-md">
          Hệ thống đang sử dụng Gemini AI để tạo ra bộ câu hỏi trắc nghiệm ngẫu nhiên dành riêng cho bạn.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] animate-in fade-in bg-white rounded-2xl border border-red-100 p-8 shadow-sm">
        <div className="bg-red-50 p-4 rounded-full text-red-500 mb-4">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Đã xảy ra lỗi</h3>
        <p className="text-slate-500 text-sm mb-6 text-center">{error}</p>
        <button 
          onClick={fetchQuiz}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-200"
        >
          <RefreshCcw size={18} />
          Thử lại
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8">
      <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-6 md:p-8 relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1.5 bg-slate-100 w-full">
           <div 
             className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500 ease-out"
             style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
           ></div>
        </div>

        <div className="flex items-center justify-between mb-8 mt-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
               <BrainCircuit size={20} />
            </div>
            <div>
               <h2 className="text-lg font-bold text-slate-800 leading-tight">Đánh giá năng lực</h2>
               <p className="text-xs text-slate-500">Bộ câu hỏi tạo bởi Gemini AI</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-sm font-bold text-slate-400">
               Câu {currentIdx + 1} <span className="text-slate-300">/</span> {questions.length}
             </div>
          </div>
        </div>

        <div className="mb-8 min-h-[100px]">
          <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
            {currentQ.competencyType}
          </span>
          <h3 className="text-xl md:text-2xl font-medium text-slate-800 leading-relaxed">
            {currentQ.question}
          </h3>
        </div>

        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            let stateClass = "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 bg-white";
            let icon = null;

            if (showFeedback) {
              if (idx === currentQ.correctAnswer) {
                stateClass = "border-emerald-500 bg-emerald-100 text-emerald-800 shadow-sm ring-1 ring-emerald-500/50";
                icon = <CheckCircle size={20} className="text-emerald-600 shrink-0" />;
              } else if (idx === selectedOption) {
                stateClass = "border-red-300 bg-red-50 text-red-800";
                icon = <XCircle size={20} className="text-red-500 shrink-0" />;
              } else {
                stateClass = "border-slate-100 opacity-50 bg-slate-50";
              }
            }

            return (
              <button
                key={idx}
                disabled={showFeedback}
                onClick={() => handleSelect(idx)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 flex justify-between items-center group ${stateClass}`}
              >
                <span className="font-medium pr-4">{opt}</span>
                {icon}
                {!showFeedback && (
                   <div className="w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-emerald-400 transition-colors"></div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 text-center text-xs text-slate-400 font-medium">
           Chọn một đáp án để tiếp tục
        </div>
      </div>
    </div>
  );
};