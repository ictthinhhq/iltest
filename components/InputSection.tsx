import React, { useState, useRef } from 'react';
import { Upload, Trash2, Plus, Sparkles, ScanLine, FlaskConical, BarChart2, Lightbulb, ChevronRight, User } from 'lucide-react';
import { ExperimentDesign, ExperimentData, ExperimentApplication, DataPoint } from '../types';

interface InputSectionProps {
  onAnalyze: (
    studentName: string,
    design: ExperimentDesign,
    data: ExperimentData,
    app: ExperimentApplication,
    imageBase64: string | undefined
  ) => void;
  isLoading: boolean;
}

type TabType = 'design' | 'data' | 'app';

export const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isLoading }) => {
  const [activeTab, setActiveTab] = useState<TabType>('design');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Student Info
  const [studentName, setStudentName] = useState('');

  // Module 1: Design Input State
  const [design, setDesign] = useState<ExperimentDesign>({
    bacteriaType: 'E. coli',
    temperature: '',
    ph: '',
    nutrient: '',
    prediction: ''
  });

  // Module 2: Data Input State
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([
    { time: '0h', value: '' },
    { time: '2h', value: '' },
    { time: '4h', value: '' }
  ]);
  const [observation, setObservation] = useState('');

  // Module 3: Application Input State
  const [appData, setAppData] = useState<ExperimentApplication>({
    conclusion: '',
    practicalApp: ''
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addDataPoint = () => setDataPoints([...dataPoints, { time: '', value: '' }]);
  const removeDataPoint = (idx: number) => setDataPoints(dataPoints.filter((_, i) => i !== idx));
  const updateDataPoint = (idx: number, field: keyof DataPoint, val: string) => {
    const newData = [...dataPoints];
    newData[idx][field] = val;
    setDataPoints(newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      alert("Vui lòng nhập họ tên học sinh.");
      return;
    }

    let imagePayload = undefined;
    if (selectedImage) {
      imagePayload = selectedImage.split(',')[1];
    }
    
    onAnalyze(
      studentName,
      design,
      { dataPoints, observation },
      appData,
      imagePayload
    );
  };

  const tabs = [
    { id: 'design', label: '1. Thiết Kế', icon: FlaskConical },
    { id: 'data', label: '2. Dữ Liệu', icon: BarChart2 },
    { id: 'app', label: '3. Vận Dụng', icon: Lightbulb },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 md:p-8">
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Thông tin dự án</h2>
        
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Họ và tên học sinh</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  required
                  placeholder="Nhập họ tên của bạn..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-800"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>
            </div>
            <div className="hidden md:block w-px h-10 bg-slate-200"></div>
            <div className="flex-1 w-full">
               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dự án</p>
               <p className="font-semibold text-emerald-700">Sinh trưởng của vi khuẩn (KHTN 2018)</p>
            </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* TAB 1: DESIGN */}
        {activeTab === 'design' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loại vi khuẩn</label>
                <select 
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  value={design.bacteriaType}
                  onChange={e => setDesign({...design, bacteriaType: e.target.value})}
                >
                  <option value="E. coli">E. coli</option>
                  <option value="Bacillus subtilis">Bacillus subtilis</option>
                  <option value="Saccharomyces cerevisiae">Nấm men (S. cerevisiae)</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Môi trường dinh dưỡng</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="VD: Môi trường lỏng LB, Agar..."
                  value={design.nutrient}
                  onChange={e => setDesign({...design, nutrient: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nhiệt độ (°C)</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="VD: 37"
                  value={design.temperature}
                  onChange={e => setDesign({...design, temperature: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Độ pH</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="VD: 7.0"
                  value={design.ph}
                  onChange={e => setDesign({...design, ph: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Giả thuyết / Dự đoán kết quả</label>
              <textarea 
                className="w-full h-24 p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                placeholder="Bạn dự đoán vi khuẩn sẽ sinh trưởng như thế nào trong điều kiện này?"
                value={design.prediction}
                onChange={e => setDesign({...design, prediction: e.target.value})}
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => setActiveTab('data')}
                className="flex items-center gap-1 text-emerald-600 font-medium hover:underline"
              >
                Tiếp theo: Nhập dữ liệu <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: DATA */}
        {activeTab === 'data' && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="font-semibold text-slate-800 text-sm">Bảng số liệu (Theo thời gian)</h3>
                 <button type="button" onClick={addDataPoint} className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                   <Plus size={14} /> THÊM MỐC THỜI GIAN
                 </button>
               </div>
               <div className="space-y-2">
                  <div className="flex gap-4 text-xs font-medium text-slate-500 px-2">
                    <span className="flex-1">Thời gian</span>
                    <span className="flex-1">Giá trị (OD / Số lượng)</span>
                    <span className="w-8"></span>
                  </div>
                  {dataPoints.map((pt, idx) => (
                    <div key={idx} className="flex gap-4">
                      <input 
                        type="text" 
                        placeholder="VD: 2h"
                        value={pt.time}
                        onChange={e => updateDataPoint(idx, 'time', e.target.value)}
                        className="flex-1 p-2 rounded border border-slate-200 text-sm"
                      />
                      <input 
                        type="text" 
                        placeholder="VD: 0.5 OD"
                        value={pt.value}
                        onChange={e => updateDataPoint(idx, 'value', e.target.value)}
                        className="flex-1 p-2 rounded border border-slate-200 text-sm"
                      />
                      <button 
                         type="button" 
                         onClick={() => removeDataPoint(idx)}
                         className="w-8 flex items-center justify-center text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
               </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Quan sát & Nhận xét biểu đồ</label>
               <textarea 
                  className="w-full h-20 p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  placeholder="Mô tả sự thay đổi của các pha sinh trưởng..."
                  value={observation}
                  onChange={e => setObservation(e.target.value)}
                />
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tải ảnh đồ thị hoặc đĩa Petri (Tùy chọn)
                </label>
                {!selectedImage ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-200 bg-emerald-50/30 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50 transition-colors"
                  >
                    <Upload size={24} className="text-emerald-400" />
                    <span className="text-sm text-emerald-700 font-medium">Chọn ảnh để tải lên</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <img src={selectedImage} alt="Preview" className="h-16 w-16 rounded object-cover border border-slate-200" />
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-slate-700">Đã chọn 1 ảnh</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="text-sm text-red-500 hover:text-red-700 px-3 py-1"
                    >
                      Xóa
                    </button>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setActiveTab('app')}
                  className="flex items-center gap-1 text-emerald-600 font-medium hover:underline"
                >
                  Tiếp theo: Vận dụng <ChevronRight size={16} />
                </button>
              </div>
          </div>
        )}

        {/* TAB 3: APPLICATION */}
        {activeTab === 'app' && (
          <div className="space-y-4 animate-in fade-in duration-300">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Kết luận & Giải pháp thực tiễn</label>
               <p className="text-xs text-slate-500 mb-2">Dựa trên kết quả, bạn đề xuất giải pháp gì (VD: cách bảo quản thực phẩm, quy trình lên men...)</p>
               <textarea 
                  className="w-full h-32 p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  placeholder="Nhập kết luận và giải pháp của bạn..."
                  value={appData.conclusion}
                  onChange={e => setAppData({...appData, conclusion: e.target.value})}
                />
             </div>
             
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Ứng dụng (Y tế / Thực phẩm / Môi trường)</label>
               <textarea 
                  className="w-full h-24 p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  placeholder="Kiến thức này giúp ích gì cho đời sống?"
                  value={appData.practicalApp}
                  onChange={e => setAppData({...appData, practicalApp: e.target.value})}
                />
             </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all transform
              ${isLoading 
                ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99]'
              }`}
          >
            {isLoading ? (
              <>
                <ScanLine className="animate-spin" size={20} />
                Đang phân tích dữ liệu...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Hoàn thành & Gửi đánh giá
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};