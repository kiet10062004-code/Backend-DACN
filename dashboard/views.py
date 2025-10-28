from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import get_user_model
User = get_user_model()
from django.db.models import Sum

from shop.models import Product, Category, Order, Payment, Order_Detail, Revenue
from .forms import UserForm
# , ProductForm, CategoryForm   

def dashboard_home(request):

    users = User.objects.all()     
    new_users = User.objects.order_by('-date_joined')[:4]
    products = Product.objects.all()    
    categories = Category.objects.all() 
    orders = Order.objects.all().order_by('id')
    payments = Payment.objects.all().order_by('id')
    revenues = Revenue.objects.all()
    total_sales = revenues.aggregate(total=Sum('total'))['total'] or 0
    order_detail = Order_Detail.objects.all()
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