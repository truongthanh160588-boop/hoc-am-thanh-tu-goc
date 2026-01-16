# Hướng dẫn cấu hình Supabase gửi mã 6 số OTP (One-Time Password)

## ⚠️ LƯU Ý QUAN TRỌNG

**Supabase KHÔNG tự đổi Magic Link thành OTP 6 số chỉ bằng cách sửa template.**

- Template **Magic Link** dùng biến `{{ .ConfirmationURL }}` (link) → Không thể biến thành mã 6 số
- Template **OTP/Passcode** dùng biến `{{ .Token }}` hoặc `{{ .Code }}` → Mã 6 số
- OTP 6 số chỉ xuất hiện khi:
  1. ✅ Code dùng đúng flow OTP (`signInWithOtp` + `verifyOtp`)
  2. ✅ Supabase Dashboard có template OTP/Passcode (không phải Magic Link)

---

## 📋 CHECKLIST: Đảm bảo OTP 6 số hoạt động

### ✅ Bước 1: Cấu hình URL trong Supabase

1. Vào **Supabase Dashboard** → **Settings** → **Auth**
2. Tìm mục **"Site URL"**
3. Đặt URL production của bạn:
   ```
   https://hoc-am-thanh-tu-goc.vercel.app
   ```
4. (Tùy chọn) Thêm **"Redirect URLs"**:
   ```
   https://hoc-am-thanh-tu-goc.vercel.app/**
   http://localhost:3000/**
   ```
5. Click **"Save"**

**Lý do:** Supabase cần biết domain hợp lệ để gửi email OTP.

---

### ✅ Bước 2: Tắt "Confirm email" (Nếu cần)

1. Vào **Authentication** → **Providers** → **Email**
2. Tìm mục **"Confirm email"**
3. **Tắt** (uncheck) nếu bạn muốn user đăng nhập ngay sau khi verify OTP
4. Click **"Save"**

**Lý do:** Nếu bật "Confirm email", user phải click link xác nhận thêm → không cần thiết với OTP flow.

---

### ✅ Bước 3: Kiểm tra Email Template OTP/Passcode

1. Vào **Authentication** → **Email Templates**
2. Tìm template có tên:
   - **"Email OTP"** hoặc
   - **"One-time passcode"** hoặc
   - **"Passcode"** hoặc
   - **"OTP"**
3. **⚠️ KHÔNG chỉnh template "Magic Link"** → Template đó dùng cho link, không phải mã số

**Nếu KHÔNG thấy template OTP/Passcode:**
- Có thể project đang chạy Magic Link mode
- **Giải pháp:** Sửa code trước (Bước 4) → Quay lại Dashboard → Template OTP sẽ xuất hiện

---

### ✅ Bước 4: Code Next.js - Gửi OTP

**File:** `app/auth/page.tsx`

```typescript
const handleSendOTP = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!email.trim()) {
    setError("Vui lòng nhập email!");
    return;
  }

  setLoading(true);
  setError(null);

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      shouldCreateUser: true,
      // ⚠️ KHÔNG dùng emailRedirectTo → sẽ gửi Magic Link
    },
  });

  setLoading(false);

  if (error) {
    setError(error.message);
  } else {
    setStep("otp");
    setMessage("Mã 6 số đã được gửi về email của bạn.");
  }
};
```

**Lưu ý:**
- ✅ Dùng `signInWithOtp()` với `shouldCreateUser: true`
- ❌ **KHÔNG** dùng `emailRedirectTo` → sẽ gửi Magic Link
- ❌ **KHÔNG** dùng `signInWithPassword()` → không phải OTP

---

### ✅ Bước 5: Code Next.js - Verify OTP

**File:** `app/auth/page.tsx`

```typescript
const handleVerifyOTP = async (otpCode: string) => {
  if (!otpCode || otpCode.length !== 6) {
    setError("Vui lòng nhập đủ 6 số!");
    return;
  }

  setLoading(true);
  setError(null);

  const supabase = createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: otpCode, // Mã 6 số từ user
    type: "email", // ⚠️ Bắt buộc: type phải là "email"
  });

  setLoading(false);

  if (error) {
    setError(error.message || "Mã OTP không đúng. Vui lòng thử lại.");
  } else if (data.user) {
    // Tạo profile nếu chưa có
    await supabase.from("profiles").upsert({
      id: data.user.id,
      full_name: null,
    });

    router.push("/courses");
  }
};
```

**Lưu ý:**
- ✅ **Bắt buộc** phải có `verifyOtp()` → Nếu thiếu, Supabase sẽ đi theo hướng Magic Link
- ✅ `type: "email"` → Bắt buộc
- ✅ `token: otpCode` → Mã 6 số từ user nhập

---

## 🔍 CHECKLIST DEBUG: Nếu vẫn không ra mã 6 số

### 1. Kiểm tra Code

- [ ] Code có đủ 2 bước: `signInWithOtp()` + `verifyOtp()`?
- [ ] **KHÔNG** có `emailRedirectTo` trong `signInWithOtp()`?
- [ ] `verifyOtp()` có `type: "email"`?
- [ ] Đã test flow đầy đủ: Nhập email → Gửi mã → Nhập 6 số → Verify?

### 2. Kiểm tra Supabase Dashboard

- [ ] Site URL đã đặt đúng domain production?
- [ ] Email template **OTP/Passcode** đã có (không phải Magic Link)?
- [ ] Template OTP có biến `{{ .Token }}` hoặc `{{ .Code }}`?
- [ ] Provider Email đã BẬT?

### 3. Kiểm tra Email

- [ ] Email có vào **Spam/Junk**?
- [ ] Email có chứa mã 6 số (ví dụ: `123456`)?
- [ ] Email có chứa link "Đăng nhập" (Magic Link) → **SAI**, cần sửa lại

### 4. Kiểm tra Logs

- [ ] Vào **Supabase Dashboard** → **Logs** → **Auth Logs**
- [ ] Xem log khi gửi OTP: có lỗi gì không?
- [ ] Xem log khi verify OTP: có lỗi gì không?

### 5. Test lại

1. Clear cache browser
2. Thử email khác (nếu có)
3. Đợi 1-2 phút rồi thử lại (rate limit)

---

## 📧 Cấu hình Email Template OTP (Nếu cần tùy chỉnh)

1. Vào **Authentication** → **Email Templates**
2. Tìm template **"Email OTP"** hoặc **"One-time passcode"**
3. Click **"Edit"**

**Subject (Tiêu đề):**
```
Mã đăng nhập của bạn: {{ .Token }}
```

**Body (Nội dung):**
```
Chào bạn,

Mã đăng nhập 6 số của bạn là: **{{ .Token }}**

Mã này có hiệu lực trong 60 phút.

Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.

Trân trọng,
Học Âm Thanh Từ Gốc
```

**Lưu ý:**
- `{{ .Token }}` hoặc `{{ .Code }}` là biến tự động chứa mã 6 số
- **KHÔNG** xóa biến này
- **KHÔNG** thêm link nào khác (sẽ gây nhầm lẫn)

---

## 🚫 NHỮNG ĐIỀU KHÔNG LÀM

1. ❌ **KHÔNG** sửa template "Magic Link" để biến thành OTP
   - Magic Link vẫn là link, không thể biến thành mã số
   - Template Magic Link dùng `{{ .ConfirmationURL }}`, không có `{{ .Token }}`

2. ❌ **KHÔNG** dùng `emailRedirectTo` trong `signInWithOtp()`
   - Sẽ gửi Magic Link thay vì mã 6 số

3. ❌ **KHÔNG** thiếu `verifyOtp()`
   - Nếu thiếu, Supabase sẽ tiếp tục đi theo hướng Magic Link

4. ❌ **KHÔNG** dùng `signInWithPassword()` cho OTP flow
   - Đó là flow khác (password), không phải OTP

---

## ✅ KẾT QUẢ ĐÚNG

Sau khi cấu hình đúng:

1. User nhập email → Bấm "Gửi mã"
2. Email nhận được chứa **mã 6 số** (ví dụ: `123456`)
3. User nhập mã 6 số vào app
4. App gọi `verifyOtp()` → Đăng nhập thành công

**Email đúng:**
```
Mã đăng nhập của bạn: 123456

Chào bạn,
Mã đăng nhập 6 số của bạn là: 123456
...
```

**Email sai (Magic Link):**
```
Your Magic Link

Hãy nhấp vào liên kết này để đăng nhập:
[Đăng nhập] ← Link này
```

---

## 📚 Tham khảo

- [Supabase Auth OTP Docs](https://supabase.com/docs/guides/auth/auth-otp)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase verifyOtp API](https://supabase.com/docs/reference/javascript/auth-verifyotp)

---

**Cập nhật lần cuối:** $(date)  
**Phiên bản:** 2.0 (Sửa lại theo feedback từ anh Trương Thanh)
