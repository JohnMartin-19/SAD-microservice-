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
        fields = ['name',"user",'price','description','quantity',"product_location",'image']
        read_only_fields = ['user']  #this prevents creating/setting user via API

    def create(self, validated_data):
        # Automatically set the user to the authenticated user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)