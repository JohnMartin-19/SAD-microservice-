from rest_framework import serializers
from .models import *


class CartItemInputSerializer(serializers.Serializer): # This describes a single item in the cart array
    product_id = serializers.IntegerField(help_text="ID of the product from product-service.")
    quantity = serializers.IntegerField(min_value=1, help_text="Quantity of the product.")

class UserDetailsInputSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=False)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(max_length=20, required=False)

class ShippingAddressInputSerializer(serializers.Serializer):
    address = serializers.CharField(max_length=255, required=False)
    city = serializers.CharField(max_length=100, required=False)
    postal_code = serializers.CharField(max_length=20, required=False)

class CheckoutRequestSerializer(serializers.Serializer): # This describes the entire request body for CheckoutView.post
    cart = CartItemInputSerializer(many=True, help_text="List of products in the cart with their quantities.")
    payment_method = serializers.CharField(max_length=100, help_text="e.g., 'M-Pesa STK Push', 'Card'.")
    user_details = UserDetailsInputSerializer(help_text="Details of the user making the order.")
    shipping_address = ShippingAddressInputSerializer(help_text="Shipping address for the order.")

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product_id','product_name','product_price','quantity']
    
    
class MyOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model =Order
        fields = [
            'id','placed_by_id','complete', 'transaction_id', 'status',
            'created_at', 'updated_at', 'name', 'email', 'phone', 'address',
            'city', 'postal_code', 'total_amount', 'items'
        ]
        
        
        def get_items(self,obj):
            return OrderItemSerializer(obj.items.all(), many=True).data
    
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'user_id', 'amount', 'status', 'transaction_id', 'created_at']
        
class TransactionSerializer(serializers.ModelSerializer):
    user_id = serializers.StringRelatedField()
    order_id = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all())

    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['id', 'user_id', 'order_id', 'timestamp', 'payment_method']

class CartItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)