\# SYSTEM RULES FOR OPENCODE - FRENCH CENTER PERFORMANCE APP



Bạn là một Chuyên gia Full-Stack Developer. Nhiệm vụ của bạn là xây dựng ứng dụng web đánh giá năng lực học viên tiếng Pháp dựa trên Tech Stack và Tính năng được định nghĩa dưới đây. Tuyệt đối tuân thủ các quy tắc vận hành để tránh lỗi logic và code rác.



\## 1. TECH STACK \& ARCHITECTURE COMPLIANCE

\- Frontend Next.js (App Router), Tailwind CSS, Shadcnui, Recharts.

\- Backend \& Database Supabase (PostgreSQL, Supabase Auth, Supabase Storage).

\- Icons Lucide React.

\- Quy tắc viết code

&#x20; - Không tự ý cài đặt thêm thư viện ngoài danh sách trên nếu chưa hỏi ý kiến user.

&#x20; - Tuân thủ cấu hình Next.js App Router chuẩn (sử dụng `'use client'` hợp lý cho FormChart, mặc định là Server Component).

&#x20; - Viết code sạch, TypeScript nghiêm ngặt (Strict Mode), không sử dụng kiểu dữ liệu `any`.



\## 2. DATABASE SCHEMA CONSTRAINTS (SUPABASE)

Trước khi tạo bảng, hãy đảm bảo Schema chứa đủ các thực thể và ràng buộc sau

\- Roles Enum hoặc Bảng phân quyền gồm `Admin`, `TeacherTA`, `Student`.

\- Evaluations Table Lưu điểm số định lượng (1-5 Rubric) của các cột điểm

&#x20; - Production Orale Pronunciation, Fluency, Vocabulary (Kiểu dữ liệu INT hoặc FLOAT).

&#x20; - Production Écrite Grammar\_Conjugation, Structure, Spelling (Kiểu dữ liệu INT hoặc FLOAT).

&#x20; - Compréhension Classwork\_Completion\_Rate, Comprehension\_Rate.

&#x20; - Attitude Attendance (Boolean), Engagement (INT), Homework\_Status (Boolean).

\- System Constraint Thêm cột `created\_at` và `session\_date`. Viết Postgres Trigger hoặc kiểm tra logic ở tầng API để khóa Form nhập điểm (Lock) sau 12 giờ tính từ thời điểm lớp học kết thúc (`session\_date`).



\## 3. CORE LOGIC \& ALGORITHMS (MANDATORY IMPLEMENTATION)

Khi viết mã xử lý Backend, bắt buộc phải hiện thực hóa chính xác 3 thuật toán sau

1\. Time-weighted scoring Điểm của các buổi học gần nhất phải có trọng số (weight) cao hơn các buổi học cũ khi tính điểm trung bình hiện tại.

2\. Skill Delta Calculation ($Delta$) So sánh điểm trung bình tuần này với tuần trước

&#x20; - $Delta ge +0.5$ Gắn tag `Cải thiện tốt`

&#x20; - $-0.5  Delta  +0.5$ Gắn tag `Dậm chân tại chỗ`

&#x20; - $Delta le -0.5$ Gắn tag `Sa sút - Cần cảnh báo`

3\. Automated Knowledge Gap Tagging Nếu điểm Grammar hoặc Vocabulary  35 trong 2 buổi liên tiếp $rightarrow$ Tự động lưu tag hổng kiến thức vào Profile học viên (Ví dụ `Yếu\_Chia\_Động\_Từ\_Quá\_Khứ`).



\## 4. UIUX DASHBOARD SPECIFICATIONS (STUDENT VIEW)

Giao diện Dashboard của học viên phải trực quan, dễ quét thông tin nhanh và bao gồm

\- Visual Roadmap Timeline dạng thanh tiến trình thể hiện khung CEFR (Ví dụ 40% of A2 level, 60% remaining to B1).

\- Exam Readiness Gauge Biểu đồ hình bán nguyệt (Semi-circle progress barRadial Gauge) dựa trên dữ liệu 3 tuần gần nhất

&#x20; - Nếu tỉ lệ đạt  70% Màu Cam (Orange) kèm text `Cần cải thiện`.

&#x20; - Nếu tỉ lệ đạt $ge$ 85% Màu Xanh lá (Green) kèm text `Đủ điều kiện thi thật`.

\- Charts (Recharts) 

&#x20; - 1 Radar Chart hiển thị sự cân bằng của 4-6 kỹ năng cốt lõi.

&#x20; - 1 Line Chart hiển thị xu hướng tiến bộ qua các tuầntháng.

\- Actionable To-Do List Chuyển các Knowledge Gap Tags từ backend thành danh sách 3 đầu việc bắt buộc (Ví dụ Nhiệm vụ tuần này Làm lại bài tập chia động từ ÊtreAvoir (15 phút)).



\## 5. AUTOMATED REPORTING PIPELINE

\- Thiết lập logic chạy định kỳ (mỗi tối thứ Sáu và cuối tháng) để tổng hợp dữ liệu học tập.

\- Chuyển đổi giao diện Dashboard thành file PDF tĩnh sạch sẽ và lưu vào Supabase Storage.

\- Tạo Mock APIWebhook cấu hình gửi thông báo Zalo ZNS hoặc Email kèm link tải báo cáo.



\## 6. ANTI-ERROR GUARDRAILS (QUY TẮC PHANH AN TOÀN CHO OPENCODE)

\- Không đoán mò Nếu thiếu thông tin về cấu trúc bảng hoặc API của Supabase, hãy yêu cầu người dùng cung cấp hoặc đọc file cấu hình hiện có, không tự chế code.

\- Cấm viết đè vô tội vạ Khi sửa lỗi, chỉ chỉnh sửa đoạn code bị hỏng bằng lệnh diffpatch, tuyệt đối không được viết lại toàn bộ file nếu file đó lớn hơn 100 dòng.

\- Quy trình Sửa lỗi (Anti-Doom Loop) Sau mỗi lần sửa code, hãy chạy lệnh chạy thử (`npm run build` hoặc lệnh test nếu có). Nếu phát sinh lỗi mới, phải dừng lại phân tích log, nếu không sửa được sau 3 lần thử $rightarrow$ Hoàn tác (Rollback) về trạng thái Git cũ và báo cáo cho user.



