from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from mongoengine.queryset.visitor import Q

from projects.models import Project
from projects.serializers import ProjectSerializer, ProjectCreateSerializer, AddMemberSerializer


class ProjectListView(APIView):
    def get(self, request):
        # User can see projects where they are admin OR a member
        user = request.user
        projects = Project.objects(Q(admin=user) | Q(members=user))
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProjectCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            project = serializer.save()
            return Response(ProjectSerializer(project).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectDetailView(APIView):
    def get_object(self, pk, user):
        project = Project.objects(id=pk).first()
        if not project:
            return None
        # Check access
        if str(project.admin.id) != str(user.id) and user not in project.members:
            return None
        return project

    def get(self, request, pk):
        project = self.get_object(pk, request.user)
        if not project:
            return Response({"error": "Not found or access denied."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ProjectSerializer(project)
        return Response(serializer.data)


class AddMemberView(APIView):
    def post(self, request, pk):
        project = Project.objects(id=pk).first()
        if not project:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Only admin can add members
        if str(project.admin.id) != str(request.user.id):
            return Response({"error": "Only project admin can add members."}, status=status.HTTP_403_FORBIDDEN)

        serializer = AddMemberSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            member_user = serializer.context['member_user']
            
            # Don't add admin as member
            if str(member_user.id) == str(project.admin.id):
                return Response({"error": "Admin is already part of the project."}, status=status.HTTP_400_BAD_REQUEST)
                
            # Don't add existing members
            if member_user in project.members:
                return Response({"error": "User is already a member."}, status=status.HTTP_400_BAD_REQUEST)

            project.members.append(member_user)
            project.save()
            
            return Response(ProjectSerializer(project).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
