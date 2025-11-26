from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, CategoryViewSet, UserViewSet,CartViewSet, Cart_DetailViewSet, OrderViewSet, Order_DetailViewSet,PaymentViewSet, RevenueViewSet,LoginByUsernameOrEmail, RegisterByUsernameOrEmail,momo_create_payment, search_orders,request_password_reset,reset_password,check_user,ChangePasswordView
)
from . import views  
from .views import cancel_order,ProductSearch
from django.conf import settings
from django.conf.urls.static import static
from shop.views import MyTokenObtainPairView, ProfileView
from rest_framework_simplejwt.views import TokenRefreshView
from .views import ProfileView, order_detail_api
router = DefaultRouter()
router.register(r'Product', ProductViewSet)
router.register(r'Category', CategoryViewSet)
router.register(r'User', UserViewSet)
router.register(r'Cart', CartViewSet)
router.register(r'Cart_Detail', Cart_DetailViewSet)
router.register(r'Order', OrderViewSet)
router.register(r'order_detail', Order_DetailViewSet)
router.register(r'Payment', PaymentViewSet)
router.register(r'Revenue', RevenueViewSet)


urlpatterns = [
    # 1. TẤT CẢ CÁC ĐƯỜNG DẪN CUSTOM VÀ CỤ THỂ PHẢI ĐẶT TRƯỚC ROUTER
    
    # 1a. MoMo URLs (Đã bỏ tiền tố 'momo/' - Khắc phục lỗi 404 trước đó)
    path('create/<int:order_id>/', views.momo_create_payment, name='momo_create_payment'), 
    path('ipn/', views.momo_ipn_callback, name='momo_ipn_callback'), 
    path('return/', views.momo_return, name='momo_return'), 
    
    # 1b. Login/Register/Token URLs (Sử dụng cho /api/login/, /api/token/,...)
    path('login/', views.LoginByUsernameOrEmail.as_view()),
    path('register/', views.RegisterByUsernameOrEmail.as_view()),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # 1c. Các đường dẫn khác (Profile, Search, Cancel, Reset Password)
    path('order/<int:pk>/cancel/', views.cancel_order, name='cancel_order'),
    path('orders/search/', views.search_orders, name='search_orders'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path("orders/<int:order_id>/", views.order_detail_api),
    path('request-password-reset/', views.request_password_reset, name='request_password_reset'),
    path('reset-password/', views.reset_password, name='reset_password'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('check-user/', views.check_user, name='check_user'), 
    path('user/', views.user_info, name='user_info'),
    path('product/search/', views.ProductSearch.as_view()),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),

    # 2. Router (Luôn đặt cuối cùng để tránh xung đột với các đường dẫn cụ thể)
    path('', include(router.urls)), 
]