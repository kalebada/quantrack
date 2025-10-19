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
    profile_id = serializers.IntegerField(read_only=True)
    organization_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'confirm_password', 'role', 'profile_id', 'organization_id']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        
        if data['role'] == 'admin' and 'organization_id' not in data:
            raise serializers.ValidationError("Organization ID is required for admin registration.")
        
        return data

    def create(self, validated_data):
            organization_id = validated_data.pop('organization_id', None)
            validated_data.pop('confirm_password')
            user = User.objects.create_user(
                email=validated_data['email'],
                username=validated_data.get('username', validated_data['email']),
                password=validated_data['password'],
                role=validated_data['role']
            )

            profile_id = None
            
            # Auto-create profile depending on role
            if user.role == 'volunteer':
                volunteer = Volunteer.objects.create(user=user)
                profile_id = volunteer.id
            elif user.role == 'admin':
                # FIX: Use the organization_id to create the admin profile
                try:
                    organization = Organization.objects.get(id=organization_id)
                    admin = Admin.objects.create(user=user, organization=organization)  # Pass organization here
                    profile_id = admin.id
                except Organization.DoesNotExist:
                    user.delete()  # Delete the user if organization doesn't exist
                    raise serializers.ValidationError(f"Organization with ID {organization_id} not found.")

            # Add profile_id to the user instance (temporarily for response)
            user.profile_id = profile_id
            return user
    
        


class VolunteerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile_id = serializers.ReadOnlyField(source='id')  # Use ReadOnlyField instead
    organizations_names = serializers.SerializerMethodField()

    class Meta:
        model = Volunteer
        fields = ['profile_id', 'user', 'date_of_birth', 'school_or_organization', 'organizations', 'organizations_names']

    def get_organizations_names(self, obj):
        return [org.name for org in obj.organizations.all()]

class AdminSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile_id = serializers.ReadOnlyField(source='id')  # Use ReadOnlyField instead
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())

    class Meta:
        model = Admin
        fields = ['profile_id', 'user', 'organization', 'job_title', 'phone_number']