from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login
from django.urls import reverse_lazy
from .serializers import UserSerializer, RegisterSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class RegisterAPIView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
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
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'status': 'error',
                'message': 'Invalid username or password.',
            }, status=status.HTTP_400_BAD_REQUEST)
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