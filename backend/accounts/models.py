import mongoengine as me
from datetime import datetime


class User(me.Document):
    name = me.StringField(required=True, max_length=100)
    email = me.EmailField(required=True, unique=True)
    password = me.StringField(required=True)  # bcrypt hashed
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'users',
        'indexes': ['email'],
    }

    @property
    def is_authenticated(self):
        return True

    def __str__(self):
        return self.email
