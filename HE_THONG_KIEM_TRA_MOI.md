# Hệ Thống Kiểm Tra Mới - Tư Duy Thực Tế

## Triết Lý Khóa Học

> **"Không dạy để nhớ – dạy để hiểu – hiểu để làm được.**
> **Không hiểu thì hỏi trực tiếp – không ai bỏ rơi ai."**

## Mục Tiêu

- Người học là người đã đi làm, chơi âm thanh, kinh doanh âm thanh
- Không phải học sinh – không cần điểm số – không cần thi viết dài
- Mục tiêu: **xem đủ → hiểu → làm được**
- Nếu không hiểu → được gọi video trực tiếp để kiểm tra

## Logic Hệ Thống

### 1. Theo Dõi Thời Lượng Video

- **Mỗi bài học:** Chỉ cần theo dõi % thời lượng video đã xem
- **Tối thiểu:** 85% thời lượng video (thay vì 80% như cũ)
- **Không kiểm tra chi tiết** từng kiến thức nhỏ
- **Sử dụng YouTube IFrame API** để track chính xác thời gian xem

### 2. Tự Đánh Giá Sau Mỗi CỤM BÀI

- **Không phải từng bài**, mà sau mỗi **CỤM BÀI** (5 bài/cụm)
- **3 câu hỏi tự đánh giá:**
  1. Tôi đã xem bao nhiêu % nội dung?
  2. Tôi tự tin hiểu được bao nhiêu %?
  3. Phần nào tôi còn mơ hồ nhất? (tùy chọn)

### 3. Quyết Định Unlock

- **Nếu hiểu ≥ 70%:** Cho phép qua cụm bài tiếp theo
- **Nếu hiểu < 70%:** Hiện nút **"ĐĂNG KÝ GỌI VIDEO ZALO VỚI TRƯƠNG THANH"**

### 4. Gọi Video 1-1

- **Không ghi âm** – không lưu video
- **Chỉ kiểm tra miệng** + xem thao tác thực tế
- **Mục tiêu:** Biết người học **CÓ HIỂU** hay **KHÔNG**
- Sau khi đăng ký → vẫn cho qua cụm tiếp theo (vì đã có hỗ trợ)

## Cấu Trúc Cụm Bài

- **Cụm 1:** Bài 01-05 (Cơ bản về thiết bị và lý thuyết)
- **Cụm 2:** Bài 06-10 (Phần mềm đo và xử lý)
- **Cụm 3:** Bài 11-15 (Thực hành đo phase và crossover)
- **Cụm 4:** Bài 16-20 (Hướng dẫn sử dụng Mixer và Crossover)

## Ngôn Ngữ Giao Diện

### ❌ KHÔNG DÙNG:
- Thi
- Kiểm tra
- Trắc nghiệm
- Điểm số
- Đậu / rớt

### ✅ CHỈ DÙNG:
- Tự đánh giá
- Mức độ hiểu
- Xem lại
- Hỗ trợ trực tiếp
- Gọi video 1-1

## Luồng Người Học

```
1. Xem video bài học
   ↓
2. Track thời lượng xem (≥ 85%)
   ↓
3. Đánh dấu "Đã xem"
   ↓
4. Lặp lại cho các bài trong cụm
   ↓
5. Sau khi xem hết cụm → Tự đánh giá
   ↓
6a. Nếu hiểu ≥ 70% → Unlock cụm tiếp theo
   ↓
6b. Nếu hiểu < 70% → Đăng ký gọi video
   ↓
7. Tiếp tục cụm tiếp theo
```

## Files Đã Tạo/Cập Nhật

### Components Mới:
- `components/SelfAssessmentPanel.tsx` - Panel tự đánh giá cụm bài
- `components/VideoCallBooking.tsx` - Form đăng ký gọi video

### Lib Mới:
- `lib/cluster-progress.ts` - Quản lý progress theo cụm bài

### API Mới:
- `app/api/video-call/booking/route.ts` - API đăng ký gọi video

### Components Đã Cập Nhật:
- `components/YouTubeEmbed.tsx` - Track watch time với YouTube IFrame API

## Database Schema (Cần Tạo)

```sql
-- Bảng lưu đăng ký gọi video
CREATE TABLE IF NOT EXISTS video_call_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  cluster_number INTEGER NOT NULL,
  phone TEXT NOT NULL,
  preferred_time TEXT,
  note TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_video_call_bookings_user ON video_call_bookings(user_id, course_id);
CREATE INDEX idx_video_call_bookings_status ON video_call_bookings(status);

-- RLS
ALTER TABLE video_call_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON video_call_bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings"
  ON video_call_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Next Steps

1. ✅ Tạo components SelfAssessmentPanel và VideoCallBooking
2. ✅ Tạo lib cluster-progress
3. ✅ Update YouTubeEmbed với YouTube IFrame API
4. ⏳ Update learn page để dùng hệ thống mới
5. ⏳ Tạo database schema cho video_call_bookings
6. ⏳ Update UI/UX với ngôn ngữ mới
7. ⏳ Test toàn bộ flow
