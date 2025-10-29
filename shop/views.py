import uuid
import hmac
import hashlib
import json
import requests
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, get_user_model
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q
from .models import (Product, Category, User, Cart, Cart_Detail,Order, Order_Detail, Payment, Revenue)
from .serializers import (ProductSerializer, CategorySerializer, UserSerializer,CartSerializer, Cart_DetailSerializer, OrderSerializer,Order_DetailSerializer, PaymentSerializer, RevenueSerializer)

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status



class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Product.objects.all()
        category_id = self.request.query_params.get('category')
        include_children = self.request.query_params.get('include_children')

        if category_id:
            try:
                category_id = int(category_id)
                if include_children == 'true':
                    child_ids = Category.objects.filter(parent_id=category_id).values_list('id', flat=True)
                    all_ids = [category_id] + list(child_ids)
                    return queryset.filter(category_id__in=all_ids)
                else:
                    return queryset.filter(category_id=category_id)
            except ValueError:
                return queryset.none()
        return queryset



class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny] 

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['patch'], url_path='avatar')
    def put(self, request):
        data = request.data.copy()
        if request.FILES.get('avatar'):
            data['avatar'] = request.FILES['avatar']
        serializer = UserSerializer(request.user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]


class Cart_DetailViewSet(viewsets.ModelViewSet):
    queryset = Cart_Detail.objects.all()
    serializer_class = Cart_DetailSerializer


from rest_framework.permissions import IsAuthenticated

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    queryset = Order.objects.all()
    # permission_classes = [IsAuthenticated]
    permission_classes = [AllowAny]  # Cho public

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



class Order_DetailViewSet(viewsets.ModelViewSet):
    queryset = Order_Detail.objects.all()
    serializer_class = Order_DetailSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]


class RevenueViewSet(viewsets.ModelViewSet):
    queryset = Revenue.objects.all()
    serializer_class = RevenueSerializer
    permission_classes = [IsAuthenticated]




UserModel = get_user_model()


class LoginByUsernameOrEmail(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username_or_email = request.data.get("username")
        password = request.data.get("password")

        if not username_or_email or not password:
            return Response({"error": "Thiếu thông tin đăng nhập"}, status=400)

        try:
            user = UserModel.objects.get(email=username_or_email)
            username = user.username
        except UserModel.DoesNotExist:
            username = username_or_email

        user = authenticate(username=username, password=password)
        if user is not None:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "message": "Đăng nhập thành công",
                "token": token.key,
                "user_id": user.id,
                "username": user.username,
            })
        return Response({"error": "Sai tài khoản hoặc mật khẩu"}, status=400)


class RegisterByUsernameOrEmail(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        first_name = request.data.get("first_name", "")
        last_name = request.data.get("last_name", "")
        phone = request.data.get("phone", "")

        if not username or not email or not password:
            return Response({"error": "Thiếu thông tin đăng ký"}, status=400)

        if UserModel.objects.filter(username=username).exists():
            return Response({"error": "Tên đăng nhập đã tồn tại"}, status=400)
        if UserModel.objects.filter(email=email).exists():
            return Response({"error": "Email đã tồn tại"}, status=400)

        user = UserModel.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone=phone
        )


        if not user.avatar:
            user.avatar = "avatars/default.jpg"
            user.save()

        token = Token.objects.create(user=user)

        return Response({
            "message": "Đăng ký thành công",
            "token": token.key,
            "user_id": user.id,
            "avatar": user.avatar.url if user.avatar else None
        })





import uuid
import json
import hmac
import hashlib
import requests
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .models import Order, Payment


MOMO_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create"
MOMO_PARTNER_CODE = "MOMO"
MOMO_ACCESS_KEY = "F8BBA842ECF85"
MOMO_SECRET_KEY = "K951B6PE1waDMi640xX08PD3vg6EkVlz"
REDIRECT_URL = "http://127.0.0.1:8000/api/momo/return/"
IPN_URL = "http://127.0.0.1:8000/api/momo/ipn/"



@api_view(["POST"])
@permission_classes([AllowAny])
def momo_create_payment(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    if order.total_price <= 0:
        return JsonResponse({"error": "Tổng tiền không hợp lệ"}, status=400)

    amount = str(int(order.total_price))
    order_info = f"Thanh toán đơn hàng #{order.id} với MoMo"
    # Tạo orderId mới mỗi lần để tránh trùng & tránh payUrl cũ
    order_id_str = f"{order.id}_{uuid.uuid4().hex[:6]}"
    request_id = str(uuid.uuid4())
    request_type = "captureWallet"
    extra_data = ""

    # Tạo chữ ký
    raw_signature = (
        f"accessKey={MOMO_ACCESS_KEY}"
        f"&amount={amount}"
        f"&extraData={extra_data}"
        f"&ipnUrl={IPN_URL}"
        f"&orderId={order_id_str}"
        f"&orderInfo={order_info}"
        f"&partnerCode={MOMO_PARTNER_CODE}"
        f"&redirectUrl={REDIRECT_URL}"
        f"&requestId={request_id}"
        f"&requestType={request_type}"
    )

    signature = hmac.new(
        MOMO_SECRET_KEY.encode("utf-8"),
        raw_signature.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    # Payload gửi sang MoMo
    payload = {
        "partnerCode": MOMO_PARTNER_CODE,
        "partnerName": "TestShop",
        "storeId": "MomoTestStore",
        "requestId": request_id,
        "amount": amount,
        "orderId": order_id_str,
        "orderInfo": order_info,
        "redirectUrl": REDIRECT_URL,
        "ipnUrl": IPN_URL,
        "extraData": extra_data,
        "requestType": request_type,
        "signature": signature,
    }

    try:
        res = requests.post(
            MOMO_ENDPOINT,
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        res_data = res.json()
        print("💰 MoMo response:", res_data)

        payment, _ = Payment.objects.get_or_create(order=order)
        payment.payment_method = "MoMo"
        payment.payment_status = "pending"
        payment.amount = order.total_price
        payment.momo_order_id = order_id_str
        payment.save()

        return JsonResponse({
            "payUrl": res_data.get("payUrl"),
            "orderId": order.id,
            "resultCode": res_data.get("resultCode"),
        })

    except Exception as e:
        print(" Lỗi khi gọi MoMo:", e)
        return JsonResponse({"error": "Lỗi khi gọi API MoMo", "details": str(e)}, status=500)


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def momo_ipn_callback(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
        print("📩 IPN Callback:", data)

        result_code = str(data.get("resultCode"))
        momo_order_id = data.get("orderId")

        payment = Payment.objects.get(momo_order_id=momo_order_id)
        order = payment.order

        if result_code == "0":
            order.status = "paid"
            payment.payment_status = "success"
        elif result_code == "1006":
            order.status = "cancelled"
            payment.payment_status = "cancelled"
        else:
            order.status = "failed"
            payment.payment_status = "failed"

        order.save()
        payment.save()

        return JsonResponse({"message": "Cập nhật trạng thái thành công"})

    except Payment.DoesNotExist:
        return JsonResponse({"error": "Không tìm thấy Payment tương ứng"}, status=404)
    except Exception as e:
        print(" Lỗi IPN:", e)
        return JsonResponse({"error": str(e)}, status=400)


@api_view(["GET"])
@permission_classes([AllowAny])
def momo_return(request):
    result_code = request.GET.get("resultCode")
    momo_order_id = request.GET.get("orderId")

    try:
        payment = Payment.objects.get(momo_order_id=momo_order_id)
        order = payment.order

        if result_code == "0":
            order.status = "paid"
            payment.payment_status = "success"
        elif result_code == "1006":
            order.status = "cancelled"
            payment.payment_status = "cancelled"
        else:
            order.status = "failed"
            payment.payment_status = "failed"

        order.save()
        payment.save()
    except Payment.DoesNotExist:
        print("Không tìm thấy Payment cho orderId:", momo_order_id)
    except Exception as e:
        print("Lỗi momo_return:", e)

    if result_code == "0":
        return redirect("http://localhost:5173/")
    elif result_code == "1006":
        return redirect("http://localhost:5173/")
    else:
        return redirect("http://localhost:5173/")

@api_view(['POST'])
def cancel_order(request, pk):
    try:
        order = Order.objects.get(pk=pk)
        if order.status == "pending":
            order.status = "cancelled"
            order.save()
            return Response({"message": "Đơn hàng đã được hủy"})
        return Response({"error": "Không thể hủy đơn hàng này"}, status=400)
    except Order.DoesNotExist:
        return Response({"error": "Không tìm thấy đơn hàng"}, status=404)




@api_view(['GET'])
@permission_classes([AllowAny])
def search_orders(request):
    keyword = request.GET.get('keyword')

    if not keyword:
        return Response({"error": "Vui lòng nhập số điện thoại hoặc email"}, status=400)

    orders = Order.objects.filter(
        Q(user__phone=keyword) | Q(user__email=keyword)
    )

    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from django.shortcuts import redirect

class MomoReturnView(APIView):
    permission_classes = [AllowAny]  

    def get(self, request):
        result_code = request.query_params.get("resultCode")
        order_id = request.query_params.get("orderId")

        if result_code == "0":
            return redirect(f"http://localhost:5173/payment-result?status=success&order_id={order_id}")
        else:
            # Nếu bị hủy hoặc thất 
            return redirect("http://localhost:5173/")
        
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import MyTokenObtainPairSerializer, ProfileSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import UserSerializer

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)



from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

@api_view(["GET"])
def order_detail_api(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    serializer = OrderSerializer(order)
    return Response(serializer.data)




import random
from django.core.mail import send_mail
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .models import PasswordResetOTP

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    email = request.data.get('email')
    if not email:
        return Response({"error": "Email bắt buộc"}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "Người dùng không tồn tại"}, status=404)

    otp = str(random.randint(100000, 999999))
    expires_at = timezone.now() + timedelta(minutes=10) 
    PasswordResetOTP.objects.create(user=user, otp=otp, expires_at=expires_at)


    send_mail(
        subject="Mã OTP đặt lại mật khẩu",
        message=f"Mã OTP của bạn là {otp}. Hết hạn sau 10 phút.",
        from_email=None,  # lấy DEFAULT_FROM_EMAIL
        recipient_list=[email]
    )

    return Response({"message": "Mã OTP đã được gửi tới email của bạn"})



from django.contrib.auth.hashers import make_password
import logging
logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    new_password = request.data.get('new_password')

    if not email:
            return Response({"error": "Email không được để trống"}, status=400)
    if not otp:
            return Response({"error": "OTP không được để trống"}, status=400)
    if not new_password:
            return Response({"error": "Mật khẩu mới không được để trống"}, status=400)


    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "Người dùng không tồn tại"}, status=404)
    try:
        otp_obj = PasswordResetOTP.objects.filter(user=user, otp=otp).last()
        if not otp_obj or not otp_obj.is_valid():
            return Response({"error": "OTP không hợp lệ hoặc đã hết hạn"}, status=400)
    except Exception as e:
        logger.error(f"Error checking OTP: {e}")
        return Response({"error": "Có lỗi khi kiểm tra OTP"}, status=500)

    user.password = make_password(new_password)
    user.save()
    otp_obj.delete()

    return Response({"message": "Mật khẩu đã được đổi thành công"})



from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .models import PasswordResetOTP

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')

    if not email or not otp:
        return Response({"error": "Email và OTP là bắt buộc"}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "Người dùng không tồn tại"}, status=404)

    now = timezone.now()
    valid_otps = PasswordResetOTP.objects.filter(user=user, expires_at__gt=now).order_by('-expires_at')

    if not valid_otps.exists():
        return Response({"error": "Không có OTP hợp lệ hoặc đã hết hạn"}, status=400)

    latest_otp = valid_otps.first()
    if latest_otp.otp != otp:
        return Response({"error": "OTP không hợp lệ hoặc đã hết hạn"}, status=400)

    valid_otps.exclude(id=latest_otp.id).delete()

    latest_otp.used = True
    latest_otp.save()

    return Response({"message": "OTP hợp lệ"})


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User

# views.py
# views.py
from django.http import JsonResponse
from .models import User

def check_user(request):
    username = request.GET.get('username', '')
    email = request.GET.get('email', '')
    phone = request.GET.get('phone', '')

    exists = {
        'username': User.objects.filter(username=username).exists() if username else False,
        'email': User.objects.filter(email=email).exists() if email else False,
        'phone': User.objects.filter(phone=phone).exists() if phone else False,
    }
    return JsonResponse(exists)



from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = request.user
    return Response({
        "username": user.username,
        "email": user.email,
        "is_superuser": user.is_superuser,
    })