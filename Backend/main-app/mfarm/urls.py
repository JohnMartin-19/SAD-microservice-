from django.urls import path
from .views import *



urlpatterns = [
    path('api/v1/products/', ProductListCreateView.as_view(), name='product_list_create'),
    path('api/v1/products/<int:pk>/', ProductRetrieveUpdateDeleteView.as_view(), name='product_retrieve_update_delete'),
    path('api/v1/myproducts/', LoggedInUserProductListView.as_view(), name='logged_in_user_product_list'),
    path('api/v1/myorders/', LoggedInUserOrderListView.as_view(), name='order_list'),
    path('api/v1/revenue/', RevenueView.as_view(), name='revenue'),
    path('api/v1/ai-chat/', ai_chat_endpoint, name='ai_chat'),
    path('api/v1/cart/', CartView.as_view(), name='cart'),
    path('api/v1/checkout/', CheckoutView.as_view(), name='checkout'),
    path('api/v1/send-receipt/', SendReceiptView.as_view(), name='send-receipt'),
    # path('api/v1/mpesa/stk-push/', STKPushAPIView.as_view(), name='STK Push')
]