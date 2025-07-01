from django.urls import path
from .views import *



urlpatterns = [
    path('api/v1/checkout/', CheckoutView.as_view(), name='checkout'),
    path('api/v1/mpesa/stk-push/', STKPushAPIView.as_view(), name='STK Push')
]