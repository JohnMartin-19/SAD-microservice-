from django.urls import path
from .views import *
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView, 
)


urlpatterns = [
    path('api/v1/checkout/', CheckoutView.as_view(), name='checkout'),
    path('api/v1/mpesa/stk-push/', STKPushAPIView.as_view(), name='STK Push'),
    path('api/v1/mpesa/callback/', MpesaCallbackView.as_view(), name='STK Push'),
    # Schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Swagger UI
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # ReDoc (optional)
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
]