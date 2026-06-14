# apps/bookings/esewa.py
import hmac
import hashlib
import base64
from django.conf import settings

def generate_signature(amount, transaction_uuid, product_code, secret_key):
    """Generate HMAC-SHA256 signature for eSewa"""
    message = f"total_amount={amount},transaction_uuid={transaction_uuid},product_code={product_code}"
    
    signature = hmac.new(
        secret_key.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).digest()
    
    return base64.b64encode(signature).decode('utf-8')

def generate_esewa_form(amount, transaction_uuid, product_name="Hostel Booking"):
    """Generate eSewa payment form HTML"""
    signature = generate_signature(
        amount, 
        transaction_uuid, 
        settings.ESEWA_MERCHANT_CODE,
        settings.ESEWA_SECRET_KEY
    )
    
    form_html = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Redirecting to eSewa...</title>
    </head>
    <body>
        <form id="esewa-form" method="POST" action="{settings.ESEWA_PAYMENT_URL}">
            <input type="hidden" name="amount" value="{amount}">
            <input type="hidden" name="tax_amount" value="0">
            <input type="hidden" name="total_amount" value="{amount}">
            <input type="hidden" name="transaction_uuid" value="{transaction_uuid}">
            <input type="hidden" name="product_code" value="{settings.ESEWA_MERCHANT_CODE}">
            <input type="hidden" name="product_service_charge" value="0">
            <input type="hidden" name="product_delivery_charge" value="0">
            <input type="hidden" name="success_url" value="{settings.ESEWA_SUCCESS_URL}">
            <input type="hidden" name="failure_url" value="{settings.ESEWA_FAILURE_URL}">
            <input type="hidden" name="signed_field_names" value="total_amount,transaction_uuid,product_code">
            <input type="hidden" name="signature" value="{signature}">
        </form>
        <script>document.getElementById('esewa-form').submit();</script>
        <p>Redirecting to eSewa payment gateway...</p>
    </body>
    </html>
    '''
    return form_html