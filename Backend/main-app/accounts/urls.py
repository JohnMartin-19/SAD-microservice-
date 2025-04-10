from django.urls import path
from .views import RegisterAPIView, LoginAPIView, LogoutAPIView

urlpatterns = [
    path('accounts/api/v1/register/', RegisterAPIView.as_view(), name='api_register'),
    path('accounts/api/v1/login/', LoginAPIView.as_view(), name='api_login'),
    path('accounts/api/v1/logout/', LogoutAPIView.as_view(), name='api_logout'),
]