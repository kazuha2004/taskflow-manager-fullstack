"""
Custom JWT authentication for mongoengine User (not Django ORM User).
We issue/verify JWTs manually using PyJWT.
"""
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from accounts.models import User


def generate_tokens(user):
    """Generate access + refresh JWT tokens for a User document."""
    now = datetime.utcnow()

    access_payload = {
        'user_id': str(user.id),
        'email': user.email,
        'exp': now + timedelta(hours=24),
        'iat': now,
        'type': 'access',
    }
    refresh_payload = {
        'user_id': str(user.id),
        'exp': now + timedelta(days=7),
        'iat': now,
        'type': 'refresh',
    }

    access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm='HS256')
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm='HS256')

    return {'access': access_token, 'refresh': refresh_token}


class MongoJWTAuthentication(BaseAuthentication):
    """
    DRF authentication class that validates Bearer JWT tokens
    and returns the mongoengine User document.
    """

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None  # Not our auth — let DRF try others or deny

        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired.')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token.')

        if payload.get('type') != 'access':
            raise AuthenticationFailed('Use access token, not refresh token.')

        user = User.objects(id=payload['user_id']).first()
        if not user:
            raise AuthenticationFailed('User not found.')

        return (user, token)
