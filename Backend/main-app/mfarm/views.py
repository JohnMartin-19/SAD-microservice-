import time
from django.shortcuts import render
from rest_framework.permissions import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.urls import reverse_lazy
from .serializers import *
from .models import *
from django.views.decorators.csrf import csrf_exempt
import json
import os
from django.http import JsonResponse
import requests
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum
from rest_framework import status
from django.core.files.storage import default_storage
import uuid
from drf_spectacular.utils import extend_schema
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
import uuid
from rest_framework.permissions import IsAuthenticated,IsAuthenticatedOrReadOnly
import datetime
import base64
from io import BytesIO
from django.core.files.base import ContentFile
from django.views.decorators.cache import cache_page
import logging
import google.generativeai as genai


logger = logging.getLogger(__name__)

if settings.GEMINI_API_KEY:
    genai.configure(api_key = settings.GEMINI_API_KEY)
# Create your views here.

#API ENDPOINTS FOR PRODUCT

class ProductListCreateView(APIView):
   
    def get(self, request):
        """
        List all products.
        """
        queryset = Product.objects.all()
        serializer = ProductSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

   
    permission_classes = [IsAuthenticated] 
    def post(self, request):
        """
        Create a new product.
        """
        logger.info(f"Request headers: {request.META.get('HTTP_AUTHORIZATION')}")
        logger.info(f"Request user: {request.user}")

        serializer = ProductSerializer(data=request.data, context={'request': request})
        print("My User",request.user)
        if serializer.is_valid():
            serializer.save(user_id = self.request.user.id, user_username = self.request.user.username)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class ProductRetrieveUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]  

    def get(self, request, pk):
        """
        get a single product by ID.
        """
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """
        update a product by ID.
        """
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if product.user != request.user:
            return Response(
                {'error': 'You are not authorized to update this product'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ProductSerializer(product, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """
        Delete a product by ID.
        """
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        if product.user != request.user:
            return Response(
                {'error': 'You are not authorized to delete this product'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        product.delete()
        return Response({'message': 'Product deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

#logged in user API(product related)
class LoggedInUserProductListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        products = Product.objects.filter(user_username=request.user.username)
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
class LoggedInUserProductDeleteView(APIView):
    """
    API view for a farmer to delete their own product
    """
    
    permission_classes = [IsAuthenticated]
    
    
    def delete(self,request,pk):
        try:
            product = Product.objects.get(pk=pk)
            print('Product to be deleted:', product)
        except Product.DoesNotExist:
            return Response({"detail":"Product not Found"},status=status.HTTP_404_NOT_FOUND)

        if product.user_username != request.user.username:
            return Response({"detail":"You do not have permission to delete this product"})
        product.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
class LoggedInUserOrderListView(APIView):
    permission_classes = [IsAuthenticated]

    serializer_class = MyProductSerializer 
    # Only authenticated users can see their products

    def get(self,request):
        """
        Returns products only for the authenticated user.
        """
        user_id = self.request.user.id
        logger.info(f"Fetching products for user ID: {user_id}")
        return Product.objects.filter(user_id=user_id)


class RevenueView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            today = timezone.now().date()
            week_ago = today - timedelta(days=7)
            month_ago = today - timedelta(days=30)

            # Calculate revenue: sum of (ProductOrder.quantity * Product.price)
            base_query = (
                Order.objects.filter(
                    productorder__product__user=request.user,
                    complete=True
                )
                .annotate(
                    total=Sum(
                        F('productorder__quantity') * F('productorder__product__price')
                    )
                )
            )

            # Daily revenue
            day_revenue = base_query.filter(
                date_ordered__date=today
            ).aggregate(total_revenue=Sum('total'))['total_revenue'] or 0

            # Weekly revenue
            week_revenue = base_query.filter(
                date_ordered__date__gte=week_ago
            ).aggregate(total_revenue=Sum('total'))['total_revenue'] or 0

            # Monthly revenue
            month_revenue = base_query.filter(
                date_ordered__date__gte=month_ago
            ).aggregate(total_revenue=Sum('total'))['total_revenue'] or 0

            data = [
                {'period': 'today', 'revenue': float(day_revenue)},
                {'period': 'this_week', 'revenue': float(week_revenue)},
                {'period': 'this_month', 'revenue': float(month_revenue)},
            ]
            serializer = RevenueSerializer(data, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

########################### AI CHAT VIEW ############################

@csrf_exempt
def ai_chat_endpoint(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_prompt = data.get("prompt")
            
            if not user_prompt:
                return JsonResponse({'error':'No prompt found'}, status=400)
            if settings.GEMINI_API_KEY:
                try:
                    # for m in genai.list_models():
                    #     print(f"{m.name}: {m.description}")
                    model = genai.GenerativeModel("gemini-2.5-flash")
                    response = model.generate_content(user_prompt)
                    ai_response_text = response.text
                    return JsonResponse({'response':ai_response_text},status=200)
                except Exception as e:
                    print('Gemini AI error:',e)
                    return JsonResponse({'error':'AI model API key missing!'})
                
            else:
                return JsonResponse({'error':'Please configure your API key'})
        except json.JSONDecodeError:
            return JsonResponse({'error':'Invalid JSON'},status=400)
    return JsonResponse({'error':'Only POST requests are allowed to this api'})
            

###########  ORDER SERVICE API  ##############

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CartItemSerializer(data=request.data)
        if serializer.is_valid():
            product_id = serializer.validated_data['product_id']
            quantity = serializer.validated_data['quantity']
            try:
                product = Product.objects.get(id=product_id)
                if product.quantity < quantity:
                    return Response(
                        {'error': f'Only {product.quantity} items available'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                return Response({'product_id': product_id, 'quantity': quantity})
            except Product.DoesNotExist:
                return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class CheckoutView(APIView):
#     permission_classes = [IsAuthenticated]
   

#     @extend_schema(
#         request={
#             'type': 'object',
#             'properties': {
#                 'cart': {
#                     'type': 'array',
#                     'items': {
#                         'type': 'object',
#                         'properties': {
#                             'product_id': {'type': 'integer'},
#                             'quantity': {'type': 'integer', 'minimum': 1},
#                             'price': {'type': 'number'},
#                         },
#                         'required': ['product_id', 'quantity'],
#                     },
#                 },
#                 'payment_method': {'type': 'string'},
#                 'user_details': {
#                     'type': 'object',
#                     'properties': {
#                         'name': {'type': 'string'},
#                         'email': {'type': 'string', 'format': 'email'},
#                         'phone': {'type': 'string'},
#                     },
#                 },
#                 'shipping_address': {
#                     'type': 'object',
#                     'properties': {
#                         'address': {'type': 'string'},
#                         'city': {'type': 'string'},
#                         'postal_code': {'type': 'string'},
#                     },
#                 },
#                 'receipt_image': {'type': 'string', 'format': 'base64'},
#             },
#             'required': ['cart', 'payment_method', 'user_details', 'shipping_address'],
#         },
#         responses={201: MyOrderSerializer, 400: None, 401: None},
#         description=(
#             "Process checkout, create an order, and send email with receipt image "
#             "provided by the frontend."
#         )
#     )
#     def post(self, request):
#         try:
#             if not request.user.is_authenticated:
#                 return Response(
#                     {'error': 'User not authenticated'},
#                     status=status.HTTP_401_UNAUTHORIZED
#                 )

#             cart = request.data.get('cart', [])
#             print('cart data to be sent', cart)
#             payment_method = request.data.get('payment_method', '')
#             print('Payment', payment_method)
#             user_details = request.data.get('user_details', {})
#             print('Usr details', user_details)
#             shipping_address = request.data.get('shipping_address', {})
#             print('Shipping', shipping_address)

#             if not cart:
#                 return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

#             validated_cart = []
#             for item in cart:
#                 serializer = CartItemSerializer(data=item)
#                 if not serializer.is_valid():
#                     print('CartItemSerializer errors:', serializer.errors)
#                     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#                 validated_cart.append(serializer.validated_data)
#                 print(f"Item quantity type: {type(item['quantity'])}, validated: {type(serializer.validated_data['quantity'])}")

#             order_data = {
#                 'placed_by_id': request.user.id,
#                 'complete': False,
#                 'transaction_id': str(uuid.uuid4()),
#                 'status': 'Pending',
#                 'quantity': sum(item['quantity'] for item in validated_cart),
#                 'name': user_details.get('name', ''),
#                 'email': user_details.get('email', ''),
#                 'phone': user_details.get('phone', ''),
#                 'address': shipping_address.get('address', ''),
#                 'city': shipping_address.get('city', ''),
#                 'postal_code': shipping_address.get('postal_code', ''),
#                 'cart': validated_cart,
#             }
#             serializer = MyOrderSerializer(data=order_data)
#             if serializer.is_valid():
#                 order = serializer.save()
#                 print('Order created:', order.id)

#                 total_amount = 0
#                 for item in validated_cart:
#                     product = Product.objects.get(id=item['product_id'])
#                     product_quantity = int(product.quantity)
#                     print(f"Product quantity: {product_quantity} (type: {type(product_quantity)}), Requested: {item['quantity']} (type: {type(item['quantity'])})")
#                     if product_quantity < item['quantity']:
#                         order.delete()
#                         return Response(
#                             {'error': f'Only {product_quantity} of {product.name} available'},
#                             status=status.HTTP_400_BAD_REQUEST
#                         )
#                     product.quantity = product_quantity - item['quantity']
#                     product.save()
#                     print(f"Updated product {product.id} quantity to {product.quantity}")
#                     total_amount += float(product.price) * item['quantity']

#                 Transaction.objects.create(
#                     user_id=request.user,
#                     order_id=order,
#                     payment_method=payment_method
#                 )
#                 print('Transaction created for order:', order.id)

#                 response_data = serializer.data
#                 response_data['total_amount'] = total_amount
#                 return Response(response_data, status=status.HTTP_201_CREATED)
#             print('OrderSerializer errors:', serializer.errors)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Product.DoesNotExist:
#             return Response({'error': 'One or more products not found'}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             print('Unexpected error:', str(e))
#             return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SendReceiptView(APIView):
    permission_classes = [IsAuthenticated]
    

    @extend_schema(
        request={
            'type': 'object',
            'properties': {
                'order_id': {'type': 'integer'},
                'email': {'type': 'string', 'format': 'email'},
                'name': {'type': 'string'},
                'receipt_image': {'type': 'string', 'format': 'base64'},
            },
            'required': ['order_id', 'email', 'name', 'receipt_image'],
        },
        responses={200: None, 400: None, 401: None},
        description="Send an email with the order receipt image."
    )
    def post(self, request):
        try:
            order_id = request.data.get('order_id')
            email = request.data.get('email')
            name = request.data.get('name')
            receipt_image = request.data.get('receipt_image')

            if not all([order_id, email, name, receipt_image]):
                return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                Order.objects.get(id=order_id, placed_by=request.user)
            except Order.DoesNotExist:
                return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

            subject = f'MFarm Order Receipt - Order #{order_id}'
            from_email = settings.EMAIL_HOST_USER
            to_email = email
            text_content = (
                f"Dear {name},\n\n"
                f"Thank you for your order! Your receipt is attached.\n\n"
                f"Order #{order_id}\n"
                f"Verify your order: http://localhost:8000/mfarm/api/v1/order/verify/{order_id}/\n\n"
                f"Thank you,\nMFarm Team"
            )

            email_msg = EmailMultiAlternatives(subject, text_content, from_email, [to_email])
            try:
                img_data = base64.b64decode(receipt_image.split(',')[1])
                email_msg.attach('receipt.png', img_data, 'image/png')
            except (IndexError, ValueError) as e:
                print(f"Error decoding receipt image: {e}")
                return Response({'error': 'Invalid receipt image'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                email_msg.send()
                print(f"Email sent to {to_email}")
                return Response({'message': 'Receipt email sent'}, status=status.HTTP_200_OK)
            except Exception as e:
                print(f"Error sending email: {str(e)}")
                return Response({'error': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


########################################## PAYMENTS APIS ###########################################
#### MPESA STK
# class STKPushAPIView(APIView):
#     ############GENERATES AND RETURNS ACCESS TOKEN
#     def get(request):
#         consumer_key = settings.MPESA_CONSUMER_KEY
#         consumer_secret = settings.MPESA_CONSUMER_SECRET


#         # check that the credentials are provided
#         if not consumer_key or not consumer_secret:
#             raise Exception("M-Pesa consumer key or secret not found in environment variables")

#         url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
#         try:
#             encoded_credentials = base64.b64encode(f"{consumer_key}:{consumer_secret}".encode()).decode()
#             headers = {
#                 "Authorization": f"Basic {encoded_credentials}",
#                 "Content-Type": "application/json"
#             }
#             response = requests.get(url, headers=headers).json()
#             print(response)
#             if "access_token" in response:
#                 return response["access_token"]
#             else:
#                 raise Exception("Failed to get access token: " + response.get("error_description", "Unknown error"))
#         except Exception as e:
#             raise Exception("Failed to get access token: " + str(e))

#     ######INITIATES THE STK PUSH TO BE SENT ############
#     def post(self,request):
#         """
#         STK push endpoint.
#         """
#         try:
#             access_token = self.get()
#             headers = {"Authorization": f"Bearer {access_token}"}
#             timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
#             business_short_code = settings.MPESA_BUSINESS_SHORT_CODE
#             pass_key = settings.MPESA_PASS_KEY

#             # Validate that the credentials are provided
#             if not business_short_code or not pass_key:
#                 raise Exception("M-Pesa business short code or pass key not found in environment variables")

#             data = json.loads(request.body)
#             phone_number = data.get('phone_number')
#             amount = data.get('amount')
#             web_name = "M-FARM"
#             stk_password = base64.b64encode((business_short_code + pass_key + timestamp).encode('utf-8')).decode('utf-8')

#             payload = {
#                 "BusinessShortCode": business_short_code,
#                 "Password": stk_password,
#                 "Timestamp": timestamp,
#                 "TransactionType": "CustomerPayBillOnline",
#                 "Amount": amount,
#                 "PartyA": phone_number,
#                 "PartyB": business_short_code,
#                 "PhoneNumber": phone_number,
#                 "CallBackURL": "https://da8e-102-210-40-50.ngrok-free.app/callback/",
#                 "AccountReference": web_name,
#                 "TransactionDesc": "Payment of a ticket",
#             }

#             response = requests.post(
#                 "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
#                 headers=headers,
#                 json=payload,
#             )

#             return JsonResponse(response.json())

#         except json.JSONDecodeError:
#             return JsonResponse({'error': 'Invalid JSON'}, status=400)
#         except requests.exceptions.RequestException as e:
#             return JsonResponse({'error': f'Request error: {e}'}, status=500)
#         except Exception as e:
#             print(f"Error in stkpush: {e}")
#             return JsonResponse({'error': 'Internal server error'}, status=500)

#     @csrf_exempt
#     def mpesa_callback(request):
#         if request.method == 'POST':
#             try:
#                 callback_data = json.loads(request.body)
#                 print("M-Pesa callback received:", callback_data)

#                 result_code = callback_data.get("Body", {}).get("stkCallback", {}).get("ResultCode")
#                 result_desc = callback_data.get("Body", {}).get("stkCallback", {}).get("ResultDesc")

#                 if result_code == 0:
#                     print("Payment successful: ", result_desc)
#                     return JsonResponse({"ResultCode": 0, "ResultDesc": "Success"})
#                 else:
#                     print(f"Payment failed: {result_desc}")
#                     return JsonResponse({"ResultCode": 1, "ResultDesc": "Payment failed"})

#             except Exception as e:
#                 print(f"Error processing M-Pesa callback: {e}")
#                 return JsonResponse({"ResultCode": 1, "ResultDesc": "Error"})
#         else:
#             return JsonResponse({"ResultCode": 1, "ResultDesc": "Invalid request method"})