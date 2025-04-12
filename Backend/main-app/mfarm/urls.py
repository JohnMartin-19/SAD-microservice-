from django.urls import path
from .views import *



urlpatterns = [
    path('mfarm/api/v1/products/', ProductListCreateView.as_view(), name='product_list_create'),
    path('mfarm/api/v1/products/<int:pk>/', ProductRetrieveUpdateDeleteView.as_view(), name='product_retrieve_update_delete'),
]