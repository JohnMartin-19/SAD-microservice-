from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,viewsets
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
        # serializer handles validation and authentication
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            logger.error(f"Token validation failed: {e}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

       
        authenticated_user = serializer.user

        # # --- Debugging authenticated_user ---
        # logger.info(f"--- Debugging Authenticated User in CustomTokenObtainPairView ---")
        # logger.info(f"Authenticated user object: {authenticated_user}")
        # logger.info(f"Is user authenticated? {authenticated_user.is_authenticated}")
        # logger.info(f"User ID from authenticated_user: '{getattr(authenticated_user, 'id', 'N/A')}'")
        # logger.info(f"User username from authenticated_user: '{getattr(authenticated_user, 'username', 'N/A')}'")
        # logger.info(f"User PK from authenticated_user: '{getattr(authenticated_user, 'pk', 'N/A')}'")
        # # --- End Debugging ---


        if not authenticated_user or not authenticated_user.is_authenticated:
            logger.error("Authenticated user object is invalid or not authenticated after serializer validation.")
            return Response({'error': 'Authentication failed unexpectedly'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        access_token_data = serializer.validated_data['access']
        refresh_token_data = serializer.validated_data['refresh']

        # calc expiration time
        access_token_lifetime = settings.SIMPLE_JWT.get('ACCESS_TOKEN_LIFETIME', timedelta(minutes=60))
        expires_at_utc = datetime.utcnow() + access_token_lifetime # JWT exp is typically UTC timestamp

        # konnect to Redis
        redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            decode_responses=True
        )

        token_key = f"token:{access_token_data}" 
        redis_client.hset(token_key, mapping={
            'user_id': str(authenticated_user.id),
            'username': authenticated_user.username,
            'expires': str(int(expires_at_utc.timestamp()))  
        })
        redis_client.expire(token_key, int(access_token_lifetime.total_seconds()))

        logger.info(f"Stored token {access_token_data} for user {authenticated_user.username} (ID: {authenticated_user.id}) in Redis")

        return Response({
            'access': access_token_data,
            'refresh': refresh_token_data
        }, status=status.HTTP_200_OK)

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
        
        
class ConsultantViewSet(viewsets.ModelViewSet):
    """_
    API VIEW for booking consultation
    """
    queryset = Consultant.objects.all()
    serializer_class = ConsultantSerializer
    permission_classes = [IsAuthenticated]
    
    def book_consultation(self,request,pk=None):
        consultant = self.get_object()
        serializer = BookConsultantSerializer(data = request.data)
        
        if serializer.is_valid():
            booking_date = serializer.validated_data['booking_date']
            
            if consultant.booked_date == booking_date:
                return Response(
                    {
                        "detail":'This consultant has already been booked for the selected date.Please choose another consultant or date'
                    },status=status.HTTP_400_BAD_REQUEST
                )
                
            return Response (self.get_serializer(consultant).data,status=status.HTTP_200_OK)
        return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)