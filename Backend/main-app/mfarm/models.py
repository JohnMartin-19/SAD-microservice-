from django.db import models
from accounts.models import CustomUser

# Define categories as a tuple of (value, display_name) pairs
FARM_CATEGORIES = (
    ('CEREALS', 'Cereals'),  # e.g., maize, wheat, rice
    ('LEGUMES', 'Legumes'),  # e.g., beans, peas, lentils
    ('ROOTS_TUBERS', 'Roots and Tubers'),  # e.g., potatoes, yams, cassava
    ('VEGETABLES', 'Vegetables'),  # e.g., tomatoes, spinach, carrots
    ('FRUITS', 'Fruits'),  # e.g., mangoes, bananas, oranges
    ('NUTS_SEEDS', 'Nuts and Seeds'),  # e.g., peanuts, almonds, sunflower seeds
    ('LIVESTOCK', 'Livestock'),  # e.g., cattle, goats, chickens
    ('LIVESTOCK_PRODUCTS', 'Livestock Products'),  # e.g., milk, eggs, wool
    ('POULTRY', 'Poultry'),  # e.g., chickens, ducks, turkeys
    ('FISH', 'Fish'),  # e.g., tilapia, catfish
    ('HERBS_SPICES', 'Herbs and Spices'),  # e.g., basil, pepper, ginger
    ('OIL_CROPS', 'Oil Crops'),  # e.g., sunflower, palm, soybeans
    ('FIBER_CROPS', 'Fiber Crops'),  # e.g., cotton, sisal
    ('FORESTRY_PRODUCTS', 'Forestry Products'),  # e.g., timber, bamboo
    ('OTHER', 'Other'),  # Catch-all for miscellaneous products
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
        default='OTHER'  # Optional: sets a default category
    )

    def __str__(self):
        return f"{self.name} ({self.category}) - {self.user.username}"