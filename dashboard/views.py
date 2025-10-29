from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import get_user_model
from django.db.models.functions import TruncDate
User = get_user_model()
from django.db.models import Sum
from shop.models import Product, Category, Order, Payment, Order_Detail, Revenue
from .forms import UserForm,ProductForm,CategoryForm
from django.db.models.functions import TruncDate, TruncMonth, TruncYear

def dashboard_home(request):
    users = User.objects.all()     
    new_users = User.objects.order_by('-date_joined')[:4]
    products = Product.objects.all()    
    categories = Category.objects.all() 
    orders = Order.objects.all().order_by('id')
    payments = Payment.objects.all().order_by('id')
    revenues = Revenue.objects.all()
    
    day = request.GET.get('day')
    month = request.GET.get('month')
    year = request.GET.get('year')
    reset = request.GET.get('reset')
    section_target = request.GET.get('section', '')

    if reset:
        from django.urls import reverse
        return redirect(f"{reverse('dashboard_home')}?section={section_target}")

    if day:
        revenues = revenues.filter(date=day)
        group_by = TruncDate('date')   # nhóm theo ngày
    elif month and year:
        revenues = revenues.filter(date__month=month, date__year=year)
        group_by = TruncDate('date')   # biểu đồ từng ngày trong tháng
    elif month:
        revenues = revenues.filter(date__month=month)
        group_by = TruncDate('date')
    elif year:
        revenues = revenues.filter(date__year=year)
        group_by = TruncMonth('date')  # biểu đồ từng tháng trong năm
    else:
        group_by = TruncMonth('date')  # mặc định: theo tháng
    
    total_sales = revenues.aggregate(total=Sum('total'))['total'] or 0
    order_detail = Order_Detail.objects.all()
        # === Dữ liệu biểu đồ doanh thu theo ngày ===
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
        'section_target': section_target,
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


# ========== PRODUCT CRUD ==========

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