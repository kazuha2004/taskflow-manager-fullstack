from rest_framework import serializers
from projects.models import Project
from accounts.models import User


class MemberSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    name = serializers.CharField()
    email = serializers.EmailField()

    def get_id(self, obj):
        return str(obj.id)


class ProjectSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    name = serializers.CharField()
    description = serializers.CharField()
    admin = MemberSerializer()
    members = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField()

    def get_id(self, obj):
        return str(obj.id)

    def get_members(self, obj):
        return MemberSerializer(obj.members, many=True).data


class ProjectCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    description = serializers.CharField(max_length=500, required=False, default='', allow_blank=True, allow_null=True)

    def create(self, validated_data):
        admin = self.context['request'].user
        project = Project(
            name=validated_data['name'],
            description=validated_data.get('description', ''),
            admin=admin,
            members=[],
        )
        project.save()
        return project


class AddMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        user = User.objects(email=value.lower()).first()
        if not user:
            raise serializers.ValidationError("No user found with this email.")
        self.context['member_user'] = user
        return value
