from django.conf import settings
import uuid
import datetime
import base64
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Payment  
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


load_dotenv()

########################################## PAYMENTS APIS ###########################################
#### MPESA STK
class STKPushAPIView(APIView):
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
            print(response) # Log M-Pesa token response
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
                "CallBackURL": "https://da8e-102-210-40-50.ngrok-free.app/callback/", # Ensure this ngrok URL is active
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

    @csrf_exempt
    def mpesa_callback(self,request):
        try:
            data = request.get_json()
            logging.info(f"Received M-Pesa callback: {json.dumps(data, indent=2)}")

            # Extract relevant data
            stk_callback = data.get('Body', {}).get('stkCallback', {})
            result_code = stk_callback.get('ResultCode')
            checkout_request_id = stk_callback.get('CheckoutRequestID')
            result_desc = stk_callback.get('ResultDesc')

            if result_code == 0:
                #successful transaction
                metadata_items = stk_callback.get('CallbackMetadata', {}).get('Item', [])
                
                amount = next((item['Value'] for item in metadata_items if item['Name'] == 'Amount'), None)
                mpesa_receipt_number = next((item['Value'] for item in metadata_items if item['Name'] == 'MpesaReceiptNumber'), None)
                transaction_date = next((item['Value'] for item in metadata_items if item['Name'] == 'TransactionDate'), None)
                phone_number = next((item['Value'] for item in metadata_items if item['Name'] == 'PhoneNumber'), None)

                # --- YOUR BUSINESS LOGIC FOR SUCCESSFUL PAYMENT ---
                # 1. Update your database: Mark transaction as successful, save receipt, amount, etc.
                #    Example (conceptual):
                #    transaction = find_transaction_by_checkout_id(checkout_request_id)
                #    if transaction and not transaction.is_completed: # Implement idempotency check
                #        transaction.status = 'SUCCESS'
                #        transaction.mpesa_receipt = mpesa_receipt_number
                #        transaction.amount_paid = amount
                #        transaction.completed_at = parse_mpesa_date(transaction_date)
                #        transaction.save()
                #        logging.info(f"Transaction {checkout_request_id} successfully processed. Receipt: {mpesa_receipt_number}")
                #        # 2. Notify user, fulfill order, etc.
                #    else:
                #        logging.warning(f"Duplicate or unhandled success callback for {checkout_request_id}")


            else:
                # Failed or cancelled transaction
                logging.warning(f"Transaction {checkout_request_id} failed. ResultCode: {result_code}, Desc: {result_desc}")
                # --- YOUR BUSINESS LOGIC FOR FAILED PAYMENT ---
                # 1. Update your database: Mark transaction as failed/cancelled
                #    Example (conceptual):
                #    transaction = find_transaction_by_checkout_id(checkout_request_id)
                #    if transaction:
                #        transaction.status = 'FAILED'
                #        transaction.failure_reason = result_desc
                #        transaction.save()
                # 2. Notify user about failure

            # Always return a 200 OK to M-Pesa to acknowledge receipt
            return jsonify({"ResponseCode": "00000000", "ResponseDesc": "Callback received successfully"}), 200

        except Exception as e:
            logging.error(f"Error handling M-Pesa callback: {e}", exc_info=True)
            # Return a non-200 status if there's a critical error to signal M-Pesa to retry
            return jsonify({"ResponseCode": "99999999", "ResponseDesc": "Internal Server Error"}), 500
