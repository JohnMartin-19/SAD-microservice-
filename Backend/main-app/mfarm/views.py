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


class ProductDecrementQuantityView(APIView):
    def post(self,request,pk):
        try:
            product = Product.objects.get(pk=pk)
            quantity_to_decrease = request.data.get('quantity')
            
            if not isinstance(quantity_to_decrease,int) or quantity_to_decrease <= 0:
                return Response({'erro':'Invalid quanity provided'}, status=status.HTTP_400_BAD_REQUEST)
            if product.quantity < quantity_to_decrease:
                return Response({'error':'Insufficient stock'}, status=status.HTTP_400_BAD_REQUEST)
            
            product.quantity -= quantity_to_decrease
            product.save()
            
            return  Response({'message':'Quantity decresed successfully','new_quantity': product.quantity},status=status.http_200_OK)
        except Product.DoesNotExist:
            return Response({"error":'Product Not Found'},status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error':str(e)},status=status.HTTP_500_SERVER_ERROR)
                
                