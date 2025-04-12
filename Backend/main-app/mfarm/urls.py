from django.urls import path
from .views import *



urlpatterns = [
    path('mfarm/api/v1/products/', ProductListCreateView.as_view(), name='product_list_create'),
    path('mfarm/api/v1/products/<int:pk>/', ProductRetrieveUpdateDeleteView.as_view(), name='product_retrieve_update_delete'),
    path('mfarm/api/v1/myproducts/', LoggedInUserProductListView.as_view(), name='logged_in_user_product_list'),
    path('mfarm/api/v1/orders/', OrderListView.as_view(), name='order_list'),
    path('mfarm/api/v1/revenue/', RevenueView.as_view(), name='revenue'),
    path('mfarm/api/v1/ai-chat/', ai_chat, name='ai_chat'),
]