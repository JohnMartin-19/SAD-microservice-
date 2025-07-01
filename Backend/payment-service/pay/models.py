from django.db import models


class Payment(models.Model):
    user_id = models.IntegerField(null=True, blank=True)  
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed')])
    transaction_id = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    

class Transaction(models.Model):
    order_id = models.ForeignKey(Order, on_delete = models.PROTECT)
    timestamp = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    payment_method = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.user_id.username} ({self.timestamp}) - {self.payment_method}"
    

