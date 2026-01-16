# 🔗 Cách Lấy Link Test Ngay

## ⚡ Cách Nhanh Nhất: Vercel (5 phút)

### Bước 1: Push lên GitHub
```bash
# Nếu chưa có git repo
git init
git add .
git commit -m "Ready for test"
git branch -M main

# Tạo repo mới trên GitHub.com, sau đó:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Bước 2: Deploy Vercel
1. Vào: https://vercel.com/new
2. Đăng nhập bằng GitHub
3. Import repository vừa push
4. Click "Deploy" (không cần config gì)
5. Đợi 2-3 phút → Có link ngay: `https://your-project.vercel.app`

**Lưu ý**: Nếu dùng Supabase, thêm env vars sau khi deploy (Settings → Environment Variables)

---

## 🏠 Cách 2: Local + Ngrok (Nếu muốn test ngay không cần GitHub)

### Bước 1: Cài ngrok
- Windows: Download từ https://ngrok.com/download
- Hoặc: `choco install ngrok` (nếu có Chocolatey)

### Bước 2: Chạy ngrok
```bash
# Mở terminal mới (server đang chạy ở terminal khác)
ngrok http 3000
```

Bạn sẽ nhận được link như:
```
Forwarding: https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:3000
```

**Link test**: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`

---

## 🚀 Cách 3: Localtunnel (Không cần cài)

```bash
# Cài global
npm install -g localtunnel

# Chạy tunnel
lt --port 3000
```

Sẽ có link: `https://xxxx.loca.lt`

---

## ✅ Server đang chạy

Production server đang chạy tại: **http://localhost:3000**

Bạn có thể:
- Test local: Mở http://localhost:3000
- Hoặc dùng một trong các cách trên để có public link

---

## 📱 Test PWA

**Lưu ý**: PWA chỉ hoạt động trên HTTPS. Vì vậy:
- ✅ Vercel: Tự động có HTTPS → PWA hoạt động
- ⚠️ Ngrok: Có HTTPS → PWA hoạt động
- ❌ Localhost: Không có HTTPS → PWA không hoạt động đầy đủ

---

## 🎯 Khuyến nghị

**Dùng Vercel** vì:
- ✅ Miễn phí
- ✅ HTTPS tự động
- ✅ PWA hoạt động đầy đủ
- ✅ Deploy nhanh (2-3 phút)
- ✅ Tự động deploy khi push code mới
