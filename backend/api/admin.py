from django.contrib import admin
from .models import Volunteer, Admin, User, Organization

# Register your models here.

admin.site.register(User)
admin.site.register(Volunteer)
admin.site.register(Admin)
admin.site.register(Organization)
