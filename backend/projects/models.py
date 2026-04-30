import mongoengine as me
from datetime import datetime
from accounts.models import User


class Project(me.Document):
    name = me.StringField(required=True, max_length=200)
    description = me.StringField(max_length=500, default='')
    admin = me.ReferenceField(User, required=True)
    members = me.ListField(me.ReferenceField(User))  # does NOT include admin
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'projects',
        'indexes': ['admin'],
    }

    def __str__(self):
        return self.name

    def all_member_ids(self):
        """Return set of all user IDs with access (admin + members)."""
        ids = {str(self.admin.id)}
        for m in self.members:
            ids.add(str(m.id))
        return ids
