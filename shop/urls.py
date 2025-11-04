from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, CategoryViewSet, UserViewSet,CartViewSet, Cart_DetailViewSet, OrderViewSet, Order_DetailViewSet,PaymentViewSet, RevenueViewSet,LoginByUsernameOrEmail, RegisterByUsernameOrEmail,momo_create_payment, search_orders,request_password_reset,reset_password,check_user
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
    path('api/', include(router.urls)),
    path('login/', LoginByUsernameOrEmail.as_view()),
    path('register/', RegisterByUsernameOrEmail.as_view()),
    path('momo/create/<int:order_id>/', momo_create_payment, name='momo_create_payment'),
    path('api/momo/ipn/', views.momo_ipn_callback),
    path('api/momo/return/', views.momo_return),  
    path('api/order/<int:pk>/cancel/', cancel_order, name='cancel_order'),
    path('api/orders/search/', search_orders, name='search_orders'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/profile/', ProfileView.as_view(), name='profile'),
    path("orders/<int:order_id>/", order_detail_api),
    path('api/request-password-reset/', views.request_password_reset, name='request_password_reset'),
    path('api/reset-password/', views.reset_password, name='reset_password'),
    path('api/verify-otp/', views.verify_otp, name='verify_otp'),
    path('api/check-user/', check_user, name='check_user'),  
    path('api/user/', views.user_info, name='user_info'),
    path('api/product/search/', ProductSearch.as_view()),
]
