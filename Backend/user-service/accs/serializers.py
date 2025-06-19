from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email','password')  # Add more fields if needed

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model=CustomUser
        fields = ('username','email','password',)


    def create(self, validated_data):
        user = CustomUser(
            username=validated_data['username'],
            email=validated_data.get('email', '')
        )
        user.set_password(validated_data['password'])
        user.is_active = True
        user.save()
        return user
    

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'phone', 'bio', 'location', 'photo']
        read_only_fields = ['id', 'username']  # block changing username
        
class ConsultantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultant
        fields = ['id','name','specialty','booked_date','cost']
        read_only_fields = ['id','booked_date']
        
class BookConsultantSerializer(serializers.Serializer):
    booking_date = serializers.DateField(required=True)