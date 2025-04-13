from django.urls import path
from .views import RegisterAPIView, LoginAPIView, LogoutAPIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('accounts/api/v1/register/', RegisterAPIView.as_view(), name='api_register'),
    #path('accounts/api/v1/login/', LoginAPIView.as_view(), name='api_login'),
    path('accounts/api/v1/logout/', LogoutAPIView.as_view(), name='api_logout'),
    path('accounts/api/v1/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('accounts/api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # ...
]