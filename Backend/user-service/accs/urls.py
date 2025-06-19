from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView, 
)

urlpatterns = [
    path('api/v1/users/<str:user_id>/', UserDetailAPIView.as_view(), name='user-detail'),
    path('api/v1/register/', RegisterAPIView.as_view(), name='api_register'),
    #path('accounts/api/v1/login/', LoginAPIView.as_view(), name='api_login'),
    path('api/v1/logout/', LogoutAPIView.as_view(), name='api_logout'),
    path('api/v1/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/profile/', UserProfileAPIView.as_view(), name='user_profile'),
    path('api/v1/consultants/',ConsultantViewSet.as_view({'get':'list', 'post':'create'}), name='consultation'),
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Swagger UI
    path('api/v1/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # ReDoc (optional)
    path('api/v1/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    # ...
]