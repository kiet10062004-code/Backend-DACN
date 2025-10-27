from django.contrib import admin

from .models import User, Category, Product, Order, Order_Detail, Cart, Cart_Detail, Payment, Revenue

admin.site.register(User)
admin.site.register(Category)
admin.site.register(Product)
admin.site.register(Order)
admin.site.register(Order_Detail)
admin.site.register(Cart)
admin.site.register(Cart_Detail)
admin.site.register(Payment)
admin.site.register(Revenue)

