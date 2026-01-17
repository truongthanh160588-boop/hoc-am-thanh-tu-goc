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
  is_preview?: boolean; // Cho phép xem preview mà không cần paid/activation
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

  // YouTube video IDs cho 20 bài học
  const youtubeIds = [
    "R52ZxgJk-YY", // lesson01: https://youtu.be/R52ZxgJk-YY?si=vqoWus96LFQJzNe2
    "F8mqpi11nHE", // lesson02: https://www.youtube.com/watch?v=F8mqpi11nHE
    "I5tYhPQ9YhM", // lesson03: https://www.youtube.com/watch?v=I5tYhPQ9YhM
    "6mJ99ZrbZDg", // lesson04: https://www.youtube.com/watch?v=6mJ99ZrbZDg
    "rRAiIgN8z0U", // lesson05: https://www.youtube.com/watch?v=rRAiIgN8z0U
    "1gwDfiLkScQ", // lesson06: https://youtu.be/1gwDfiLkScQ?si=WAkpFKp66YxTeYUK
    "IpOlESzJdmc", // lesson07: https://www.youtube.com/watch?v=IpOlESzJdmc
    "8H2qZwHKhok", // lesson08: https://www.youtube.com/watch?v=8H2qZwHKhok
    "2punFs5Vfzw", // lesson09: https://www.youtube.com/watch?v=2punFs5Vfzw
    "2qly_PGguO0", // lesson10: https://youtu.be/2qly_PGguO0?si=HvypPB0CW0knuqOc
    "ViG7HxlvXr8", // lesson11: https://youtu.be/ViG7HxlvXr8?si=upC2joYzFG4WTNCc
    "cbY3LUMHFD4", // lesson12: https://youtu.be/cbY3LUMHFD4?si=oRFLfOAJNWqrwCXY
    "TDOvufi7XWU", // lesson13: https://youtu.be/TDOvufi7XWU?si=BtXBGVshP9-Af8o8
    "IV6JFhruLSg", // lesson14: https://youtu.be/IV6JFhruLSg?si=rjFB6tRfPSs027Y0
    "7M1QrTbDRkM", // lesson15: https://youtu.be/7M1QrTbDRkM?si=jU60D1OtM57sJcrT
    "34PaidrgV_E", // lesson16: https://youtu.be/34PaidrgV_E?si=88x_jLicWEfWYSed
    "CVemH0to_0s", // lesson17: https://youtu.be/CVemH0to_0s?si=WMQySLrAd_-xeynv
    "10qorbnMaWg", // lesson18: https://youtu.be/10qorbnMaWg?si=-qqQOuCqEhPPsdFW
    "lgDsVG3tdU4", // lesson19: https://youtu.be/lgDsVG3tdU4?si=mI9ldKgblJz7KU5z
    "mOd3WgwEOlA", // lesson20: https://youtu.be/mOd3WgwEOlA?si=4uBvdY5SZqGosQRe
  ];

  return {
    id: `lesson${String(lessonNum).padStart(2, "0")}`,
    title: `Bài ${String(lessonNum).padStart(2, "0")}: ${titles[i]}`,
    youtubeId: youtubeIds[i],
    is_preview: lessonNum <= 3, // 3 bài đầu là preview
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
