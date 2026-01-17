# 📋 TRIỂN KHAI 6 BƯỚC - NÂNG CẤP BẢO MẬT ACTIVATION

## ✅ Files Changed

### (0) Files Found
- ✅ `app/api/verify-key/route.ts`
- ✅ `app/learn/[courseId]/[lessonId]/page.tsx`
- ✅ `lib/supabase/server.ts`
- ✅ `lib/supabase/client.ts`
- ✅ `components/ActivationCard.tsx`
- ✅ `app/admin/keygen/page.tsx`

### (1) Created: `lib/activations.ts` (server-only)
**Functions:**
- `getActiveActivationCount({userId, courseId})` - Đếm activations active
- `isDeviceActive({userId, courseId, deviceId})` - Check device đã active
- `insertActivation({userId, courseId, deviceId})` - Insert bằng service role
- `hasActiveActivation({userId, courseId})` - Check có activation active

**Created:** `lib/supabase/service.ts` - Service role client helper

### (2) Updated: `app/api/verify-key/route.ts`
**Flow:**
1. Validate input (deviceId, key, courseId)
2. Verify HMAC bằng `ACTIVATION_SECRET` (server-only, không dùng NEXT_PUBLIC_)
3. Lấy user từ supabase server session (anon key)
4. Check purchase paid trong DB
5. Enforce 2 devices:
   - Nếu device đã active → return `{ok:true}` (idempotent)
   - Count active devices; nếu >=2 → return error
   - Insert activation bằng service role → return `{ok:true}`
6. Return JSON `{ok, message?}`

**Changes:**
- Dùng `lib/activations.ts` thay vì `activation-supabase.ts`
- Dùng service role để insert activation (bypass RLS)
- Bỏ `NEXT_PUBLIC_ACTIVATION_SECRET` fallback

### (3) Updated: Server Guard `/learn/[courseId]/[lessonId]`
**Files:**
- `app/learn/[courseId]/[lessonId]/layout.tsx` - Server guard wrapper
- `lib/learn-guard.ts` - Guard logic

**Guards (server-side, không tin localStorage):**
1. Get user server → nếu null redirect `/auth`
2. Check purchase paid → nếu fail redirect `/courses/[courseId]`
3. Check `hasActiveActivation()` → nếu fail redirect `/courses/[courseId]`
4. Check lesson unlocked (progress từ DB)

**Changes:**
- Layout.tsx check guard trước khi render page
- `learn-guard.ts` dùng `hasActiveActivation()` từ `lib/activations.ts`
- Tuyệt đối không đọc activation từ localStorage

### (4) Updated: Admin Revoke API
**File:** `app/api/admin/revoke-device/route.ts`

**Flow:**
- POST body: `{ userId, courseId, deviceId, note? }`
- Check admin: `profiles.role='admin'` bằng supabase server session
- Update activations: `revoked_at=now(), revoked_by=adminId, note` 
- Dùng service role để update (bypass RLS)
- Return `{ok:true}`

**Changes:**
- Check admin role từ DB (không dùng env fallback)
- Dùng service role để update

### (5) Updated: UI Admin
**Files:**
- `app/admin/keygen/page.tsx` - Đã có ActivationsList
- `components/admin/ActivationsList.tsx` - Hiển thị activations
- `app/api/admin/activations/route.ts` - API list activations

**Features:**
- Fetch list active activations (dùng service role)
- Render table: email/user_id, course_id, device_id, activated_at
- Button "Thu hồi" gọi `/api/admin/revoke-device`
- Hiển thị email từ `auth.users` (join query)

**Changes:**
- API dùng service role để list (bypass RLS)
- Join với `auth.users` để lấy email
- Format response với `user_email`

### (6) Updated: ActivationCard UX
**File:** `components/ActivationCard.tsx`

**Flow:**
- User nhập key → gọi `/api/verify-key`
- Nếu `ok: true`:
  - Lưu localStorage để cache (optional, cho UX nhanh)
  - Nhưng `/learn` guard vẫn dựa DB (không tin localStorage)

**Changes:**
- Giữ nguyên logic hiện tại
- Comment rõ: localStorage chỉ để UX, nguồn chân lý là DB

---

## 🔐 Security Notes

1. **Service Role Key:**
   - Chỉ dùng trong `lib/supabase/service.ts` (server-only)
   - Không expose ra client
   - Dùng để bypass RLS khi cần (insert activation, list admin, revoke)

2. **ACTIVATION_SECRET:**
   - Chỉ dùng `ACTIVATION_SECRET` (không dùng `NEXT_PUBLIC_ACTIVATION_SECRET`)
   - Server-only, không expose ra client

3. **Guard Logic:**
   - Tất cả guards chạy server-side
   - Không tin localStorage cho activation
   - Mọi quyền học quyết định bằng DB

4. **Admin Check:**
   - Check `profiles.role='admin'` từ DB
   - Không dùng env fallback trong production code

---

## 📝 Testing Checklist

- [ ] Test verify key → ghi DB
- [ ] Test enforce 2 devices (activate device thứ 3 → error)
- [ ] Test server guard `/learn` (chưa paid/activated → redirect)
- [ ] Test bypass localStorage (sửa localStorage → vẫn bị block)
- [ ] Test admin revoke device
- [ ] Test admin list activations (hiển thị email)

---

## 🚀 Deployment

1. **Chạy SQL migration** (nếu chưa có bảng activations)
2. **Set admin role:** `UPDATE profiles SET role='admin' WHERE id='USER_ID'`
3. **Set env vars:**
   - `ACTIVATION_SECRET` (server-only)
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
4. **Deploy code**

---

**Tất cả code đã được refactor theo đúng 6 bước yêu cầu!** ✅
