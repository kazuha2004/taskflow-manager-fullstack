import os
import django
from decouple import config

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from projects.models import Project
from accounts.models import User
from projects.serializers import ProjectSerializer

print("Testing serialization...")
try:
    user = User.objects.first()
    project = Project(name="Test", admin=user)
    project.save()
    
    serializer = ProjectSerializer(project)
    print("Serialized:", serializer.data)
    
    project.delete()
except Exception as e:
    import traceback
    traceback.print_exc()
