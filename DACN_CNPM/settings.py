from pathlib import Path
import os
import dj_database_url
from datetime import timedelta
from dotenv import load_dotenv

# Tải biến môi trường từ file .env (nếu chạy local)
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# --- SECRET KEY & DEBUG ---
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-temp-key')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# --- ALLOWED HOSTS ---
ALLOWED_HOSTS = [
    "*.vercel.app",
    "*.onrender.com",
    "backend-dacn-h8nw1.onrender.com", # Host cũ
    "backend-dacn-hmw1.onrender.com", # Host mới
    "127.0.0.1",
    "localhost",
]

# --- INSTALLED APPS ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'rest_framework.authtoken',
    'django_filters',

    'shop',
    'dashboard',
    'admin_interface',
    'colorfield',
    'corsheaders',
    'django.contrib.humanize',
]

# --- MIDDLEWARE ---
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    
    # ĐÃ SỬA: CsrfViewWrapper -> CsrfViewMiddleware
    'django.middleware.csrf.CsrfViewMiddleware', 
    
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'DACN_CNPM.urls'

# --- TEMPLATES ---
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

# --- DATABASE ---
DATABASES = {
    'default': dj_database_url.config(
        # Ưu tiên đọc từ biến môi trường DATABASE_URL
        default=os.environ.get('DATABASE_URL', 'postgres://dacn_user:123456@localhost:5432/DACN_DB'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# --- STATIC & MEDIA ---
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ĐÃ SỬA: Cấu hình STORAGES phải nằm ở cấp cao nhất (root level)
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
}

AUTH_USER_MODEL = 'shop.User'

# --- CORS CONFIG ---
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://frontend-dacn.vercel.app",
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https:\/\/.*\.vercel\.app$",
]

# --- CSRF CONFIG ---
CSRF_TRUSTED_ORIGINS = [
    "https://*.vercel.app",
    "https://*.onrender.com",
    "https://backend-dacn-h8nw1.onrender.com",
    "https://backend-dacn-hmw1.onrender.com",
]

CORS_ALLOW_HEADERS = ['*']

# --- REST FRAMEWORK ---
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=10),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
