# 📚 LUỒNG BÁN KHÓA HỌC CHUẨN

## 🎯 Tổng quan

Luồng bán khóa học đã được implement với các tính năng:
- **Preview public**: Không cần login để xem preview
- **Demo lessons**: 3 bài đầu có `is_preview=true`, xem được mà không cần paid/activation
- **Purchase flow**: Tạo đơn pending → Admin duyệt → Kích hoạt → Học
- **Server guards**: Mọi quyền truy cập quyết định bằng server (DB)

---

## 🔄 Luồng sử dụng

### A) Học viên

1. **Vào `/courses/[courseId]`** → Xem Preview (mục lục + demo 1-3 bài)
2. **Bấm "Đăng nhập"** → Nhập Gmail → Nhận mã 6 số → Nhập mã
3. **Bấm "Đăng ký khóa học"** → Tạo đơn pending (tùy chọn upload ảnh CK)
4. **Chờ admin duyệt** → Khi admin set `paid`:
5. **Quay lại `/courses/[courseId]`** → Copy Device ID → Xin key → Nhập key → Activate → Vào `/learn`

### B) Admin

1. **Vào `/admin/purchases`** → Thấy danh sách đơn pending
2. **Bấm "Duyệt" (paid) hoặc "Từ chối"**
3. **Vào `/admin/keygen`** → Tạo key cho device của học viên

---

## 📋 Database Schema

### Purchases Table

```sql
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'rejected')),
  amount_vnd INTEGER DEFAULT 0,
  amount NUMERIC DEFAULT 0,
  transaction_code TEXT,
  note TEXT,
  proof_url TEXT,  -- Link ảnh chuyển khoản
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)  -- Một purchase per course per user
);
```

**RLS Policies:**
- Users: SELECT own purchases, INSERT own purchase (only pending)
- Admins: SELECT/UPDATE all purchases (check via `profiles.role='admin'`)

---

## 🔧 Server Helpers

### `lib/purchases.ts`

- `getPurchase(userId, courseId)` - Lấy purchase của user
- `createPendingPurchase(userId, payload)` - Tạo/update purchase pending
- `adminListPurchases(status?)` - List purchases (admin)
- `adminSetPurchaseStatus(purchaseId, status)` - Set status paid/rejected

---

## 🌐 API Routes

### 1. `POST /api/purchases/create`

Tạo purchase mới với status pending.

**Body:**
```json
{
  "courseId": "audio-goc-01",
  "amountVnd": 3000000,
  "note": "HATG user@email.com",
  "proofUrl": "https://..." // Optional
}
```

**Response:**
```json
{
  "ok": true,
  "purchase": {...},
  "message": "Đã tạo đơn hàng. Vui lòng chờ admin duyệt."
}
```

### 2. `GET /api/purchases/status?courseId=xxx`

Lấy trạng thái purchase của user hiện tại.

**Response:**
```json
{
  "ok": true,
  "purchase": {
    "id": "...",
    "status": "pending" | "paid" | "rejected",
    ...
  }
}
```

### 3. `GET /api/admin/purchases?status=pending`

List purchases (admin only).

**Response:**
```json
{
  "ok": true,
  "purchases": [
    {
      "id": "...",
      "user_email": "user@email.com",
      "course_id": "audio-goc-01",
      "status": "pending",
      "proof_url": "https://...",
      ...
    }
  ]
}
```

### 4. `POST /api/admin/purchases/update`

Update purchase status (admin only).

**Body:**
```json
{
  "purchaseId": "...",
  "status": "paid" | "rejected"
}
```

---

## 🎨 UI Pages

### `/courses/[courseId]` - Course Detail Page

**States hiển thị:**

1. **Not logged in:**
   - Preview section (always visible)
   - Button "Đăng nhập để đăng ký"

2. **Logged in, no purchase:**
   - Preview section
   - Button "Đăng ký khóa học" → Call `/api/purchases/create`
   - Button "Đã chuyển khoản, upload ảnh" → Dialog upload proof_url

3. **Pending:**
   - Badge "Đang chờ duyệt"
   - Thông tin chuyển khoản

4. **Paid but not activated:**
   - Badge "Đã thanh toán"
   - `ActivationCard` component

5. **Activated:**
   - Badge "Đã kích hoạt"
   - Button "Vào học ngay" → `/learn/[courseId]/[firstLesson]`

**Preview Lessons:**
- Hiển thị trong section riêng
- Có badge "Preview"
- Click vào mở được ngay (không cần paid/activation)

**All Lessons:**
- Hiển thị tất cả lessons
- Preview lessons: có badge "Preview", có button Play
- Non-preview: có icon Lock nếu chưa paid/activated

### `/admin/purchases` - Admin Purchases Page

- List pending purchases first
- Hiển thị: email, course_id, amount, note, proof_url (link)
- Actions: "Duyệt" (paid) / "Từ chối" (rejected)
- Call `/api/admin/purchases/update`

---

## 🔒 Server Guards

### `/learn/[courseId]/[lessonId]` Guard

**Flow:**
1. **Auth check** → Nếu chưa login → redirect `/auth`
2. **Preview check** → Nếu `is_preview=true` → **ALLOW** (skip purchase/activation)
3. **Purchase paid check** → Nếu chưa paid → redirect `/courses/[courseId]`
4. **Activation check** → Nếu chưa activated → redirect `/courses/[courseId]`
5. **Lesson unlock check** → Nếu chưa unlock → redirect `/courses/[courseId]`

**File:** `lib/learn-guard.ts` → `checkLearnAccess()`

---

## 📝 Lessons Data

### `data/course.ts`

**Update:**
- Thêm field `is_preview?: boolean` vào `Lesson` interface
- Set `is_preview: true` cho 3 bài đầu (lessonNum <= 3)

```typescript
{
  id: "lesson01",
  title: "Bài 01: ...",
  youtubeId: "...",
  is_preview: true,  // Bài 1-3
  quiz: [...]
}
```

---

## ✅ Checklist Implementation

- [x] Database: purchases table với proof_url và unique constraint
- [x] Server helpers: `lib/purchases.ts`
- [x] API routes: create, status, admin list, admin update
- [x] Course page: Preview section + states (not logged in / no purchase / pending / paid not activated / activated)
- [x] Admin page: List purchases + approve/reject
- [x] Lessons data: Thêm `is_preview` cho 3 bài đầu
- [x] Learn guard: Cho phép preview lessons không cần paid/activation
- [x] Build pass: TypeScript errors fixed

---

## 🚀 Next Steps

1. **Run SQL migration** trong Supabase Dashboard:
   - Copy `supabase/schema.sql` → SQL Editor → Run

2. **Set admin role** trong Supabase:
   ```sql
   UPDATE profiles SET role='admin' WHERE id='USER_ID';
   ```

3. **Test flow:**
   - Preview lessons (không cần login)
   - Tạo purchase (pending)
   - Admin duyệt (paid)
   - Kích hoạt device
   - Học lesson

---

## 📚 Files Changed

### Created:
- `lib/purchases.ts` - Server-only purchase helpers
- `app/api/purchases/create/route.ts` - Create purchase API
- `app/api/purchases/status/route.ts` - Get purchase status API
- `app/api/admin/purchases/route.ts` - List purchases (admin)
- `app/api/admin/purchases/update/route.ts` - Update purchase status (admin)
- `LUONG_BAN_KHOA_HOC.md` - This file

### Modified:
- `supabase/schema.sql` - Added proof_url, unique constraint, admin policies
- `data/course.ts` - Added `is_preview` field
- `app/courses/[courseId]/page.tsx` - Complete rewrite with preview + states
- `app/admin/purchases/page.tsx` - Updated to use new API
- `lib/learn-guard.ts` - Added preview lesson check

---

**✅ Implementation hoàn tất!**
