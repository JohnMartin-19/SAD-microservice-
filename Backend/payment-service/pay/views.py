from django.conf import settings
import uuid
import datetime
import base64
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import * 
from .serializers import *
from django.views.decorators.csrf import csrf_exempt
import json
import os
from django.http import JsonResponse
import requests
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum
import logging
from dotenv import load_dotenv
import os
from django.core.mail import EmailMultiAlternatives
from rest_framework.permissions import IsAuthenticated,AllowAny
from drf_spectacular.utils import extend_schema

load_dotenv()

logger = logging.getLogger(__name__)

PRODUCT_SERVICE_BASE_URL = os.getenv("PRODUCT_SERVICE_BASE_URL", "http://localhost:8000/api/v1/products/")
USER_SERVICE_BASE_URL = os.getenv("USER_SERVICE_BASE_URL", "http://localhost:8001/api/v1/users/") # If you need user details from user-service


class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=CheckoutRequestSerializer, 
        responses={
            201: MyOrderSerializer, 
            400: {'description': 'Bad Request', 'type': 'object', 'properties': {'error': {'type': 'string'}}},
            401: {'description': 'Unauthorized', 'type': 'object', 'properties': {'error': {'type': 'string'}}},
            404: {'description': 'Not Found', 'type': 'object', 'properties': {'error': {'type': 'string'}}},
            500: {'description': 'Internal Server Error', 'type': 'object', 'properties': {'error': {'type': 'string'}}},
        },
        tags=['Payments'],
        description=(
            "Process checkout and create a pending order. "
            "Communicates with product-service for product details and stock updates."
        )
    )
    def post(self, request):
        if not request.user.is_authenticated:
            return Response(
                {'error': 'User not authenticated'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        cart = request.data.get('cart', [])
        payment_method = request.data.get('payment_method', '')
        user_details = request.data.get('user_details', {})
        shipping_address = request.data.get('shipping_address', {})

        if not cart:
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        #validate cart items and fetch product details from product-service
        processed_cart_items = []
        total_amount = 0

        for item in cart:
            serializer = CartItemInputSerializer(data=item) 
            if not serializer.is_valid():
                logger.error(f'CartItemInputSerializer errors: {serializer.errors}')
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            validated_item = serializer.validated_data
            product_id = validated_item['product_id']
            quantity = validated_item['quantity']

            # Make API call to product-service to get product details
            try:
                # Assuming product-service has an endpoint like /api/v1/products/<id>/
                product_response = requests.get(f"{PRODUCT_SERVICE_BASE_URL}{product_id}/")
                product_response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
                product_data = product_response.json()

                if product_data.get('quantity') < quantity:
                    return Response(
                        {'error': f"Only {product_data.get('quantity')} of {product_data.get('name')} available"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                processed_cart_items.append({
                    'product_id': product_id,
                    'product_name': product_data.get('name'),
                    'product_price': product_data.get('price'),
                    'quantity': quantity
                })
                total_amount += float(product_data.get('price')) * quantity

            except requests.exceptions.RequestException as e:
                logger.error(f"Error fetching product {product_id} from product-service: {e}")
                return Response(
                    {'error': f'Failed to retrieve product details for ID {product_id}. Service unavailable or product not found.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            except Exception as e:
                logger.error(f"Unexpected error processing cart item: {e}", exc_info=True)
                return Response(
                    {'error': f'An unexpected error occurred while processing product {product_id}.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        # 2. Create the Order in payments-service
        try:
            order = Order.objects.create(
                placed_by_id=request.user.id, # Using the ID from the authenticated user
                complete=False,
                transaction_id=str(uuid.uuid4()), # Initial internal transaction ID
                status='Pending', # Initial status
                name=user_details.get('name', ''),
                email=user_details.get('email', ''),
                phone=user_details.get('phone', ''),
                address=shipping_address.get('address', ''),
                city=shipping_address.get('city', ''),
                postal_code=shipping_address.get('postal_code', ''),
                total_amount=total_amount # Store the calculated total
            )

            # 3. Create OrderItems for the newly created Order
            for item_data in processed_cart_items:
                OrderItem.objects.create(
                    order=order,
                    product_id=item_data['product_id'],
                    product_name=item_data['product_name'],
                    product_price=item_data['product_price'],
                    quantity=item_data['quantity']
                )

            # 4. Decrement quantities in product-service (critical step)
            # This should ideally be part of a distributed transaction or a saga pattern.
            # For simplicity, we'll do it synchronously here. If this fails, you'd need
            # to implement compensation logic (e.g., mark order as 'Failed' and restock).
            for item_data in processed_cart_items:
                product_id = item_data['product_id']
                quantity_to_decrement = item_data['quantity']
                try:
                    decrement_response = requests.post(
                        f"{PRODUCT_SERVICE_BASE_URL}{product_id}/decrement_quantity/",
                        json={'quantity': quantity_to_decrement}
                    )
                    decrement_response.raise_for_status()
                    logger.info(f"Decremented product {product_id} by {quantity_to_decrement}")
                except requests.exceptions.RequestException as e:
                    logger.error(f"Failed to decrement quantity for product {product_id}: {e}")
                    # CRITICAL: Handle compensation here. E.g., change order status to 'StockError',
                    # or initiate a full rollback. For now, we'll mark order as failed.
                    order.status = 'Stock_Decrement_Failed'
                    order.save()
                    return Response(
                        {'error': f'Failed to reserve stock for product {product_id}. Order cancelled.'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

            # 5. Create an initial Payment record (status pending)
            # This links the payment attempt to the order
            payment = Payment.objects.create(
                user_id=request.user.id,
                order=order,
                amount=total_amount,
                status='pending',
                transaction_id=str(uuid.uuid4()) # Unique ID for this payment attempt
            )
            # Link this payment's transaction_id to the Order's transaction_id field
            order.transaction_id = payment.transaction_id
            order.save()


            serializer = MyOrderSerializer(order) # Serialize the created order
            response_data = serializer.data
            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f'Error during order creation or stock update: {e}', exc_info=True)
            # Important: If an error occurs after order creation but before stock decrement,
            # you might need to clean up the created order and its items.
            # A robust solution would use a distributed transaction (Saga pattern).
            if 'order' in locals() and order.pk: # Check if order was created before error
                order.delete() # Simple rollback for now. In real-world, mark as 'Failed' and use compensation.
            return Response({'error': 'Failed to process checkout. ' + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
class STKPushAPIView(APIView):
    
    permission_classes = [AllowAny]
    
    
    @staticmethod
    def get_access_token():
        consumer_key = os.getenv("MPESA_CONSUMER_KEY")
        consumer_secret = os.getenv("MPESA_CONSUMER_SECRET")

        if not consumer_key or not consumer_secret:
            raise Exception("M-Pesa consumer key or secret not found in environment variables")

        url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        try:
            encoded_credentials = base64.b64encode(f"{consumer_key}:{consumer_secret}".encode()).decode()
            headers = {
                "Authorization": f"Basic {encoded_credentials}",
                "Content-Type": "application/json"
            }
            response = requests.get(url, headers=headers).json()
            print(response) 
            if "access_token" in response:
                return response["access_token"]
            else:
                raise Exception("Failed to get M-Pesa access token: " + response.get("error_description", "Unknown error"))
        except Exception as e:
            raise Exception("Failed to get M-Pesa access token: " + str(e))

    def post(self, request):
        try:
            user_id = request.data.get('user_id')
            print('User...', user_id)
            phone = request.data.get('phone_number')
            
            if not user_id:
                return Response({'error': 'invalid user'}, status=status.HTTP_400_BAD_REQUEST)
            
            NGROK_BASE_URL = "https://fbb4-102-219-210-106.ngrok-free.app"
            access_token = self.get_access_token()
            headers = {"Authorization": f"Bearer {access_token}"}
            timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            business_short_code = os.getenv("MPESA_BUSINESS_SHORT_CODE")
            pass_key = os.getenv("MPESA_PASS_KEY")

            if not business_short_code or not pass_key:
                raise Exception("M-Pesa business short code or pass key not found in environment variables")

            phone_number = request.data.get('phone_number')
            amount = request.data.get('amount')

            if not phone_number or not amount:
                return Response({'error': 'Phone number and amount are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            web_name = "M-FARM"
            stk_password = base64.b64encode((business_short_code + pass_key + timestamp).encode('utf-8')).decode('utf-8')

            print("stk coming....", request.data)
            payload = {
                "BusinessShortCode": business_short_code,
                "Password": stk_password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": amount,
                "PartyA": phone_number,
                "PartyB": business_short_code,
                "PhoneNumber": phone_number,
                "CallBackURL": f"{NGROK_BASE_URL}/payments/api/v1/mpesa/callback/",
                "AccountReference": web_name,
                "TransactionDesc": "Payment of a product",
            }

            response = requests.post(
                "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
                headers=headers,
                json=payload,
            )

            # Assign to response_json for consistent access
            response_json = response.json()
            print(f"M-Pesa STK Push API response: {response_json}")

            if response.status_code == 200:
                if response_json.get('ResponseCode') == '0':
                    payment = Payment(
                        user_id=user_id,
                        amount=amount,
                        status='pending',
                        transaction_id=response_json.get('CheckoutRequestID', str(uuid.uuid4()))
                    )
                    payment.save()
                    return Response(response_json)
                else:
                    return Response({'error': response_json.get('ResponseDescription', 'M-Pesa API error'), 'details': response_json}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'error': 'Failed to initiate STK Push with M-Pesa API', 'details': response_json}, status=response.status_code)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format in request body'}, status=400)
        except requests.exceptions.RequestException as e:
            print(f"Network error during M-Pesa STK push: {e}")
            return JsonResponse({'error': f'Network error communicating with M-Pesa: {e}'}, status=500)
        except Exception as e:
            print(f"Unhandled error in stkpush: {e}")
            return JsonResponse({'error': f'Internal server error: {e}'}, status=500)


class MpesaCallbackView(APIView):
  
    def dispatch(self, request, *args, **kwargs):
        return csrf_exempt(super().dispatch)(request, *args, **kwargs)

    def post(self, request):
        try:
            
            data = request.data 
            logger.info(f"Received M-Pesa callback: {json.dumps(data, indent=2)}")

            stk_callback = data.get('Body', {}).get('stkCallback', {})
            result_code = stk_callback.get('ResultCode')
            checkout_request_id = stk_callback.get('CheckoutRequestID') 
            result_desc = stk_callback.get('ResultDesc')

            # try to find the pending Payment record using the checkout_request_id
            try:
                payment = Payment.objects.get(transaction_id=checkout_request_id, status='pending')
            except Payment.DoesNotExist:
                logger.error(f"No pending payment found for CheckoutRequestID: {checkout_request_id}")
                return JsonResponse({"ResponseCode": "00000000", "ResponseDesc": "Callback received but payment not found or already processed"}), 200

           ## #Idempotency check:##### Ensure the payment hasn't been completed already/ Avoid duplicate transactions
            if payment.status != 'pending':
                logger.warning(f"Duplicate callback for CheckoutRequestID: {checkout_request_id}. Status: {payment.status}")
                return JsonResponse({"ResponseCode": "00000000", "ResponseDesc": "Callback already processed"}), 200

            if result_code == 0:
                # handling successful transaction
                metadata_items = stk_callback.get('CallbackMetadata', {}).get('Item', [])

                mpesa_amount = next((item['Value'] for item in metadata_items if item['Name'] == 'Amount'), None)
                mpesa_receipt_number = next((item['Value'] for item in metadata_items if item['Name'] == 'MpesaReceiptNumber'), None)
                transaction_date_str = next((item['Value'] for item in metadata_items if item['Name'] == 'TransactionDate'), None)
                mpesa_phone_number = next((item['Value'] for item in metadata_items if item['Name'] == 'PhoneNumber'), None)

                # update Payment record to the db
                payment.status = 'completed'
                payment.mpesa_receipt_number = mpesa_receipt_number
                payment.completed_at = timezone.now() 
                payment.amount = mpesa_amount 
                payment.save()
                logger.info(f"Payment {payment.id} for CheckoutRequestID {checkout_request_id} updated to 'completed'. M-Pesa Receipt: {mpesa_receipt_number}")

                # update associated Order record
                if payment.order:
                    payment.order.status = 'Paid' 
                    payment.order.complete = True
                    payment.order.save()
                    logger.info(f"Order {payment.order.id} for CheckoutRequestID {checkout_request_id} updated to 'Paid'.")
                else:
                    logger.warning(f"Payment {payment.id} has no associated order.")

                # --- Additional Business Logic for SUCCESSFUL PAYMENT ---
                # This is where you might trigger events for other services, e.g.:
                # - Send an event to user-service: "UserPaymentCompleted"
                # - Send an event to a notification-service: "SendOrderConfirmationEmail"
                # - Send an event to a logistics-service: "StartShippingProcess"

                # If the EmailMultiAlternatives is part of this service, you could
                # trigger it here, but ideally, email sending would be another service.
                # Example: send_order_confirmation_email(payment.order)

            else:
                # handle failed or cancelled transaction
                payment.status = 'failed' if result_code not in [1032] else 'cancelled' 
                payment.failure_reason = result_desc
                payment.completed_at = timezone.now() 
                payment.save()
                logger.warning(f"Payment {payment.id} for CheckoutRequestID {checkout_request_id} failed. ResultCode: {result_code}, Desc: {result_desc}")

                # update associated Order record
                if payment.order:
                   
                    payment.order.status = 'Payment Failed'
                    payment.order.save()
                    logger.info(f"Order {payment.order.id} for CheckoutRequestID {checkout_request_id} updated to 'Payment Failed'.")

                # --- Additional Business Logic for FAILED PAYMENT ---
                # - Notify user about payment failure
                # - Mark product quantities as available again if they were only reserved (more complex)
                # - Send an event to user-service: "UserPaymentFailed"

            #return a 200 OK to M-Pesa to acknowledge receipt
            return JsonResponse({"ResponseCode": "00000000", "ResponseDesc": "Callback received successfully"}), 200

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in M-Pesa callback: {e}", exc_info=True)
            return JsonResponse({"ResponseCode": "99999999", "ResponseDesc": "Invalid JSON payload"}, status=400)
        except Exception as e:
            logger.error(f"Error handling M-Pesa callback: {e}", exc_info=True)
            return JsonResponse({"ResponseCode": "99999999", "ResponseDesc": "Internal Server Error"}), 500
