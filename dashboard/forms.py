from django import forms
from django.contrib.auth import get_user_model
from shop.models import Product, Category, Order  # thêm Order

User = get_user_model()


class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'email', 'phone','last_name','first_name', 'role', 'avatar','is_superuser']

    def __init__(self, *args, **kwargs):
        request = kwargs.pop('request', None)
        super().__init__(*args, **kwargs)
        if request and not request.user.is_superuser:
            self.fields.pop('is_superuser')


class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ['name', 'description', 'category', 'price', 'stock', 'status', 'image']


class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['name', 'parent']


# ✅ Form chỉnh sửa đơn hàng
class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = [
            'customer_name',
            'customer_address',
            'customer_phone',
            'delivery_status',
            'shipper_name',
            'shipper_phone',
            'delivery_start',
            'delivery_end',
        ]
        widgets = {
            'delivery_start': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'delivery_end': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Tuỳ biến hiển thị giao diện cho các field
        self.fields['customer_name'].widget.attrs.update({
            'placeholder': 'Tên khách hàng',
            'class': 'form-control'
        })
        self.fields['customer_address'].widget.attrs.update({
            'placeholder': 'Địa chỉ giao hàng',
            'class': 'form-control'
        })
        self.fields['customer_phone'].widget.attrs.update({
            'placeholder': 'Số điện thoại khách hàng',
            'class': 'form-control'
        })
        self.fields['delivery_status'].widget.attrs.update({
            'class': 'form-select'
        })
        self.fields['shipper_name'].widget.attrs.update({
            'placeholder': 'Tên người giao hàng',
            'class': 'form-control'
        })
        self.fields['shipper_phone'].widget.attrs.update({
            'placeholder': 'Số điện thoại người giao hàng',
            'class': 'form-control'
        })
        self.fields['delivery_start'].widget.attrs.update({'class': 'form-control'})
        self.fields['delivery_end'].widget.attrs.update({'class': 'form-control'})
