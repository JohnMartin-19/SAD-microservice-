from rest_framework import serializers
from .models import *
from accounts.models import CustomUser

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['name','price','description','quantity','image']
        read_only_fields = ['user']  #this prevents creating/setting user via API

    def create(self, validated_data):
        # Automatically set the user to the authenticated user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)