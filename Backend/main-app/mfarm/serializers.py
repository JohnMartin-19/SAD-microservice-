from rest_framework import serializers
from .models import *
from accounts.models import CustomUser

#pupose for the user serializer is to return a nested response.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email']
class ProductSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Product
        fields = ["id",'name',"user",'price','description','quantity',"product_location",'image']
        read_only_fields = ['user']  #this prevents creating/setting user via API

    def create(self, validated_data):
        # Automatically set the user to the authenticated user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class MyProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['name','price','description','quantity',"product_location",'image']
        read_only_fields = ['user'] 

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

    class Meta:
        model = ProductOrder
        fields = ['product', 'product_id', 'quantity']

class OrderSerializer(serializers.ModelSerializer):
    productorder = ProductOrderSerializer(many=True, read_only=True)
    placed_by = serializers.StringRelatedField()

    class Meta:
        model = Order
        fields = ['id', 'placed_by', 'date_ordered', 'complete', 'transaction_id', 'quantity', 'status', 'productorder']

class TransactionSerializer(serializers.ModelSerializer):
    user_id = serializers.StringRelatedField()
    order_id = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all())

    class Meta:
        model = Transaction
        fields = ['id', 'user_id', 'order_id', 'timestamp', 'payment_method']

class CartItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)