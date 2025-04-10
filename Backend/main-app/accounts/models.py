from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    name = models.CharField(null=True, blank=True, max_length=100)
    phone = models.CharField(null=True, blank=True, max_length=25)
    bio = models.CharField(null =True, blank=True, max_length=500)
    location = models.CharField(null=True, blank=True, max_length=30)
    