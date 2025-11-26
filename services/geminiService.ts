import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, ExperimentDesign, ExperimentData, ExperimentApplication, QuizResult, StudentSubmission, ClassAnalysisResult, QuizQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "Tổng quan về năng lực KHTN của học sinh qua dự án.",
    },
    competencies: {
      type: Type.ARRAY,
      description: "Đánh giá 3 năng lực cốt lõi KHTN 2018.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Tên năng lực (Nhận thức, Tìm hiểu, Vận dụng)" },
          score: { type: Type.NUMBER, description: "Điểm đánh giá thang 100" },
          description: { type: Type.STRING, description: "Nhận xét chi tiết dựa trên rubric." },
        },
        required: ["name", "score", "description"],
      },
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Điểm mạnh trong quy trình thiết kế và thực hiện.",
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lỗ hổng kiến thức hoặc sai sót quy trình.",
    },
    learningPath: {
      type: Type.ARRAY,
      description: "Lộ trình cải thiện năng lực.",
      items: {
        type: Type.OBJECT,
        properties: {
          timeframe: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          actionItems: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["timeframe", "title", "description", "actionItems"],
      },
    },
  },
  required: ["summary", "competencies", "strengths", "weaknesses", "learningPath"],
};

const classAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallAssessment: {
      type: Type.STRING,
      description: "Nhận xét tổng quát về tình hình học tập của cả lớp.",
    },
    commonMisconceptions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Các lỗi sai phổ biến mà nhiều học sinh gặp phải.",
    },
    recommendedTeachingStrategies: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Đề xuất 3-5 phương pháp giảng dạy để khắc phục các vấn đề trên.",
    },
  },
  required: ["overallAssessment", "commonMisconceptions", "recommendedTeachingStrategies"],
};

const quizSchema: Schema = {
  type: Type.ARRAY,
  description: "Danh sách 10 câu hỏi trắc nghiệm",
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER },
      question: { type: Type.STRING },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Danh sách 4 lựa chọn trả lời."
      },
      correctAnswer: { type: Type.INTEGER, description: "Chỉ số của đáp án đúng (0-3)." },
      competencyType: { 
        type: Type.STRING, 
        description: "Phân loại năng lực: 'Nhận thức KHTN', 'Tìm hiểu Tự nhiên', hoặc 'Vận dụng KHTN'" 
      }
    },
    required: ["id", "question", "options", "correctAnswer", "competencyType"]
  }
};

export const generateAdaptiveQuiz = async (): Promise<QuizQuestion[]> => {
  const prompt = `
    Tạo một bài trắc nghiệm gồm 10 câu hỏi về chủ đề "Sự sinh trưởng của vi khuẩn" (Sinh học 10 - KHTN).
    
    Yêu cầu cấu trúc:
    - 3 câu về "Nhận thức KHTN": Kiến thức nền tảng (pha sinh trưởng, các yếu tố ảnh hưởng, sinh sản).
    - 3 câu về "Tìm hiểu Tự nhiên": Kỹ năng thí nghiệm, quan sát đồ thị, đo đạc OD, đếm khuẩn lạc.
    - 4 câu về "Vận dụng kiến thức KHTN": Ứng dụng thực tế (lên men, bảo quản thực phẩm, thuốc kháng sinh).
    
    Đảm bảo 4 đáp án cho mỗi câu, chỉ 1 đáp án đúng.
    Nội dung câu hỏi phải đa dạng, không trùng lặp và phù hợp với học sinh phổ thông.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        temperature: 0.8, // Slightly high for variety
      }
    });

    const text = response.text;
    if (!text) throw new Error("No quiz generated");
    return JSON.parse(text) as QuizQuestion[];

  } catch (error) {
    console.error("Lỗi tạo quiz:", error);
    throw error;
  }
};

export const analyzeStudentPerformance = async (
  design: ExperimentDesign,
  data: ExperimentData,
  application: ExperimentApplication,
  imageBase64: string | undefined,
  quizResult: QuizResult | null
): Promise<AnalysisResult> => {
  
  const parts: any[] = [];

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64,
      },
    });
  }

  const dataPointsStr = data.dataPoints
    .map(d => `- Thời gian: ${d.time}, Giá trị (OD/Khuẩn lạc): ${d.value}`)
    .join('\n');

  const quizInfo = quizResult 
    ? `Học sinh này có mức độ kiến thức nền tảng ban đầu là: "${quizResult.level}" (Điểm quiz: ${quizResult.score}/10). Hãy điều chỉnh độ khó của nhận xét cho phù hợp.` 
    : "Không có thông tin bài quiz đầu vào.";

  const prompt = `
    Vai trò: Bạn là "BioLab AI" - Chuyên gia đánh giá năng lực Khoa học Tự nhiên (KHTN) theo chương trình GDPT 2018.
    
    THÔNG TIN ĐẦU VÀO:
    ${quizInfo}

    Nhiệm vụ: Đánh giá quá trình thực hiện dự án "Sự sinh trưởng của vi khuẩn". 
    Nếu học sinh ở mức "Cơ bản", hãy giải thích kỹ các lỗi sai cơ bản bằng ngôn ngữ dễ hiểu.
    Nếu học sinh ở mức "Nâng cao", hãy yêu cầu cao hơn về độ chính xác số liệu và tư duy phản biện.

    DỮ LIỆU DỰ ÁN CỦA HỌC SINH:

    1. MÔ-ĐUN 1: THIẾT KẾ (Đánh giá năng lực Nhận thức KHTN & Tin học)
    - Loại vi khuẩn: ${design.bacteriaType}
    - Nhiệt độ thiết lập: ${design.temperature}
    - Độ pH: ${design.ph}
    - Môi trường dinh dưỡng: ${design.nutrient}
    - Giả thuyết/Dự đoán: "${design.prediction}"
    -> Yêu cầu AI: Kiểm tra xem điều kiện môi trường có phù hợp với loại vi khuẩn không (Ví dụ: E.coli tối ưu ở 37 độ C).

    2. MÔ-ĐUN 2: DỮ LIỆU & PHÂN TÍCH (Đánh giá năng lực Tìm hiểu Tự nhiên XH)
    - Dữ liệu thu thập:
    ${dataPointsStr}
    - Quan sát/Nhận xét biểu đồ: "${data.observation}"
    - Hình ảnh đính kèm (nếu có): Đánh giá đồ thị hoặc hình ảnh đĩa petri.
    -> Yêu cầu AI: Kiểm tra sai số, sự logic của đường cong sinh trưởng (Pha lag, log, cân bằng, suy vong).

    3. MÔ-ĐUN 3: VẬN DỤNG (Đánh giá năng lực Vận dụng kiến thức, Giao tiếp)
    - Kết luận & Giải pháp thực tiễn: "${application.conclusion}"
    - Ứng dụng (Y tế/Thực phẩm): "${application.practicalApp}"
    -> Yêu cầu AI: Đánh giá khả năng giải quyết vấn đề thực tế.

    YÊU CẦU ĐẦU RA (JSON format):
    Trả về kết quả đánh giá cho 3 năng lực cốt lõi sau:
    1. "Nhận thức KHTN": Đánh giá kiến thức nền tảng qua việc thiết kế thí nghiệm.
    2. "Tìm hiểu Tự nhiên": Đánh giá kỹ năng xử lý dữ liệu, vẽ đồ thị, quan sát.
    3. "Vận dụng kiến thức KHTN": Đánh giá khả năng giải quyết vấn đề và ứng dụng thực tiễn.

    Lộ trình học tập (Learning Path) cần cá nhân hóa dựa trên lỗi sai và LEVEL quiz ban đầu.
  `;

  parts.push({ text: prompt });

  try {
    // Use gemini-3-pro-preview for better STEM reasoning and complex task handling
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: parts,
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "Bạn là giáo viên Sinh học nhiệt tình, nghiêm túc nhưng khuyến khích học sinh. Sử dụng thuật ngữ chuyên môn KHTN 2018. Đánh giá chính xác, khoa học.",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Không nhận được phản hồi từ Gemini.");
    }

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Lỗi khi phân tích:", error);
    throw error;
  }
};

export const analyzeClassPerformance = async (submissions: StudentSubmission[]): Promise<ClassAnalysisResult> => {
  if (submissions.length === 0) {
    throw new Error("Không có dữ liệu để phân tích.");
  }

  // Summarize data to fit context window efficiently
  const classDataSummary = submissions.map((s, index) => {
    return `
    Student ${index + 1} (${s.studentName}) - Quiz Level: ${s.quizResult?.level || 'N/A'}
    - Prediction: ${s.design.prediction}
    - Weaknesses Identified: ${s.analysis.weaknesses.join('; ')}
    - Competency Scores: 
      Nhận thức: ${s.analysis.competencies.find(c => c.name.includes('Nhận thức'))?.score},
      Tìm hiểu: ${s.analysis.competencies.find(c => c.name.includes('Tìm hiểu'))?.score},
      Vận dụng: ${s.analysis.competencies.find(c => c.name.includes('Vận dụng'))?.score}
    `;
  }).join('\n---\n');

  const prompt = `
    Dưới đây là dữ liệu tổng hợp kết quả thực hiện dự án "Sự sinh trưởng của vi khuẩn" của một lớp học.
    Hãy phân tích dữ liệu này dưới góc độ một Tổ trưởng chuyên môn KHTN.

    DỮ LIỆU LỚP HỌC:
    ${classDataSummary}

    YÊU CẦU:
    1. Đánh giá tổng quan về năng lực của lớp.
    2. Chỉ ra các quan niệm sai lầm phổ biến (Common Misconceptions) mà nhiều học sinh mắc phải (Ví dụ: sai về nhiệt độ, sai về pha sinh trưởng...).
    3. Đề xuất 3-5 chiến lược giảng dạy hoặc nội dung cần ôn tập kỹ trong bài học tới để khắc phục các lỗ hổng này.
  `;

  try {
    // Use gemini-3-pro-preview for complex aggregation and pedagogical strategy
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: classAnalysisSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    
    return JSON.parse(text) as ClassAnalysisResult;

  } catch (error) {
    console.error("Lỗi phân tích lớp học:", error);
    throw error;
  }
};