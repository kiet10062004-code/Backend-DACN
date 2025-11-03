from django.db import models, transaction
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db.models import Sum, F
from datetime import date
from decimal import Decimal



class User(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    phone = models.CharField(max_length=10, blank=True, null=True)
    role = models.CharField(max_length=20, default='user')

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    class Meta:
        db_table = 'User'

    def __str__(self):
        return self.username


class Category(models.Model):
    name = models.CharField(max_length=100)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL,related_name='children')

    class Meta:
        db_table = 'Category'

    def __str__(self):
        return self.name


class Product(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Đang bán'
        INACTIVE = 'inactive', 'Ngừng bán'
        OUT_OF_STOCK = 'out_of_stock', 'Hết hàng'
        HIDDEN = 'hidden', 'Ẩn khỏi website'

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(choices=Status.choices, default=Status.ACTIVE, max_length=20)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')    
    price = models.DecimalField(max_digits=10, decimal_places=0)
    stock = models.IntegerField(default=0)
    sold = models.IntegerField(default=0)
    image = models.ImageField(upload_to='products/', blank=True, null=True)

    class Meta:
        db_table = 'Product'

    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"
    def save(self, *args, **kwargs):
            # Nếu stock = 0 thì set status = OUT_OF_STOCK
        if self.stock <= 0 and self.status != self.Status.OUT_OF_STOCK:
            self.status = self.Status.OUT_OF_STOCK
        # Nếu stock > 0 và đang là OUT_OF_STOCK thì đổi lại ACTIVE
        elif self.stock > 0 and self.status == self.Status.OUT_OF_STOCK:
            self.status = self.Status.ACTIVE
        super().save(*args, **kwargs)   


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Chờ xử lý'),
        ('paid', 'Đã thanh toán'),
        ('cancelled', 'Đã hủy'),
        ('failed', 'Thất bại'),
    ]

    DELIVERY_CHOICES = [
        ('not_delivered', 'Chưa giao hàng'),
        ('delivering', 'Đang giao hàng'),
        ('delivered', 'Đã giao hàng'),
    ]

    customer_name = models.CharField(max_length=100)
    customer_address = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=20)
    total_price = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    payment_method = models.CharField(max_length=50, default='momo')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    delivery_status = models.CharField(max_length=20, choices=DELIVERY_CHOICES, default='not_delivered')
    shipper_name = models.CharField(max_length=100, blank=True, null=True)
    shipper_phone = models.CharField(max_length=20, blank=True, null=True)
    delivery_start = models.DateTimeField(blank=True, null=True)
    delivery_end = models.DateTimeField(blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Order'

    def __str__(self):
        return f"Đơn hàng #{self.id} - {self.customer_name} - {self.get_delivery_status_display()}"




class Order_Detail(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_details')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=0)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])

    class Meta:
        db_table = 'OrderDetail'

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"



class Cart(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Đang sử dụng'
        CHECKED_OUT = 'checked_out', 'Đã thanh toán'
        ABANDONED = 'abandoned', 'Bị lãng quên'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(choices=Status.choices, default=Status.ACTIVE, max_length=20)

    class Meta:
        db_table = 'Cart'

    def __str__(self):
        return f"Cart #{self.id} - {self.status}"



class Cart_Detail(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=0)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])

    class Meta:
        db_table = 'CartDetail'

    def __str__(self):
        return f"{self.product.name} - {self.quantity} x {self.price}"


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Chờ xử lý'
        SUCCESS = 'success', 'Thành công'
        FAILED = 'failed', 'Thất bại'
        CANCELLED = 'cancelled', 'Đã hủy'

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    momo_order_id = models.CharField(max_length=100, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=50, default='momo')
    payment_status = models.CharField(
        max_length=20,
        choices=Status.choices,   # ✅ thêm choices
        default=Status.PENDING
    )

    class Meta:
        db_table = 'Payment'

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_status = None
        if not is_new:
            old_status = Payment.objects.get(pk=self.pk).payment_status

        super().save(*args, **kwargs)

        if self.payment_status == self.Status.SUCCESS and old_status != self.Status.SUCCESS:
            self.order.status = 'paid'
            self.order.save()
            Revenue.update_revenue(self.order)
        elif self.payment_status == self.Status.CANCELLED:
            self.order.status = 'cancelled'
            self.order.save()
        elif self.payment_status == self.Status.FAILED:
            self.order.status = 'failed'
            self.order.save()

    def __str__(self):
        return f"Thanh toán {self.get_payment_status_display()} cho đơn #{self.order.id}"

class Revenue(models.Model):
    date = models.DateField(default=date.today)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)
    total = models.DecimalField(max_digits=12, decimal_places=0, default=Decimal('0.00'))
    
    class Meta:
        db_table = 'Revenue'
        constraints = [
            models.UniqueConstraint(fields=['date', 'product'], name='uniq_revenue_day_product')
        ]

    def __str__(self):
        return f"{self.date} - {self.product.name} - {self.total}₫"

    @classmethod
    def update_revenue(cls, order):
        with transaction.atomic():
            for item in order.order_details.select_related('product'):
                # Khóa sản phẩm trong DB để tránh oversell
                product = Product.objects.select_for_update().get(pk=item.product.pk)

                # Nếu tồn kho không đủ thì báo lỗi (hoặc rollback)
                if product.stock < item.quantity:
                    raise ValueError(f"Sản phẩm {product.name} đã hết hàng")

                # Cập nhật doanh thu
                obj, _ = cls.objects.get_or_create(
                    date=date.today(),
                    product=product,
                    defaults={'quantity': 0, 'total': Decimal('0.00')}
                )
                cls.objects.filter(pk=obj.pk).update(
                    quantity=F('quantity') + item.quantity,
                    total=F('total') + (item.price * item.quantity)
                )

                # Trừ kho thật
                product.stock = F('stock') - item.quantity
                product.sold = F('sold') + item.quantity
                product.save()



from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class PasswordResetOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    expires_at = models.DateTimeField()
    def is_valid(self):
        return self.expires_at > timezone.now()
    def __str__(self):
        return f"{self.user.email} - {self.otp}"

