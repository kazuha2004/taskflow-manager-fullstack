from rest_framework import serializers
from tasks.models import Task
from projects.serializers import MemberSerializer
from accounts.models import User
import dateutil.parser


class TaskSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    title = serializers.CharField()
    description = serializers.CharField()
    status = serializers.CharField()
    due_date = serializers.DateTimeField()
    project_id = serializers.SerializerMethodField()
    assigned_to = MemberSerializer()
    created_by = MemberSerializer()
    created_at = serializers.DateTimeField()

    def get_id(self, obj):
        return str(obj.id)
        
    def get_project_id(self, obj):
        return str(obj.project.id)


class TaskCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    description = serializers.CharField(max_length=1000, required=False, default='', allow_blank=True, allow_null=True)
    assigned_to = serializers.EmailField()
    due_date = serializers.DateTimeField()

    def validate_assigned_to(self, value):
        user = User.objects(email=value.lower()).first()
        if not user:
            raise serializers.ValidationError("Assigned user not found.")
        
        project = self.context['project']
        # Check if user is part of the project (admin or member)
        if str(user.id) not in project.all_member_ids():
            raise serializers.ValidationError("Assigned user is not a member of this project.")
            
        self.context['assigned_user'] = user
        return value

    def create(self, validated_data):
        task = Task(
            title=validated_data['title'],
            description=validated_data.get('description', ''),
            project=self.context['project'],
            assigned_to=self.context['assigned_user'],
            due_date=validated_data['due_date'],
            created_by=self.context['request'].user
        )
        task.save()
        return task


class TaskUpdateStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Task.STATUS_CHOICES)

    def update(self, instance, validated_data):
        instance.status = validated_data['status']
        instance.save()
        return instance
