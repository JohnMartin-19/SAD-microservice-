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
import uuid
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

#logged in user API(product related)
class LoggedInUserProductListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        products = Product.objects.filter(user=request.user)
        serializer = MyProductSerializer(products, many=True)
        return Response(serializer.data)

class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(productorder__product__user=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

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

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            if not request.user.is_authenticated:
                return Response(
                    {'error': 'User not authenticated'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            cart = request.data.get('cart', [])
            print('cart data to be sent', cart)
            payment_method = request.data.get('payment_method', '')
            print('Payment', payment_method)
            user_details = request.data.get('user_details', {})
            print('Usr details', user_details)
            shipping_address = request.data.get('shipping_address', {})
            print('Shipping', shipping_address)

            if not cart:
                return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

            # Validate cart items
            validated_cart = []
            for item in cart:
                serializer = CartItemSerializer(data=item)
                if not serializer.is_valid():
                    print('CartItemSerializer errors:', serializer.errors)
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                validated_cart.append(serializer.validated_data)
                print(f"Item quantity type: {type(item['quantity'])}, validated: {type(serializer.validated_data['quantity'])}")

            # Create Order
            order_data = {
                'placed_by_id': request.user.id,
                'complete': False,
                'transaction_id': str(uuid.uuid4()),
                'status': 'Pending',
                'quantity': sum(item['quantity'] for item in validated_cart),
                'name': user_details.get('name', ''),
                'email': user_details.get('email', ''),
                'phone': user_details.get('phone', ''),
                'address': shipping_address.get('address', ''),
                'city': shipping_address.get('city', ''),
                'postal_code': shipping_address.get('postal_code', ''),
                'cart': validated_cart,
            }
            serializer = OrderSerializer(data=order_data)
            if serializer.is_valid():
                order = serializer.save()
                print('Order created:', order.id)

                # Update product quantities
                for item in validated_cart:
                    product = Product.objects.get(id=item['product_id'])
                    print(f"Product quantity: {product.quantity} (type: {type(product.quantity)}), Requested: {item['quantity']} (type: {type(item['quantity'])})")
                    if product.quantity < item['quantity']:
                        order.delete()
                        return Response(
                            {'error': f'Only {product.quantity} of {product.name} available'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    product.quantity -= item['quantity']
                    product.save()

                # Create Transaction
                Transaction.objects.create(
                    user_id=request.user,
                    order_id=order,
                    payment_method=payment_method
                )
                print('Transaction created for order:', order.id)

                return Response(serializer.data, status=status.HTTP_201_CREATED)
            print('OrderSerializer errors:', serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Product.DoesNotExist:
            return Response({'error': 'One or more products not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print('Unexpected error:', str(e))
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)