from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import get_user_model
from django.db.models.functions import TruncDate
User = get_user_model()
from django.db.models import Sum
from shop.models import Product, Category, Order, Payment, Order_Detail, Revenue,Order_Detail
from .forms import UserForm,ProductForm,CategoryForm,OrderForm
from django.db.models.functions import TruncDate, TruncMonth, TruncYear
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from shop.models import Order
def dashboard_home(request):
    users = User.objects.all()     
    new_users = User.objects.order_by('-date_joined')[:6]
    products = Product.objects.all()    
    categories = Category.objects.all() 
    orders = Order.objects.all().order_by('id')
    payments = Payment.objects.all().order_by('id')
    revenues = Revenue.objects.all()
    order_detail = Order_Detail.objects.all().order_by('id')
    day = request.GET.get('day')
    month = request.GET.get('month')
    year = request.GET.get('year')
    product_id = request.GET.get('product_id')
    reset = request.GET.get('reset')
    section_target = request.GET.get('section', '')
    product_name = request.GET.get('product_name')  
    total_orders = orders.count()

    total_products = products.count()
    if reset:
        from django.urls import reverse
        return redirect(f"{reverse('dashboard_home')}?section={section_target}")
    if product_name:
        revenues = revenues.filter(product__name__icontains=product_name)
    elif product_id:
        revenues = revenues.filter(product_id=product_id)
    if day:
        revenues = revenues.filter(date=day)
        group_by = TruncDate('date')   
    elif month and year:
        revenues = revenues.filter(date__month=month, date__year=year)
        group_by = TruncDate('date')  
    elif month:
        revenues = revenues.filter(date__month=month)
        group_by = TruncDate('date')
    elif year:
        revenues = revenues.filter(date__year=year)
        group_by = TruncMonth('date')
    else:
        group_by = TruncMonth('date')  
    
    total_sales = revenues.aggregate(total=Sum('total'))['total'] or 0
    order_detail = Order_Detail.objects.all()
    chart_data = (
        revenues.annotate(period=group_by)
        .values('period')
        .annotate(total=Sum('total'))
        .order_by('period')
    )

    chart_labels = [r['period'].strftime('%Y-%m-%d') for r in chart_data]
    chart_values = [float(r['total']) for r in chart_data]
    context = {
        "users": users,
        "products": products,
        "categories": categories,
        "orders": orders,
        "payments": payments,
        "revenues": revenues,
        "order_detail": order_detail,
        'total_sales': total_sales, 
        'new_users': new_users,
        'section_target': section_target,
        'chart_labels': chart_labels,
        'chart_values': chart_values,
        'total_sales': total_sales,
        'chart_labels': chart_labels,
        'chart_values': chart_values,
        'section_target': section_target,\
        "total_orders": total_orders,     
        "total_products": total_products,
    }

    return render(request, 'dashboard/index.html', context)

def user_create(request):
    if request.method == 'POST':
        form = UserForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('dashboard_home')
    else:
        form = UserForm()
    return render(request, 'dashboard/users/form.html', {'form': form})


def user_update(request, pk):
    user = get_object_or_404(User, pk=pk)
    if request.method == 'POST':
        form = UserForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
            return redirect('dashboard_home')
    else:
        form = UserForm(instance=user)
    return render(request, 'dashboard/users/form.html', {'form': form})


def user_delete(request, pk):
    user = get_object_or_404(User, pk=pk)
    if request.method == 'POST':
        user.delete()
        return redirect('dashboard_home')
    return render(request, 'dashboard/users/confirm_delete.html', {'user': user})
def category_create(request):
    if request.method == 'POST':
        form = CategoryForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('dashboard_home')
    else:
        form = CategoryForm()
    return render(request, 'dashboard/categories/form.html', {'form': form})


def category_update(request, pk):
    category = get_object_or_404(Category, pk=pk)
    if request.method == 'POST':
        form = CategoryForm(request.POST, instance=category)
        if form.is_valid():
            form.save()
            return redirect('dashboard_home')
    else:
        form = CategoryForm(instance=category)
    return render(request, 'dashboard/categories/form.html', {'form': form})


def category_delete(request, pk):
    category = get_object_or_404(Category, pk=pk)
    if request.method == 'POST':
        category.delete()
        return redirect('dashboard_home')
    return render(request, 'dashboard/categories/confirm_delete.html', {'category': category})


def product_create(request):
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('dashboard_home')
    else:
        form = ProductForm()
    return render(request, 'dashboard/products/form.html', {'form': form})


def product_update(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES, instance=product)
        if form.is_valid():
            form.save()
            return redirect('dashboard_home')
    else:
        form = ProductForm(instance=product)
    return render(request, 'dashboard/products/form.html', {'form': form})


def product_delete(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == 'POST':
        product.delete()
        return redirect('dashboard_home')
    return render(request, 'dashboard/products/confirm_delete.html', {'product': product})



def edit_order(request, pk):
    order = get_object_or_404(Order, pk=pk)
    
    if request.method == "POST":
        form = OrderForm(request.POST, instance=order)
        if form.is_valid():
            form.save()
            messages.success(request, "Đơn hàng đã được cập nhật thành công.")
            return redirect("dashboard_home") 
    else:
        form = OrderForm(instance=order)

    return render(request, "dashboard/orders/edit_order.html", {"form": form, "order": order})


def delete_order(request, pk):
    order = get_object_or_404(Order, pk=pk)
    
    if request.method == "POST":
        order.delete()
        messages.success(request, "Đơn hàng đã được xóa thành công.")
        return redirect("dashboard_home")

    return render(request, "dashboard/orders/confirm_delete.html", {"order": order})


def order_detail(request, pk):
    order = get_object_or_404(Order, pk=pk)
    return render(request, 'dashboard/orders/order_detail.html', {'order': order})
