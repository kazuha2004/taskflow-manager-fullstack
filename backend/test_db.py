import os
import django
from decouple import config

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from projects.models import Project
from accounts.models import User
from mongoengine.queryset.visitor import Q

print("Connecting to DB...")
try:
    user = User.objects.first()
    if user:
        print(f"Found user: {user.email}")
        projects = Project.objects(Q(admin=user) | Q(members=user))
        print(f"Found {len(projects)} projects for user.")
    else:
        print("No users found.")
except Exception as e:
    import traceback
    traceback.print_exc()
