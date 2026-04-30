from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime

from tasks.models import Task
from tasks.serializers import TaskSerializer, TaskCreateSerializer, TaskUpdateStatusSerializer
from projects.models import Project


class TaskListCreateView(APIView):
    def get(self, request, project_id):
        project = Project.objects(id=project_id).first()
        if not project:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
            
        user = request.user
        # Admin sees all tasks in project. Member sees only their assigned tasks.
        if str(project.admin.id) == str(user.id):
            tasks = Task.objects(project=project)
        elif user in project.members:
            tasks = Task.objects(project=project, assigned_to=user)
        else:
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request, project_id):
        project = Project.objects(id=project_id).first()
        if not project:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
            
        # Only admin can create tasks
        if str(project.admin.id) != str(request.user.id):
            return Response({"error": "Only project admin can create tasks."}, status=status.HTTP_403_FORBIDDEN)

        serializer = TaskCreateSerializer(
            data=request.data, 
            context={'request': request, 'project': project}
        )
        if serializer.is_valid():
            task = serializer.save()
            return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskDetailView(APIView):
    def patch(self, request, pk):
        task = Task.objects(id=pk).first()
        if not task:
            return Response({"error": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
            
        user = request.user
        project = task.project
        
        # Admin can update any task in their project. Member can update their assigned tasks.
        is_admin = str(project.admin.id) == str(user.id)
        is_assigned = str(task.assigned_to.id) == str(user.id)
        
        if not (is_admin or is_assigned):
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        serializer = TaskUpdateStatusSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            task = serializer.save()
            return Response(TaskSerializer(task).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DashboardView(APIView):
    def get(self, request):
        user = request.user
        now = datetime.utcnow()
        
        # User is admin of projects
        admin_projects = Project.objects(admin=user)
        member_projects = Project.objects(members=user)
        
        # Gather all relevant tasks
        admin_tasks = Task.objects(project__in=admin_projects)
        member_tasks = Task.objects(project__in=member_projects, assigned_to=user)
        
        # We need to manually aggregate since we can't easily union mongoengine querysets with different conditions if we want a single query.
        # Alternatively, we just fetch them and combine in Python since it's a simple app.
        all_tasks = list(admin_tasks) + list(member_tasks)
        
        # De-duplicate in case a user is both admin and member (shouldn't happen based on our AddMember logic, but safe to do)
        unique_tasks = {str(t.id): t for t in all_tasks}.values()
        
        total = len(unique_tasks)
        todo = sum(1 for t in unique_tasks if t.status == 'To Do')
        in_progress = sum(1 for t in unique_tasks if t.status == 'In Progress')
        done = sum(1 for t in unique_tasks if t.status == 'Done')
        
        # Overdue tasks (not done and due_date < now)
        # Note: due_date is naive datetime in Mongoengine usually, but we stored utcnow
        overdue = sum(1 for t in unique_tasks if t.status != 'Done' and t.due_date and t.due_date < now)
        
        return Response({
            "total_tasks": total,
            "todo": todo,
            "in_progress": in_progress,
            "done": done,
            "overdue": overdue
        })
