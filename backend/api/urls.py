from django.urls import path
from . import views

urlpatterns = [
    path('volunteer_data/<int:pk>/', views.get_volunteer_data),
    path('admin_data/<int:pk>/', views.get_admin_data),
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.register_user),
    path('authenticated/', views.authenticated),
]