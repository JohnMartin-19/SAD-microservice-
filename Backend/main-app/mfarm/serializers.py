from rest_framework import serializers
from .models import *
from datetime import datetime
import requests
import jwt
from django.conf import settings

# #pupose for the user serializer is to return a nested response.
# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = CustomUser
#         fields = ['username', 'email']

class ProductSerializer(serializers.ModelSerializer):
    
    seller = serializers.CharField(source='user_username', read_only=True)
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'quantity', 'product_location', 'image',"seller",]
        

    # def create(self, validated_data):
    #     user_id = self.context['request'].user.id
    #     user_username = self.context['request'].user.username
    #     request = self.context.get('request')
    #     if request and hasattr(request, 'user') and request.user.is_authenticated:
    #         validated_data['user'] = request.user.id  # Set user to user ID
    #     else:
    #         raise serializers.ValidationError("Authenticated user is required.")
    #     return super().create(validated_data)
class MyProductSerializer(serializers.ModelSerializer):
    
    seller = serializers.CharField(source='user_username', read_only=True)
    class Meta:
        model = Product
        fields = ['name', 'price','description', 'quantity', 'product_location', 'image','seller']
     

    def create(self, validated_data):
        # Automatically set user_username from the authenticated user
        validated_data['user_username'] = self.context['request'].user.username
        return super().create(validated_data)

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
  
    cart = ProductOrderSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = [
            'id','product', 'date_ordered', 'complete', 'transaction_id', 'quantity', 'status',
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