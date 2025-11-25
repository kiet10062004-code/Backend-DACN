"""
Django settings for DACN_CNPM project.
"""
from pathlib import Path
# 1. NHẬP THƯ VIỆN CẦN THIẾT
import os
import dj_database_url # Thêm thư viện xử lý chuỗi kết nối DB
from datetime import timedelta
from dotenv import load_dotenv # Thư viện đọc biến môi trường (.env)

# Load biến môi trường từ file .env (chỉ cho môi trường local/Dev)
load_dotenv() 

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# 2. CẤU HÌNH BẢO MẬT & DEBUG (QUAN TRỌNG)
# Lấy SECRET_KEY từ biến môi trường (Render sẽ cung cấp)
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-4-dh1yccqxnvni_s)0yr@@@x&+4++hu8o8cf(yt&u1ys%%xp=') 

# DEBUG BẮT BUỘC PHẢI TẮT KHI TRIỂN KHAI
DEBUG = os.environ.get('DEBUG', 'False') == 'True' 

# Thay thế bằng URL công khai sau khi deploy
ALLOWED_HOSTS = [
    '.render.com', # Cho phép mọi subdomain của Render
    'kiet10062004-backend-dacn.onrender.com', # Ví dụ URL Render của bạn
    'kiet10062004-frontend-dacn.vercel.app', # Ví dụ URL Vercel của bạn
    '127.0.0.1', # Giữ lại cho local
    'localhost' # Giữ lại cho local
]


# Application definition

INSTALLED_APPS = [
    # Thêm Whitenoise vào đây nếu không có lỗi xung đột
    # 'whitenoise.runserver_nostatic', 
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'shop',     
    'admin_interface',
    'colorfield',
    'corsheaders', 
    'rest_framework.authtoken',
    'django_filters',
    'dashboard',
    'django.contrib.humanize',

]

# 3. CẤU HÌNH MIDDLEWARE (WHITENOISE & CORS)
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # 🥇 THÊM WHITENOISE VÀO ĐÂY
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', # 🥈 CORS NÊN ĐẶT SAU SESSION VÀ WHITENOISE
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'DACN_CNPM.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                ],
        },
    },
]

WSGI_APPLICATION = 'DACN_CNPM.wsgi.application'


# 4. CẤU HÌNH DATABASE (SỬ DỤNG dj-database-url)
# Render sẽ cung cấp biến môi trường DATABASE_URL
# Trong phần DATABASES:
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL', 
            'postgres://dacn_user:123456@localhost:5432/DACN_DB'), 
        conn_max_age=600,
        conn_health_checks=True,
    )
}
if 'default' in DATABASES and not DATABASES['default'].get('ENGINE'):
    DATABASES['default']['ENGINE'] = 'django.db.backends.postgresql'


# Password validation
# (Giữ nguyên)

# Internationalization
# (Giữ nguyên)

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# 5. CẤU HÌNH STATIC & MEDIA FILES
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles' # Nơi Whitenoise sẽ phục vụ static files

# Bắt buộc cho Whitenoise trong Production
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


AUTH_USER_MODEL = 'shop.User' 

# 6. CẤU HÌNH CORS (Thay thế bằng URL Vercel công khai)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173", # Giữ lại cho local dev
    "https://kiet10062004-frontend-dacn.vercel.app", # URL Vercel của bạn
    "https://frontend-dacn-git-master-bins-projects-94f2b6ff.vercel.app",
    "https://frontend-dacn.vercel.app",
    # Thêm các URL khác nếu cần
]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = [
    "https://kiet10062004-frontend-dacn.vercel.app",
    "https://frontend-dacn-git-master-bins-projects-94f2b6ff.vercel.app",
    "https://frontend-dacn.vercel.app",
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=10),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# 7. CẤU HÌNH EMAIL (Sử dụng biến môi trường cho bảo mật)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
# Lấy từ biến môi trường (Render sẽ cung cấp)
EMAIL_HOST_USER = os.environ.get('EMAIL_USER', '1150080061@sv.hcmunre.edu.vn')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_PASS', 'udfh dshm bjtu pjuj') 
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER