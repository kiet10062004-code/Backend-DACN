from rest_framework import serializers
from .models import (User, Category, Product, Order, Order_Detail,Payment, Revenue, Cart, Cart_Detail)

from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "phone", "first_name", "last_name", "avatar"]
        read_only_fields = ["username", "email"]  # không cho sửa username/email
        extra_kwargs = {"password": {"write_only": True}}

    def get_avatar(self, obj):
        if obj.avatar:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.avatar.url)
        return None
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        user.phone = validated_data.get("phone", "")
        user.save()
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'
        depth = 1

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        depth = 1 

class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = '__all__'
        depth = 1

class Cart_DetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart_Detail
        fields = '__all__'
        depth = 1


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        depth = 1

class RevenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Revenue
        fields = '__all__'
        depth = 1


from rest_framework import serializers

class Order_DetailSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)  # Full info sản phẩm
    order = serializers.PrimaryKeyRelatedField(read_only=True)  # Chỉ lấy ID đơn
    total_price = serializers.SerializerMethodField()  # Giá x số lượng

    class Meta:
        model = Order_Detail
        fields = ["id", "order", "product", "price", "quantity", "total_price"]

    def get_total_price(self, obj):
        return obj.price * obj.quantity


class OrderSerializer(serializers.ModelSerializer):
    items = serializers.ListField(write_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    order_details = Order_DetailSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        order = Order.objects.create(**validated_data)

        total = 0
        for item in items_data:
            product = Product.objects.get(id=item['product'])
            quantity = item['quantity']
            price = product.price
            total += price * quantity

            Order_Detail.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=price
            )

        order.total_price = total
        order.save()

        Payment.objects.create(
            order=order,
            amount=total,
            payment_method="momo",
            payment_status="pending"
        )

        return order
    


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get('username')
        password = attrs.get('password')

        try:
            user_obj = User.objects.get(username=username_or_email)
        except User.DoesNotExist:
            try:
                user_obj = User.objects.get(email=username_or_email)
            except User.DoesNotExist:
                raise serializers.ValidationError("Tài khoản không tồn tại")

        if not user_obj.check_password(password):
            raise serializers.ValidationError("Sai mật khẩu")

        data = super().validate({'username': user_obj.username, 'password': password})
        data['user_id'] = user_obj.id
        data['username'] = user_obj.username
        return data
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "avatar", "phone"]



