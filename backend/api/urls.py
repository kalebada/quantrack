from django.urls import path
from . import views

urlpatterns = [
    path('my-volunteer-data/', views.get_my_volunteer_data),
    path('my-admin-data/', views.get_my_admin_data),
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.register_user),
    path('authenticated/', views.authenticated),
    path('logout/', views.logout_user),
    path('join_organization/<int:org_id>/', views.join_organization),
    path('quit_organization/<int:org_id>/', views.quit_organization),
]