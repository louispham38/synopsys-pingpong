# Synopsys Ping Pong VN07 Club

Hệ thống xếp hạng và quản lý thi đấu bóng bàn dựa trên ELO Rating, triển khai trên GitHub Pages với backend Google Sheets.

**Live:** [https://louispham38.github.io/synopsys-pingpong/](https://louispham38.github.io/synopsys-pingpong/)

## Tính năng

- **Bảng xếp hạng ELO** — Tự động cập nhật điểm sau mỗi trận, hiển thị phong độ, chuỗi thắng/thua
- **Click xem thống kê** — Click tên tay vợt trong bảng xếp hạng để xem chi tiết: thành tích, đối thủ thường gặp (head-to-head), lịch sử thi đấu
- **Nhập kết quả đa dạng** — Admin nhập trực tiếp, user nhập qua thách đấu hoặc nhập trực tiếp (chờ admin duyệt)
- **Hệ thống thách đấu** — User thách đấu nhau, nhập điểm, admin duyệt ghi nhận
- **Điểm uy tín (sao)** — Từ chối thách đấu quá 3 lần sẽ bị trừ sao
- **Kèo chấp tự động** — Tính kèo chấp dựa trên chênh lệch ELO + kèo chấp vui vẻ
- **Bảng xếp hạng tích lũy** — Thống kê theo tháng và theo năm
- **Trò chuyện** — Chat realtime giữa các thành viên, thông báo kết quả trận đấu tự động
- **Dashboard cá nhân** — Quản lý tên hiển thị, mật khẩu, xem thống kê & lịch sử cá nhân
- **Đếm lượt xem** — Hiển thị số người đang xem trang
- **Responsive** — Giao diện tối, hiện đại, tương thích mobile

## Cấu trúc dự án

```
pingpong-ranking/
├── index.html              # Giao diện (SPA)
├── app.js                  # Logic: ELO, auth, sync, UI
├── styles.css              # Toàn bộ CSS (dark theme)
├── google-apps-script.js   # Backend script cho Google Sheets
├── .gitignore
└── README.md
```

## Hướng dẫn cài đặt

### 1. Clone repository

```bash
git clone https://github.com/louispham38/synopsys-pingpong.git
cd synopsys-pingpong
```

### 2. Tạo Google Sheets Backend

Hệ thống sử dụng Google Sheets làm database miễn phí thông qua Google Apps Script.

#### a) Tạo Google Spreadsheet

1. Vào [Google Sheets](https://sheets.google.com) và tạo Spreadsheet mới
2. Đặt tên tùy ý (ví dụ: `PingPong Data`)
3. Đổi tên sheet thành `Data` (hoặc để mặc, script sẽ tự tạo)

#### b) Thêm Apps Script

1. Trong Google Sheets, vào **Extensions > Apps Script**
2. Xóa nội dung mặc định, copy toàn bộ nội dung file `google-apps-script.js` paste vào
3. Nhấn **Save** (Ctrl+S)

#### c) Deploy Web App

1. Nhấn **Deploy > New deployment**
2. Chọn loại: **Web app**
3. Cấu hình:
   - **Description:** `PingPong API` (tùy ý)
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. Nhấn **Deploy**
5. Cấp quyền truy cập khi được hỏi (Review Permissions > chọn tài khoản > Advanced > Go to... > Allow)
6. **Copy URL** của Web App (dạng `https://script.google.com/macros/s/ABC.../exec`)

#### d) Cập nhật URL vào code

Mở file `app.js`, thay URL ở dòng đầu tiên:

```javascript
const SHEETS_API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

> **Lưu ý:** Mỗi lần sửa Google Apps Script, bạn phải **Deploy > New deployment** (tạo mới, không phải edit deployment cũ) để thay đổi có hiệu lực, rồi cập nhật lại URL mới vào `app.js`.

### 3. Deploy lên GitHub Pages

```bash
git add -A
git commit -m "Initial setup"
git push origin main
```

1. Vào repo trên GitHub > **Settings > Pages**
2. Source: chọn branch `main`, folder `/ (root)`
3. Nhấn **Save**
4. Sau 1-2 phút, website sẽ có tại `https://<username>.github.io/<repo-name>/`

### 4. Thiết lập tài khoản Admin

1. Truy cập website
2. Nhấn **Đăng nhập** và chọn tài khoản `admin`
3. Lần đầu tiên sẽ yêu cầu tạo mật khẩu mới cho admin
4. Sau khi tạo mật khẩu, bạn có toàn quyền quản lý

## Hướng dẫn sử dụng

### Vai trò người dùng

| Vai trò | Quyền |
|---------|-------|
| **Guest** | Xem bảng xếp hạng, xem lịch sử, xem thống kê tay vợt |
| **User** | Đăng ký tài khoản, thách đấu, nhập kết quả (chờ duyệt), chat |
| **Admin** | Nhập kết quả trực tiếp, duyệt/từ chối kết quả, quản lý tay vợt & tài khoản |

### Admin — Nhập kết quả

1. Đăng nhập admin > tab **Nhập Kết Quả**
2. Chọn 2 tay vợt, nhập tỉ số từng set (3-7 set)
3. Chọn kèo chấp vui nếu có
4. Nhấn **Lưu Kết Quả** — điểm ELO tự động cập nhật, kết quả thông báo lên chat

### User — Thách đấu

1. Đăng ký tài khoản, liên kết với tay vợt của mình
2. Tab **Thách Đấu** > chọn đối thủ > gửi thách đấu
3. Đối thủ chấp nhận > cả 2 nhập kết quả
4. Chờ Admin duyệt để ghi nhận chính thức

### User — Nhập trực tiếp

1. Tab **Thách Đấu** > phần **Nhập Kết Quả Trực Tiếp**
2. Chọn 2 tay vợt, nhập tỉ số
3. Gửi lên, chờ Admin duyệt

### Xem thống kê tay vợt

- Click vào **tên tay vợt** trong bảng xếp hạng
- Hiện modal chi tiết: thành tích, head-to-head, phong độ, lịch sử

## Hệ thống ELO

- **K-Factor:** 32
- **Công thức:** `Kỳ vọng A = 1 / (1 + 10^((RatingB - RatingA) / 400))`
- **Thay đổi điểm:** `ΔA = K × (Kết quả - Kỳ vọng A)`
- Rating tối thiểu: 100

## Công nghệ

- **Frontend:** HTML, CSS, JavaScript thuần (không framework)
- **Backend:** Google Apps Script + Google Sheets (miễn phí, không cần server)
- **Hosting:** GitHub Pages (miễn phí)
- **Auth:** SHA-256 hash passwords, `localStorage` + cloud sync
- **Sync:** Custom SyncManager với debounce, merge, retry

## Tùy chỉnh

### Thay đổi danh sách tay vợt ban đầu

Trong `app.js`, tìm mảng `INITIAL_PLAYERS` và sửa theo format:

```javascript
const INITIAL_PLAYERS = [
    { id: 1, name: 'Tên Tay Vợt', group: 'Nhóm A', email: 'email@example.com', rating: 500 },
    // ...
];
```

### Thay đổi kèo chấp vui

Tìm `FUN_HANDICAP_LABELS` trong `app.js` và thêm/sửa các kèo.

## Lưu ý quan trọng

- **Bảo mật:** Không commit API keys hoặc mật khẩu vào repo public
- **Google Apps Script:** Mỗi lần sửa script phải tạo **New deployment** mới
- **Cache trình duyệt:** Sau khi deploy code mới, nhớ hard-refresh (`Ctrl+Shift+R`)
- **Đồng bộ dữ liệu:** Dữ liệu tự động đồng bộ qua Google Sheets mỗi 15 giây

## License

MIT
