export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Lesson {
  id: string;
  title: string;
  youtubeId: string;
  quiz: QuizQuestion[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

// Tạo 20 bài học mẫu
const lessons: Lesson[] = Array.from({ length: 20 }, (_, i) => {
  const lessonNum = i + 1;
  const titles = [
    "Giới thiệu về âm thanh và tần số",
    "Cơ bản về sóng âm và dao động",
    "Hiểu về decibel (dB) và mức độ âm thanh",
    "Phân tích phổ tần số (Frequency Spectrum)",
    "Các loại microphone và ứng dụng",
    "Preamp và Gain staging cơ bản",
    "Equalizer (EQ) - Công cụ chỉnh âm",
    "Compressor - Nén và điều khiển động",
    "Reverb và Delay - Hiệu ứng không gian",
    "Panning và Stereo Imaging",
    "Mix Bus và Master Bus",
    "Automation trong mixing",
    "Sidechain và Dynamic Processing",
    "Saturation và Harmonic Distortion",
    "Phân tích và sửa lỗi pha (Phase Issues)",
    "Parallel Processing Techniques",
    "Bus Processing và Grouping",
    "Final Mix và Reference Tracks",
    "Mastering cơ bản",
    "Xuất file và định dạng audio",
  ];

  return {
    id: `lesson${String(lessonNum).padStart(2, "0")}`,
    title: `Bài ${String(lessonNum).padStart(2, "0")}: ${titles[i]}`,
    youtubeId: "dQw4w9WgXcQ", // Placeholder - thay sau
    quiz: Array.from({ length: 5 }, (_, q) => ({
      id: `q${q + 1}`,
      question: `Câu hỏi ${q + 1} của bài ${lessonNum}: ${titles[i]}?`,
      options: [
        `Đáp án A cho câu hỏi ${q + 1}`,
        `Đáp án B cho câu hỏi ${q + 1}`,
        `Đáp án C cho câu hỏi ${q + 1}`,
        `Đáp án D cho câu hỏi ${q + 1}`,
      ],
      correctIndex: q % 4, // Phân bố đáp án đúng
    })),
  };
});

export const courseData: Course = {
  id: "audio-goc-01",
  title: "Học Âm Thanh Từ Gốc",
  description:
    "Khóa học toàn diện về âm thanh, từ cơ bản đến nâng cao. Học cách xử lý, mixing và mastering audio chuyên nghiệp.",
  lessons,
} as const;
