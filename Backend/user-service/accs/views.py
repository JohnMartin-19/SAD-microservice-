from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login
from django.urls import reverse_lazy
from .serializers import *
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
import redis
import os


# user-service/accs/views.py
import redis
import os
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from rest_framework.response import Response
import logging
from datetime import datetime, timedelta
from django.conf import settings

logger = logging.getLogger(__name__)

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code != status.HTTP_200_OK:
            return response

        access_token = response.data['access']
        user = request.user

        # Calculate expiration time
        access_token_lifetime = settings.SIMPLE_JWT.get('ACCESS_TOKEN_LIFETIME', timedelta(minutes=60))
        expires = datetime.utcnow() + access_token_lifetime

        # Connect to Redis
        redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            decode_responses=True
        )

        # Store token metadata
        token_key = f"token:{access_token}"
        redis_client.hset(token_key, mapping={
            'user_id': str(user.id),
            'username': user.username,
            'expires': str(int(expires.timestamp()))
        })
        redis_client.expire(token_key, int(access_token_lifetime.total_seconds()))

        logger.info(f"Stored token {access_token} for user {user.username} in Redis")
        return response
class RegisterAPIView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        print('Incoming new user',serializer)
        if serializer.is_valid():
            user = serializer.save()
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    'message': 'User registered successfully',
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh),
                    },
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

# class LoginAPIView(APIView):
#     def get(self, request):
#         return Response({
#             'message': 'Use POST to login with username and password.',
#             'fields': ['username', 'password'],
#         })

#     def post(self, request):
#         username = request.data.get('username')
#         password = request.data.get('password')
#         user = authenticate(request, username=username, password=password)
#         if user is not None:
#             login(request, user)
#             token, created = Token.objects.get_or_create(user=user)
#             return Response({
#                 'status': 'success',
#                 'message': 'Login successful!',
#                 'token': token.key,
#                 'user': UserSerializer(user).data,
#             }, status=status.HTTP_200_OK)
#         else:
#             return Response({
#                 'status': 'error',
#                 'message': 'Invalid username or password.',
#             }, status=status.HTTP_400_BAD_REQUEST)
class LogoutAPIView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class UserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve the logged-in user's profile.
        """
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Create a new user (optional, typically handled by registration).
        """
        serializer = UserProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        """
        Update the logged-in user's profile.
        """
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """
        Delete the logged-in user's account.
        """
        user = request.user
        user.delete()
        return Response({'message': 'User account deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    

class UserDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = CustomUser.objects.get(id=user_id)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)