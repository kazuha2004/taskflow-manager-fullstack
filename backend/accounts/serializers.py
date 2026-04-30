from rest_framework import serializers
from accounts.models import User
import bcrypt


class SignupSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)

    def validate_email(self, value):
        if User.objects(email=value).first():
            raise serializers.ValidationError("Email already registered.")
        return value.lower()

    def create(self, validated_data):
        hashed = bcrypt.hashpw(
            validated_data['password'].encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        user = User(
            name=validated_data['name'],
            email=validated_data['email'],
            password=hashed,
        )
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = User.objects(email=data['email'].lower()).first()
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not bcrypt.checkpw(
            data['password'].encode('utf-8'),
            user.password.encode('utf-8')
        ):
            raise serializers.ValidationError("Invalid email or password.")
        data['user'] = user
        return data


class UserSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    name = serializers.CharField()
    email = serializers.EmailField()
    created_at = serializers.DateTimeField()

    def get_id(self, obj):
        return str(obj.id)
