from django.conf import settings
import uuid
import datetime
import base64
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
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
########################################## PAYMENTS APIS ###########################################
#### MPESA STK
class STKPushAPIView(APIView):
    ############GENERATES AND RETURNS ACCESS TOKEN
    def get(self,request):
        consumer_key = settings.MPESA_CONSUMER_KEY
        consumer_secret = settings.MPESA_CONSUMER_SECRET


        # check that the credentials are provided
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
                raise Exception("Failed to get access token: " + response.get("error_description", "Unknown error"))
        except Exception as e:
            raise Exception("Failed to get access token: " + str(e))

    ######INITIATES THE STK PUSH TO BE SENT ############
    def post(self,request):
        """
        STK push endpoint.
        """
        try:
            user_id = request.data.get('user_id')
            user_response = requests.get(f'http://user-service:8000/api/users/{user_id}/', headers={
                'Authorization': request.headers.get('Authorization')
            })
            if user_response.status_code != 200:
                return Response({'error': 'Invalid user'}, status=status.HTTP_400_BAD_REQUEST)
            
            access_token = self.get()
            headers = {"Authorization": f"Bearer {access_token}"}
            timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            business_short_code = settings.MPESA_BUSINESS_SHORT_CODE
            pass_key = settings.MPESA_PASS_KEY

            # Validate that the credentials are provided
            if not business_short_code or not pass_key:
                raise Exception("M-Pesa business short code or pass key not found in environment variables")

            data = json.loads(request.body)
            phone_number = data.get('phone_number')
            amount = data.get('amount')
            web_name = "M-FARM"
            stk_password = base64.b64encode((business_short_code + pass_key + timestamp).encode('utf-8')).decode('utf-8')

            print("stk coming....",data)
            payload = {
                "BusinessShortCode": business_short_code,
                "Password": stk_password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": amount,
                "PartyA": phone_number,
                "PartyB": business_short_code,
                "PhoneNumber": phone_number,
                "CallBackURL": "https://da8e-102-210-40-50.ngrok-free.app/callback/",
                "AccountReference": web_name,
                "TransactionDesc": "Payment of a product",
            }

            response = requests.post(
                "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
                headers=headers,
                json=payload,
            )

            data =  response.json()
            if response.status_code == 200:
                payment = Payment(
                user_id=user_id,
                amount=request.data.get('amount'),
                status='pending',
                transaction_id=str(uuid.uuid4())
            )
            payment.save()
            return Response(response.json())
            

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except requests.exceptions.RequestException as e:
            return JsonResponse({'error': f'Request error: {e}'}, status=500)
        except Exception as e:
            print(f"Error in stkpush: {e}")
            return JsonResponse({'error': 'Internal server error'}, status=500)

    @csrf_exempt
    def mpesa_callback(request):
        if request.method == 'POST':
            try:
                callback_data = json.loads(request.body)
                print("M-Pesa callback received:", callback_data)

                result_code = callback_data.get("Body", {}).get("stkCallback", {}).get("ResultCode")
                result_desc = callback_data.get("Body", {}).get("stkCallback", {}).get("ResultDesc")

                if result_code == 0:
                    print("Payment successful: ", result_desc)
                    return JsonResponse({"ResultCode": 0, "ResultDesc": "Success"})
                else:
                    print(f"Payment failed: {result_desc}")
                    return JsonResponse({"ResultCode": 1, "ResultDesc": "Payment failed"})

            except Exception as e:
                print(f"Error processing M-Pesa callback: {e}")
                return JsonResponse({"ResultCode": 1, "ResultDesc": "Error"})
        else:
            return JsonResponse({"ResultCode": 1, "ResultDesc": "Invalid request method"})