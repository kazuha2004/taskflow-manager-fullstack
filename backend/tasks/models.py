import mongoengine as me
from datetime import datetime
from accounts.models import User
from projects.models import Project


class Task(me.Document):
    STATUS_CHOICES = ('To Do', 'In Progress', 'Done')

    title = me.StringField(required=True, max_length=200)
    description = me.StringField(max_length=1000, default='')
    project = me.ReferenceField(Project, required=True)
    assigned_to = me.ReferenceField(User, required=True)
    status = me.StringField(choices=STATUS_CHOICES, default='To Do')
    due_date = me.DateTimeField(required=True)
    created_by = me.ReferenceField(User, required=True)
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'tasks',
        'indexes': ['project', 'assigned_to', 'status'],
    }

    def __str__(self):
        return self.title
