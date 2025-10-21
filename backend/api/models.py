from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

def generate_join_code():
    return uuid.uuid4().hex[:10].upper()

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ROLE_CHOICES = [
        ('volunteer', 'Volunteer'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.role})"


class Volunteer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth = models.DateField()
    school_or_organization = models.CharField(max_length=100)
    organizations = models.ManyToManyField('Organization', blank=True, related_name='volunteers')

    def __str__(self):
        return f"{self.user.username} ({self.school_or_organization})"


class Organization(models.Model):
    name = models.CharField(max_length=100)
    date_of_establishment = models.DateField()
    registration_number = models.CharField(max_length=50, unique=True, blank=True, null=True)
    organization_type = models.CharField(max_length=50)
    website = models.URLField(blank=True, null=True)
    description = models.TextField(max_length=500, blank=True, null=True)
    logo = models.ImageField(upload_to="org_logos/", blank=True, null=True)
    address = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    join_code = models.CharField(max_length=10, unique=True, default=generate_join_code)

    def __str__(self):
        return f"{self.name}, code: {self.join_code}"
    



class Admin(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, related_name='admins')
    phone_number = models.CharField(max_length=15, blank=True)
    job_title = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.user.username} ({self.job_title})"
    

class Membership(models.Model):
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, default="Volunteer")
    date_joined = models.DateField(auto_now_add=True)
    verified = models.BooleanField(default=False)



class Event(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="events")
    name = models.CharField(max_length=100)
    description = models.TextField()
    date = models.DateField()
    time = models.TimeField(blank=True, null=True)
    location = models.CharField(max_length=200)
    is_public = models.BooleanField(default=True)
    service_hours = models.DecimalField(max_digits=5, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)