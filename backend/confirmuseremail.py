
import logging

from webapp2_extras import auth
import webapp2

from config import webapp2config
from main import MainHandler


class VerificationHandler(MainHandler):

    @webapp2.cached_property 
    def auth(self):
        return auth.get_auth()
 
    @webapp2.cached_property
    def user_info(self):
        return self.auth.get_user_by_session()
 
    @webapp2.cached_property
    def user(self):
        u = self.user_info
        return self.user_model.get_by_id(u['user_id']) if u else None
 
    @webapp2.cached_property
    def user_model(self):
        return self.auth.store.user_model
    
    def any(self, *args, **kwargs):
        user = None
        user_id = kwargs['user_id']
        signup_token = kwargs['signup_token']
        verification_type = kwargs['type']
 
        # it should be something more concise like
        # self.auth.get_user_by_token(user_id, signup_token
        # unfortunately the auth interface does not (yet) allow to manipulate
        # signup tokens concisely
        if not self.user_model.validate_signup_token(int(user_id), signup_token):
            logging.warn("invalid verification")
            self.redirect("/")
        
        user = self.user_model.get_by_id(int(user_id))
            
        # store user data in the session
        #self.auth.set_session(self.auth.store.user_to_dict(user), remember=False)
 
        # remove signup token, we don't want users to come back with an old link
        self.user_model.delete_signup_token(user.get_id(), signup_token)
 
        if not user.verified:
            user.emailverified = True
            user.verified = True
            user.put()
            self.redirect("/confirmedemail")
        else:
            logging.warn("already verified")
            self.redirect("/")
            

# Instantiate the webapp2 WSGI application.
ROUTES = [webapp2.Route(r'/confirmuseremail/<type:v|p>/<user_id:\d+>/<signup_token:.+>', VerificationHandler, handler_method='any'),]

app = webapp2.WSGIApplication(ROUTES, debug=True, config=webapp2config)



