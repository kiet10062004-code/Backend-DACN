"""
URL configuration for DACN_CNPM project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 🚨 QUAN TRỌNG: Thêm 'api/' vào đây
    path('api/', include('shop.urls')), 
    path('momo/', include('shop.urls')), # <--- Dòng này đang BỊ LẶP lại trong CHÍNH file shop/urls.py!
    # Xóa các dòng path('api/token'...) ở đây đi vì nó sẽ gây rối
    # Chúng ta sẽ để shop/urls.py quản lý hết
    path('dashboard/', include('dashboard.urls')), 
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

