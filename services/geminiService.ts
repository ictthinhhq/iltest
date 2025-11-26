import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, ExperimentDesign, ExperimentData, ExperimentApplication } from "../types";

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

export const analyzeStudentPerformance = async (
  design: ExperimentDesign,
  data: ExperimentData,
  application: ExperimentApplication,
  imageBase64: string | undefined
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

  const prompt = `
    Vai trò: Bạn là "BioLab AI" - Chuyên gia đánh giá năng lực Khoa học Tự nhiên (KHTN) theo chương trình GDPT 2018 của Việt Nam.
    
    Nhiệm vụ: Đánh giá quá trình thực hiện dự án "Sự sinh trưởng của vi khuẩn" của học sinh. Tập trung vào QUY TRÌNH và TƯ DUY, không chỉ kết quả đúng sai.

    DỮ LIỆU ĐẦU VÀO CỦA HỌC SINH:

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

    Lộ trình học tập (Learning Path) cần cá nhân hóa dựa trên lỗi sai (Ví dụ: Sai nhiệt độ -> Ôn tập sinh lý vi khuẩn; Vẽ biểu đồ sai -> Bài tập xử lý số liệu).
  `;

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: parts,
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "Bạn là giáo viên Sinh học nhiệt tình, nghiêm túc nhưng khuyến khích học sinh. Sử dụng thuật ngữ chuyên môn KHTN 2018.",
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