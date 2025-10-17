from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
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
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth = models.DateField(null=True, blank=True) # Change later to appropriate field
    school_or_organization = models.CharField(max_length=100, blank=True)
    organizations = models.ManyToManyField('Organization', blank=True, related_name='volunteers')

    def __str__(self):
        return f"{self.user.username} ({self.school_or_organization})"


class Organization(models.Model):
    name = models.CharField(max_length=100)
    date_of_establishment = models.DateField()
    registration_number = models.CharField(max_length=50, unique=True)
    organization_type = models.CharField(max_length=50)
    website = models.URLField(blank=True)
    description = models.TextField(max_length=500)
    logo = models.ImageField(upload_to="org_logos/", blank=True, null=True)
    address = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.name


class Admin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='admins')
    phone_number = models.CharField(max_length=15, blank=True)
    job_title = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.user.username} ({self.job_title})"