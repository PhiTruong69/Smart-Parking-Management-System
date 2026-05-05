
## 🚀 Hướng Dẫn Bắt Đầu

### Bước 1: Chạy Setup (2 phút)

**Windows:**
```bash
setup.bat
```

**macOS/Linux:**
```bash
bash setup.sh
```

### Bước 2: Khởi Động Dịch Vụ

**Tùy Chọn A - Tất cả cùng lúc:**
```bash
npm run start-dev
```

**Tùy Chọn B - Terminal riêng:**

Terminal 1:
```bash
cd backend && npm run dev
```

Terminal 2:
```bash
cd frontend && npm run dev
```

### Bước 3: Truy Cập Ứng Dụng

- 🌐 Frontend: http://localhost:5173
- 📡 Backend API: http://localhost:5000
- 📁 Dữ liệu: `backend/data/db.json`

---

## 🔐 Tài Khoản Kiểm Thử

| Tên Đăng Nhập | Mật Khẩu | Vai Trò |
|---------------|----------|--------|
| admin | admin123 | Admin |
| 1952001 | 123456 | Student |
| F2001 | 123456 | Faculty |
| S1023 | 123456 | Staff |

---

## 📁 Lưu Trữ Dữ Liệu

### Vị Trí
Dữ liệu của bạn được lưu trong một file duy nhất:
```
backend/data/db.json
```

### Tự Động Khởi Tạo
File JSON dữ liệu được **tự động tạo** khi bạn chạy backend lần đầu tiên. Nó sử dụng dữ liệu seed từ `backend/data/seed.js`.

### Đặt Lại Dữ Liệu
Để khôi phục cơ sở dữ liệu về trạng thái ban đầu:
```bash
cd backend
npm run reset:data
```

### Cấu Trúc Dữ Liệu
```json
{
  "users": [...],           // Tài khoản người dùng
  "zones": [...],           // Khu vực bãi đỗ xe
  "sessions": [...],        // Phiên bãi đỗ xe
  "tickets": [...],         // Vé
  "iot": {...},             // Thiết bị IoT
  "billing": {...},         // Giá và giao dịch
  "activityLogs": [...],    // Logs hoạt động
  "analytics": {...},       // Dữ liệu phân tích
  "metadata": {...}         // Metadata
}
```

---

## 🛠️ Lệnh Có Sẵn

### Backend
```bash
cd backend

npm start              # Chế độ production
npm run dev           # Chế độ development (tự tải lại)
npm run reset:data    # Đặt lại dữ liệu
```

### Frontend
```bash
cd frontend

npm run dev           # Server development
npm run build         # Build production
npm run preview       # Xem trước build
npm run lint          # Kiểm tra linting
```

---

## 🎯 Lợi Ích Chính

✅ **Không Cần Setup Database** - Lưu trữ dựa trên file JSON
✅ **Cài Đặt Đơn Giản** - Chỉ cần npm install
✅ **Setup Nhanh** - Script 2 phút
✅ **Phát Triển Dễ Dàng** - Không cần Docker
✅ **Hoàn Hảo cho Demo/Kiểm Thử** - Nhẹ và nhanh
✅ **Quản Lý Dữ Liệu Dễ** - JSON dễ đọc
✅ **Sao Lưu Dữ Liệu** - Copy file db.json

---

## 📚 Các File Tài Liệu

1. **README.md** - Tài liệu dự án chính
2. **QUICKSTART.md** - Bắt đầu nhanh 5 phút
3. **RUN_PROJECT.md** - Hướng dẫn setup chi tiết
4. **JSON_MIGRATION.md** (English) - Tóm tắt chuyển đổi
5. File này - Hướng dẫn tiếng Việt

---

## 🔒 Ghi Chú Bảo Mật

⚠️ **Chỉ cho Phát Triển!**

Setup hiện tại phù hợp cho phát triển và kiểm thử. Trước khi production:

1. Thay đổi mật khẩu kiểm thử trong `backend/data/seed.js`
2. Đặt JWT_SECRET an toàn
3. Bật HTTPS
4. Thực hiện xác thực thích hợp (HCMUT_SSO)
5. Xem xét chuyển sang cơ sở dữ liệu thích hợp

---

## ❓ Khắc Phục Sự Cố

### Port Đã Đang Sử Dụng
```bash
# Windows
netstat -ano | findstr :5000  # hoặc 5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000  # hoặc 5173
kill -9 <PID>
```

### Node.js Không Tìm Thấy
- Cài đặt từ https://nodejs.org/
- Kiểm tra: `node --version`

### Dữ Liệu Không Lưu
- Kiểm tra `backend/data/db.json` có thể đọc/ghi được không
- Đảm bảo quyền file chính xác
- Kiểm tra terminal để xem thông báo lỗi

---

## 📞 Hỗ Trợ

Để biết thêm thông tin chi tiết:
- Xem mục khắc phục sự cố trong [RUN_PROJECT.md](./RUN_PROJECT.md)
- Đọc [QUICKSTART.md](./QUICKSTART.md) để cần trợ giúp nhanh
- Xem [README.md](./README.md) để biết tổng quan tính năng

---

## 🎉 Bạn Đã Sẵn Sàng!

Chạy `setup.bat` hoặc `bash setup.sh` và bắt đầu phát triển!

Thưởng thức hệ thống quản lý bãi đỗ xe do JSON hỗ trợ! 🚗
