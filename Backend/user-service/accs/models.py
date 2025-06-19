from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    name = models.CharField(null=True, blank=True, max_length=100)
    phone = models.CharField(null=True, blank=True, max_length=25)
    bio = models.CharField(null =True, blank=True, max_length=500)
    location = models.CharField(null=True, blank=True, max_length=30)
    photo = models.ImageField(null=True, blank=True,upload_to='users/')

    def __str__(self):
        return self.username
    
    
    class Consultant(models.Model):
        name = models.CharField(max_length=250,null=False, blank=False)
        specialty = models.CharField(max_length=70, null=False, blank=False)
        booked_date = models.DateField(null=True, blank=True)
        cost = models.PositiveIntegerField()