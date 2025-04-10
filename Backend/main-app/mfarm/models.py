from django.db import models
from accounts.models import CustomUser

# Define categories as a tuple of (value, display_name) pairs
FARM_CATEGORIES = (
    ('CEREALS', 'Cereals'),  
    ('LEGUMES', 'Legumes'),  
    ('ROOTS_TUBERS', 'Roots and Tubers'),  
    ('VEGETABLES', 'Vegetables'),  
    ('FRUITS', 'Fruits'),  
    ('NUTS_SEEDS', 'Nuts and Seeds'),  
    ('LIVESTOCK', 'Livestock'),  
    ('LIVESTOCK_PRODUCTS', 'Livestock Products'), 
    ('POULTRY', 'Poultry'),  
    ('FISH', 'Fish'),  
    ('HERBS_SPICES', 'Herbs and Spices'),  
    ('OIL_CROPS', 'Oil Crops'),  
    ('FIBER_CROPS', 'Fiber Crops'),  
    ('FORESTRY_PRODUCTS', 'Forestry Products'),  
    ('OTHER', 'Other'),  
)

class Product(models.Model):
    name = models.CharField(blank=False, max_length=100, null=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    description = models.CharField(blank=True, null=True, max_length=250)
    quantity = models.CharField(blank=True, null=True, max_length=50)
    product_location = models.CharField(blank=True, null=True, max_length=150)
    category = models.CharField(
        max_length=50,
        choices=FARM_CATEGORIES,
        blank=True,
        null=True,
        default='OTHER'  
    )

    def __str__(self):
        return f"{self.name} ({self.category}) - {self.user.username}"