import time

from google.appengine.ext import ndb
from webapp2_extras import security

import webapp2_extras.appengine.auth.models as auth_models


class User(auth_models.User):
    name = ndb.StringProperty()
    enabled = ndb.BooleanProperty(default=True)
    emailverified = ndb.BooleanProperty(default=False)
    twitter = ndb.StringProperty()
    legacypassword = ndb.StringProperty()
    area = ndb.StringProperty()
    email = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add = True)
    modified = ndb.DateTimeProperty(auto_now = True)

    def set_password(self, raw_password):
        self.password = security.generate_password_hash(raw_password, length=12)

    @classmethod
    def get_by_auth_token(cls, user_id, token, subject='auth'):
        token_key = cls.token_model.get_key(user_id, subject, token)
        user_key = ndb.Key(cls, user_id)
        # Use get_multi() to save a RPC call.
        valid_token, user = ndb.get_multi([token_key, user_key])
        if valid_token and user:
            timestamp = int(time.mktime(valid_token.created.timetuple()))
            return user, timestamp