from rest_framework import serializers
from .models import *


class OrderItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value =1)
    
    
class MyOrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    
    class Meta:
        model = Orderfields = [
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