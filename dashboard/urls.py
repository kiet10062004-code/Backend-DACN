from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
urlpatterns = [
    path('', views.dashboard_home, name='dashboard_home'),

    path('users/add/', views.user_create, name='user_create'),
    path('users/<int:pk>/edit/', views.user_update, name='user_update'),
    path('users/<int:pk>/delete/', views.user_delete, name='user_delete'),

    path('categories/add/', views.category_create, name='category_create'),
    path('categories/<int:pk>/edit/', views.category_update, name='category_update'),
    path('categories/<int:pk>/delete/', views.category_delete, name='category_delete'),

    path('products/add/', views.product_create, name='product_create'),
    path('products/<int:pk>/edit/', views.product_update, name='product_update'),
    path('products/<int:pk>/delete/', views.product_delete, name='product_delete'),

    path("orders/<int:pk>/", views.order_detail, name="order_detail"),
    path("orders/edit/<int:pk>/", views.edit_order, name="edit_order"),
    path("orders/delete/<int:pk>/", views.delete_order, name="delete_order"),
    path('logout/', auth_views.LogoutView.as_view(next_page='http://localhost:5173/login?logout_success=true'), name='logout'),
]
