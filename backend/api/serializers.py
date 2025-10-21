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
    id = serializers.ReadOnlyField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    profile_id = serializers.IntegerField(read_only=True)
    organization_id = serializers.IntegerField(write_only=True, required=False)
    date_of_birth = serializers.DateField(write_only=True, required=False)
    school_or_organization = serializers.CharField(write_only=True, required=False)



    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password', 'confirm_password', 'role', 'profile_id', 'organization_id', 'date_of_birth', 'school_or_organization']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        
        if data['role'] == 'admin' and 'organization_id' not in data:
            raise serializers.ValidationError("Organization ID is required for admin registration.")
        
        return data

    def create(self, validated_data):
        organization_id = validated_data.pop('organization_id', None)
        date_of_birth = validated_data.pop('date_of_birth', None)
        school_or_org = validated_data.pop('school_or_organization', '')

        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data.get('username', validated_data['email']),
            password=validated_data['password'],
            role=validated_data['role']
        )

        if user.role == 'volunteer':
            if not date_of_birth:
                raise serializers.ValidationError("date_of_birth is required for volunteers.")
            volunteer = Volunteer.objects.create(
                user=user,
                date_of_birth=date_of_birth,
                school_or_organization=school_or_org
            )
            user.profile_id = volunteer.id

        elif user.role == 'admin':
            if not organization_id:
                user.delete()
                raise serializers.ValidationError("organization_id is required for admin registration.")
            try:
                organization = Organization.objects.get(id=organization_id)
            except Organization.DoesNotExist:
                user.delete()
                raise serializers.ValidationError(f"Organization with ID {organization_id} not found.")

            admin = Admin.objects.create(
                user=user,
                organization=organization
            )
            user.profile_id = admin.id

        user.save()
        return user
    

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value


class VolunteerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile_id = serializers.ReadOnlyField(source='id') 
    organizations_names = serializers.SerializerMethodField()
    date_of_birth = serializers.DateField()

    class Meta:
        model = Volunteer
        fields = ['profile_id', 'user', 'date_of_birth', 'school_or_organization', 'organizations', 'organizations_names']

    def get_organizations_names(self, obj):
        return [org.name for org in obj.organizations.all()]
    
    def validate_date_of_birth(self, value):
        from datetime import date
        today = date.today()
        min_age = 13
        if value > today:
            raise serializers.ValidationError("Date of birth cannot be in the future.")
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < min_age:
            raise serializers.ValidationError(f"Volunteer must be at least {min_age} years old.")
        return value

class AdminSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile_id = serializers.ReadOnlyField(source='id')  
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())

    class Meta:
        model = Admin
        fields = ['profile_id', 'user', 'organization', 'job_title', 'phone_number']


class OrganizationSerializer(serializers.ModelSerializer):
    join_code = serializers.ReadOnlyField()
    admins = serializers.SerializerMethodField()  

    class Meta:
        model = Organization
        fields = ['id', 'name', 'date_of_establishment', 'registration_number', 'organization_type',
                  'website', 'description', 'logo', 'address', 'city', 'country', 'join_code', 'admins']
        

    def get_admins(self, obj):
        admins = obj.admins.all()
        return [
            {"id": admin.id, "username": admin.user.username, "email": admin.user.email}
            for admin in admins
        ]
    
    def validate_date_of_establishment(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Date of establishment cannot be in the future.")
        return value
        



class JoinOrganizationSerializer(serializers.Serializer):
    join_code = serializers.CharField(max_length=10)

    def validate_join_code(self, value):
        try:
            organization = Organization.objects.get(join_code=value)
        except Organization.DoesNotExist:
            raise serializers.ValidationError("Invalid join code.")
        return value