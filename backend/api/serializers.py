from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Volunteer, Admin, Organization

User = get_user_model()


# ========== Base User Serializer ==========
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'role']
        read_only_fields = ['id']


# ========== Registration Serializer ==========
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'confirm_password', 'role']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data.get('username', validated_data['email']),
            password=validated_data['password'],
            role=validated_data['role']
        )

        # Auto-create profile depending on role
        if user.role == 'volunteer':
            Volunteer.objects.create(user=user)
        elif user.role == 'admin':
            Admin.objects.create(user=user)

        print(f"DEBUG: Created user {user.email} with role {user.role}")
        return user
    
        


# ========== Volunteer Profile Serializer ==========
class VolunteerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Volunteer
        fields = ['user', 'date_of_birth', 'school_or_org', 'joined_organizations']


# ========== Admin Profile Serializer ==========
class AdminSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())

    class Meta:
        model = Admin
        fields = ['user', 'organization', 'job_title', 'phone_number']