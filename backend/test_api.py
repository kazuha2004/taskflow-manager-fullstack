import os
import django
from decouple import config

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import RequestFactory
from rest_framework.test import force_authenticate
from accounts.models import User
from projects.views import ProjectListView
from tasks.views import DashboardView

user = User.objects.first()
factory = RequestFactory()
request = factory.get('/api/projects/')
force_authenticate(request, user=user)

print("Testing ProjectListView...")
try:
    view = ProjectListView.as_view()
    response = view(request)
    print("ProjectListView Success:", response.data)
except Exception as e:
    import traceback
    traceback.print_exc()

print("Testing DashboardView...")
try:
    view = DashboardView.as_view()
    response = view(request)
    print("DashboardView Success:", response.data)
except Exception as e:
    import traceback
    traceback.print_exc()
