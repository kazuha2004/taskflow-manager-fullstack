from django.urls import path
from tasks.views import TaskListCreateView, TaskDetailView, DashboardView

urlpatterns = [
    path('projects/<str:project_id>/tasks/', TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<str:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]
