from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):  # Remove spaces around AbstractUser
    email = models.EmailField(unique=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

class PackerAndMover(models.Model):
    city = models.CharField(max_length=100)
    name = models.CharField(max_length=255, unique=True)
    address = models.TextField()
    local_move_cost_range = models.CharField(max_length=100)
    intercity_move_cost_range = models.CharField(max_length=100)
    ratings = models.DecimalField(max_digits=3, decimal_places=1)
    reviews_count = models.IntegerField()
    img_url = models.URLField(max_length=500, null=True, blank=True)

    def __str__(self):
        return f"{self.name} - {self.city}"
