from rest_framework import serializers
from .models import *
from datetime import datetime
import requests
import jwt
from django.conf import settings

#pupose for the user serializer is to return a nested response.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email']

class ProductSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'user', 'price', 'description', 'quantity', 'product_location', 'image']
        read_only_fields = ['user']

    def get_user(self, obj):
        try:
            # Check if request exists in context
            if 'request' not in self.context:
                return {'username': 'Error', 'email': 'No request context'}
            
            auth_header = self.context['request'].META.get('HTTP_AUTHORIZATION', '')
            token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else ''
            
            if not token:
                return {'username': 'Error', 'email': 'No token provided'}

            response = requests.get(
                f"http://localhost:8001/accounts/api/v1/users/{obj.user_id}/",
                headers={'Authorization': f"Bearer {token}"}
            )
            if response.status_code == 200:
                return response.json()
            return {'username': 'Unknown', 'email': f"User service error: {response.status_code}"}
        except (requests.RequestException, IndexError):
            return {'username': 'Error', 'email': 'Failed to fetch user'}

    def create(self, validated_data):
        validated_data['user_id'] = self.context['request'].user.id
        return super().create(validated_data)

class MyProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['name', 'price', 'description', 'quantity', 'product_location', 'image']
        read_only_fields = ['user_id']

# class OrderSerializer(serializers.ModelSerializer):
#     product = serializers.CharField(source='product.name')
#     buyer = serializers.CharField(source='placed_by.username')

#     class Meta:
#         model = Order
#         fields = ['id', 'transaction_id', 'placed_by', 'quantity', 'status']

class RevenueSerializer(serializers.Serializer):
    day = serializers.DecimalField(max_digits=10, decimal_places=2)
    week = serializers.DecimalField(max_digits=10, decimal_places=2)
    month = serializers.DecimalField(max_digits=10, decimal_places=2)
    year = serializers.DecimalField(max_digits=10, decimal_places=2)


class ProductOrderSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = ProductOrder
        fields = ['product', 'product_id', 'quantity','product_name']

class MyOrderSerializer(serializers.ModelSerializer):
    productorder = ProductOrderSerializer(many=True, read_only=True)
    placed_by = UserSerializer(read_only=True)
    placed_by_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), source='placed_by', write_only=True
    )
    cart = ProductOrderSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = [
            'id','product','placed_by', 'placed_by_id', 'date_ordered', 'complete', 'transaction_id', 'quantity', 'status',
            'name', 'email', 'phone', 'address', 'city', 'postal_code', 'productorder', 'cart'
        ]
    def create(self, validated_data):
        cart = validated_data.pop('cart')
        order = Order.objects.create(**validated_data)
        for item in cart:
            ProductOrder.objects.create(
                order=order,
                product=item['product'],
                quantity=item['quantity'],
                date_added = datetime.now()
            )
        return order

class TransactionSerializer(serializers.ModelSerializer):
    user_id = serializers.StringRelatedField()
    order_id = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all())

    class Meta:
        model = Transaction
        fields = ['id', 'user_id', 'order_id', 'timestamp', 'payment_method']

class CartItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

class STKPushSerializer(serializers.Serializer):
    phone_number = serializers.IntegerField()