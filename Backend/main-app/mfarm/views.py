from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
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
# Create your views here.

#API ENDPOINTS FOR PRODUCT

class ProductListCreateView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]  # Allow unauthenticated GET, authenticated POST

    def get(self, request):
        """
        List all products.
        """
        queryset = Product.objects.all()
        serializer = ProductSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Create a new product.
        """
        serializer = ProductSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            product = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductRetrieveUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]  # allow unauthenticated users GET, authenticated PUT/DELETE

    def get(self, request, pk):
        """
        Retrieve a single product by ID.
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
        Update a product by ID.
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

class LoggedInUserProductListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        products = Product.objects.filter(user=request.user)
        serializer = MyProductSerializer(products, many=True)
        return Response(serializer.data)

class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(product__user=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

class RevenueView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        revenue = {
            'day': 0,
            'week': 0,
            'month': 0,
            'year': 0,
        }

        # Daily revenue
        day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        day_revenue = Order.objects.filter(
            product__user=request.user,
            created_at__gte=day_start,
            status='Delivered'
        ).aggregate(total=Sum('product__price' * 'quantity'))['total'] or 0
        revenue['day'] = float(day_revenue)

        # Weekly revenue
        week_start = now - timedelta(days=now.weekday())
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        week_revenue = Order.objects.filter(
            product__user=request.user,
            created_at__gte=week_start,
            status='Delivered'
        ).aggregate(total=Sum('product__price' * 'quantity'))['total'] or 0
        revenue['week'] = float(week_revenue)

        # Monthly revenue
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_revenue = Order.objects.filter(
            product__user=request.user,
            created_at__gte=month_start,
            status='Delivered'
        ).aggregate(total=Sum('product__price' * 'quantity'))['total'] or 0
        revenue['month'] = float(month_revenue)

        # Yearly revenue
        year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        year_revenue = Order.objects.filter(
            product__user=request.user,
            created_at__gte=year_start,
            status='Delivered'
        ).aggregate(total=Sum('product__price' * 'quantity'))['total'] or 0
        revenue['year'] = float(year_revenue)

        serializer = RevenueSerializer(revenue)
        return Response(serializer.data)

########################### AI CHAT VIEW ############################
@csrf_exempt
def ai_chat(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        prompt = data.get('prompt', '')
        try:
            # Example: Proxy to OpenAI (replace with xAI if available)
            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {os.getenv("OPENAI_API_KEY")}',
                    'Content-Type': 'application/json',
                },
                json={
                    'model': 'gpt-3.5-turbo',
                    'messages': [
                        {'role': 'system', 'content': 'You are an agricultural expert.'},
                        {'role': 'user', 'content': prompt},
                    ],
                    'max_tokens': 150,
                }
            )
            response.raise_for_status()
            return JsonResponse(response.json())
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request'}, status=400)