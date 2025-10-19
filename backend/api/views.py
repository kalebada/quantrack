from os import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Volunteer, Admin, User, Organization
from .serializers import VolunteerSerializer, AdminSerializer, RegisterSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import BasePermission
from rest_framework import status

class IsVolunteer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'volunteer'
    
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            # Call SimpleJWT to validate credentials and get tokens
            response = super().post(request, *args, **kwargs)
            tokens = response.data

            access_token = tokens.get('access')
            refresh_token = tokens.get('refresh')
            email = request.data.get('email')

            if not email:
                return Response({'error': 'Email field is required.'}, status=400)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=404)

            res = Response({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'role': user.role,
                }
            }, status=status.HTTP_200_OK)

            # Set tokens in cookies
            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/',
            )
            res.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/',
            )

            return res

        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=400)

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            if not refresh_token:
                return Response({'success': False, 'error': 'No refresh token found'}, status=400)

            request.data['refresh'] = refresh_token
            response = super().post(request, *args, **kwargs)
            tokens = response.data
            access_token = tokens.get('access')

            res = Response({'success': True}, status=200)
            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/',
            )
            return res
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=400)



@api_view(['GET'])
@permission_classes([IsAuthenticated, IsVolunteer])
def get_my_volunteer_data(request):
    """Get the current volunteer's own data"""
    try:
        volunteer = Volunteer.objects.get(user=request.user)
        serializer = VolunteerSerializer(volunteer)
        return Response(serializer.data)
    except Volunteer.DoesNotExist:
        return Response({'error': 'Volunteer profile not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def get_my_admin_data(request):
    """Get the current admin's own data"""
    try:
        admin = Admin.objects.get(user=request.user)
        serializer = AdminSerializer(admin)
        return Response(serializer.data)
    except Admin.DoesNotExist:
        return Response({'error': 'Admin profile not found'}, status=404)
    

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def authenticated(request):
    return Response('authenticated')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    try:
        res = Response()
        res.data = {'success': True, 'message': 'Logged out successfully'}
        res.delete_cookie('access_token', path='/')
        res.delete_cookie('refresh_token', path='/')
        return res
    except:
        return Response({'success':False, 'messsage': 'Logout failed'})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsVolunteer])
def join_organization(request, org_id):
    try:
        volunteer = Volunteer.objects.get(user=request.user)
        organization = Organization.objects.get(id=org_id)
        volunteer.organizations.add(organization)
        volunteer.save()
        return Response({'success': True, 'message': 'Joined organization successfully'})
    except Organization.DoesNotExist:
        return Response({'success': False, 'message': 'Organization not found'}, status=404)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsVolunteer])
def quit_organization(request, org_id):
    try:
        volunteer = Volunteer.objects.get(user=request.user)
        organization = Organization.objects.get(id=org_id)
        if organization in volunteer.organizations.all():
            volunteer.organizations.remove(organization)
            volunteer.save()
            return Response({'success': True, 'message': 'Quit organization successfully'})
        else:
            return Response({'success': False, 'message': 'You are not a member of this organization'}, status=400)
    except Organization.DoesNotExist:
        return Response({'success': False, 'message': 'Organization not found'}, status=404)