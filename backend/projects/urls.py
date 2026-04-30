from django.urls import path
from projects.views import ProjectListView, ProjectDetailView, AddMemberView

urlpatterns = [
    path('projects/', ProjectListView.as_view(), name='project-list'),
    path('projects/<str:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('projects/<str:pk>/add-member/', AddMemberView.as_view(), name='project-add-member'),
]
