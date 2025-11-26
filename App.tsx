import React, { useState } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { AnalysisView } from './components/AnalysisView';
import { AnalysisResult, AnalysisStatus, ExperimentDesign, ExperimentData, ExperimentApplication } from './types';
import { analyzeStudentPerformance } from './services/geminiService';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (
    design: ExperimentDesign,
    data: ExperimentData,
    app: ExperimentApplication,
    imageBase64: string | undefined
  ) => {
    setStatus(AnalysisStatus.ANALYZING);
    setError(null);
    
    try {
      const analysis = await analyzeStudentPerformance(design, data, app, imageBase64);
      setResult(analysis);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra trong quá trình phân tích dữ liệu thí nghiệm. Vui lòng thử lại.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleReset = () => {
    setStatus(AnalysisStatus.IDLE);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero / Intro Text - Only show when idle */}
        {status === AnalysisStatus.IDLE && (
          <div className="text-center max-w-3xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Phòng thí nghiệm ảo <span className="text-emerald-600">BioLab Pro</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Hệ thống đánh giá năng lực Khoa học Tự nhiên 2018 dựa trên dữ liệu thực nghiệm dự án "Sinh trưởng của vi khuẩn".
            </p>
          </div>
        )}

        {/* Input Section - Hide on Success to focus on results */}
        {status !== AnalysisStatus.SUCCESS && (
          <div className="max-w-4xl mx-auto">
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

        {/* Analysis Results */}
        {status === AnalysisStatus.SUCCESS && result && (
          <AnalysisView result={result} onReset={handleReset} />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-auto bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} BioLab Pro. GDPT 2018 Standard.</p>
          <p className="mt-2 md:mt-0">Powered by Google Gemini 2.5 Flash</p>
        </div>
      </footer>
    </div>
  );
};

export default App;