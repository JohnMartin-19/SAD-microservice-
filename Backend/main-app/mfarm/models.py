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
    image = models.ImageField(
        upload_to='uploads/',  # Relative to MEDIA_ROOT
        blank=True,
        null=True,
        default=None
    )

    def __str__(self):
        return f"{self.name} ({self.category}) - {self.user.username}"



class Order(models.Model):
    placed_by = models.ForeignKey(CustomUser,on_delete = models.PROTECT)
    date_ordered = models.DateTimeField(auto_now_add=True, blank=False)
    complete= models.BooleanField(blank=True, null=True)
    transaction_id = models.CharField(max_length=40,null=True, blank=True )

    def __str__(self):
        return self.transaction_id
    

class ProductOrder(models.Model):
    product = models.ForeignKey(Product, on_delete = models.PROTECT)
    order = models.ForeignKey(Order, on_delete = models.PROTECT)
    quantity = models.CharField(max_length=100, blank=True, null=True)
    date_added = models.DateField(auto_created=True, blank=True)


    def __str__(self):
        return f"{self.product.name} ({self.quantity}) - {self.order.placed_by}"
    

class Transaction(models.Model):
    user_id = models.ForeignKey(CustomUser, on_delete=models.PROTECT)
    order_id = models.ForeignKey(Order, on_delete = models.PROTECT)
    timestamp = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    payment_method = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.user_id.username} ({self.timestamp}) - {self.payment_method}"
    

class Shipping(models.Model):
    address = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length = 100, blank=True, null=True)
    postal_code = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.city