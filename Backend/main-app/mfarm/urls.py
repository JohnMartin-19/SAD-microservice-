from django.urls import path
from .views import *
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView, 
)


urlpatterns = [
    path('api/v1/products/', ProductListCreateView.as_view(), name='product_list_create'),
    path('api/v1/products/<int:pk>/', ProductRetrieveUpdateDeleteView.as_view(), name='product_retrieve_update_delete'),
    path('api/v1/products/<int:pk>/decrement_quantity/', ProductDecrementQuantityView.as_view(), name='product-decrement-quantity'),
    path('api/v1/myproducts/', LoggedInUserProductListView.as_view(), name='logged_in_user_product_list'),
    path('api/v1/myproducts/delete/<int:pk>/', LoggedInUserProductDeleteView.as_view(), name='logged_in_user_product_delete'),
    path('api/v1/myorders/', LoggedInUserOrderListView.as_view(), name='order_list'),
    path('api/v1/revenue/', RevenueView.as_view(), name='revenue'),
    path('api/v1/ai-chat/', ai_chat_endpoint, name='ai_chat'),
    path('api/v1/cart/', CartView.as_view(), name='cart'),
    
    # Schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Swagger UI
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # ReDoc (optional)
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
]