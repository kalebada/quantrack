from django.urls import path
from . import views

urlpatterns = [
    path('my-volunteer-data/', views.get_my_volunteer_data),
    path('my-admin-data/', views.get_my_admin_data),
    path('get-volunteer-data/<int:volunteer_id>/', views.get_volunteer_data_by_id),
    path('get-admin-data/<int:admin_id>/', views.get_admin_data_by_id),
    path('update-volunteer-data/', views.update_my_volunteer_data),
    path('update-admin-data/', views.update_my_admin_data),
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.register_user),
    path('register-organization/', views.register_organization),
    path('authenticated/', views.authenticated),
    path('logout/', views.logout_user),
    path('organizations/join/', views.join_organization_by_code, name='join-by-code'),
    path('organizations/quit/', views.quit_organization_by_code, name='quit-by-code'),   
]