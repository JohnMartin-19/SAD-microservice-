from django.db import models

class Order(models.Model):
    placed_by_id = models.IntegerField()
    complete = models.BooleanField(default=False)
    transaction_id = models.CharField(max_length=100, blank=True, unique=True, null=True)
    status = models.CharField(max_length=50, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20,blank=True,null=True)
    
    address = models.CharField(max_length=255,blank=True, null=True)
    city = models.CharField(max_length=100,blank=True,null=True)
    postal_code = models.CharField(max_length=100, blank=True, null=True)
    
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    def __str__(self):
        return f"Order {self.id} by User {self.placed_by_id} - Status {self.status}"
    
    
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name = 'items')
    product_id = models.IntegerField()
    product_name = models.CharField(max_length=100)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default= 1)
    
    class Meta:
        unique_together= ('order','product_id')
        
    def __str__(self):
      return f"{self.quantity} x {self.product_name} (Product ID:{self.product_id} for Order {self.order})"  
class Payment(models.Model):
    user_id = models.IntegerField(null=True, blank=True) 
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments') 
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed')])
    transaction_id = models.CharField(max_length=100,unique=True, db_index=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True,blank=True)
    
    def __str__(self):
        return f"Payment {self.id} for Order {self.order.id if self.order else 'N/A'} - {self.status}"

    

class Transaction(models.Model):
    order_id = models.ForeignKey(Order, on_delete = models.PROTECT)
    timestamp = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    payment_method = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.user_id.username} ({self.timestamp}) - {self.payment_method}"
    

