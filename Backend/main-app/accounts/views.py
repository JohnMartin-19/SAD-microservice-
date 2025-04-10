from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login
from django.urls import reverse_lazy
from .serializers import UserSerializer, RegisterSerializer

class RegisterAPIView(APIView):
    def get(self, request):
        return Response({
            'message': 'Use POST to register a new user.',
            'fields': ['username', 'email', 'password'],
        })

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'status': 'success',
                'message': 'Registration successful! You are now logged in.',
                'token': token.key,
                'user': UserSerializer(user).data,
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'status': 'error',
                'message': 'Please correct the errors below.',
                'errors': serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)

class LoginAPIView(APIView):
    def get(self, request):
        return Response({
            'message': 'Use POST to login with username and password.',
            'fields': ['username', 'password'],
        })

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'status': 'success',
                'message': 'Login successful!',
                'token': token.key,
                'user': UserSerializer(user).data,
                'redirect_url': str(reverse_lazy('landing')),
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'status': 'error',
                'message': 'Invalid username or password.',
            }, status=status.HTTP_400_BAD_REQUEST)

class LogoutAPIView(APIView):
    def get(self, request):
        return Response({
            'message': 'Use POST to logout the current user.',
        })

    def post(self, request):
        if request.user.is_authenticated:
            Token.objects.filter(user=request.user).delete()
            return Response({
                'status': 'success',
                'message': 'Logged out successfully.',
                'redirect_url': str(reverse_lazy('landing')),
            }, status=status.HTTP_200_OK)
        return Response({
            'status': 'error',
            'message': 'No user is logged in.',
        }, status=status.HTTP_400_BAD_REQUEST)