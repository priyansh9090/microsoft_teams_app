from django.db import models
from django.db.models.deletion import CASCADE
# from django.urls import reverse
from django.contrib.auth import get_user_model

# Create your models here.
User = get_user_model()


class Room(models.Model):
    author = models.ForeignKey(User, on_delete=CASCADE)
    content = models.ForeignKey('Message', on_delete=CASCADE)
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class Message(models.Model):
    message = models.TextField(max_length=10000)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.first_name
