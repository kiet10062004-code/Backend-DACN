import smtplib
import os
from email.mime.text import MIMEText
from dotenv import load_dotenv

# 1. Tải cấu hình từ file .env local của bạn
load_dotenv()

email_user = os.getenv('EMAIL_HOST_USER')
email_password = os.getenv('EMAIL_HOST_PASSWORD')

print("--- CẤU HÌNH ĐANG TEST ---")
print(f"User: {email_user}")
print(f"Pass: {email_password}") # In ra để chắc chắn nó đã đọc được từ .env
print("--------------------------")

if not email_user or not email_password:
    print("❌ LỖI: Không đọc được biến môi trường từ file .env!")
    exit(1)

# 2. Cấu hình SMTP Gmail (Port 587 + TLS)
smtp_server = "smtp.gmail.com"
smtp_port = 587

try:
    print("⏳ Đang kết nối tới Gmail SMTP...")
    server = smtplib.SMTP(smtp_server, smtp_port)
    server.set_debuglevel(1) # Bật log chi tiết của SMTP
    
    print("⏳ Đang gửi lệnh EHLO...")
    server.ehlo()
    
    print("⏳ Đang bắt đầu TLS...")
    server.starttls()
    server.ehlo()
    
    print("🔐 Đang đăng nhập...")
    server.login(email_user, email_password)
    
    print("✅ ĐĂNG NHẬP THÀNH CÔNG!")
    
    # Gửi thử một email
    msg = MIMEText("Đây là email test từ script Python local. Nếu nhận được, cấu hình SMTP OK!")
    msg['Subject'] = "Test SMTP Local Success"
    msg['From'] = email_user
    msg['To'] = email_user # Gửi cho chính mình
    
    server.sendmail(email_user, [email_user], msg.as_string())
    print("✅ ĐÃ GỬI EMAIL TEST THÀNH CÔNG!")
    
    server.quit()

except smtplib.SMTPAuthenticationError as e:
    print("\n❌ LỖI XÁC THỰC (SAI MẬT KHẨU/EMAIL):")
    print(e)
    print("👉 Gợi ý: Kiểm tra lại App Password trong file .env")

except Exception as e:
    print(f"\n❌ LỖI KHÁC: {e}")