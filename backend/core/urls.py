from django.urls import path, include

urlpatterns = [
    path('api/auth/', include('accounts.urls')),
    path('api/', include('projects.urls')),
    path('api/', include('tasks.urls')),
]
