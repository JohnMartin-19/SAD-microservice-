from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('api/v1/register/', RegisterAPIView.as_view(), name='api_register'),
    #path('accounts/api/v1/login/', LoginAPIView.as_view(), name='api_login'),
    path('api/v1/logout/', LogoutAPIView.as_view(), name='api_logout'),
    path('api/v1/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/profile/', UserProfileAPIView.as_view(), name='user_profile'),
    # ...
]