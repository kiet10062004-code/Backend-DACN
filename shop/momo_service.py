import json, uuid, hmac, hashlib, requests
from django.conf import settings

def create_momo_payment(order):
    endpoint = "https://test-payment.momo.vn/v2/gateway/api/create"
    partnerCode = "MOMO"
    accessKey = "F8BBA842ECF85"
    secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz"

    amount = str(order.total_price)
    orderInfo = f"Thanh toán đơn hàng #{order.id}"
    redirectUrl = "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b"
    ipnUrl = redirectUrl
    requestType = "captureWallet"
    orderId = str(uuid.uuid4())
    requestId = str(uuid.uuid4())
    extraData = ""

    raw_signature = f"accessKey={accessKey}&amount={amount}&extraData={extraData}&ipnUrl={ipnUrl}&orderId={orderId}&orderInfo={orderInfo}&partnerCode={partnerCode}&redirectUrl={redirectUrl}&requestId={requestId}&requestType={requestType}"
    signature = hmac.new(secretKey.encode('ascii'), raw_signature.encode('ascii'), hashlib.sha256).hexdigest()

    data = {
        'partnerCode': partnerCode,
        'partnerName': "ShopDemo",
        'storeId': "ShopSystem",
        'requestId': requestId,
        'amount': amount,
        'orderId': orderId,
        'orderInfo': orderInfo,
        'redirectUrl': redirectUrl,
        'ipnUrl': ipnUrl,
        'lang': "vi",
        'extraData': extraData,
        'requestType': requestType,
        'signature': signature
    }

    res = requests.post(endpoint, json=data)
    result = res.json()
    return result.get('payUrl')
