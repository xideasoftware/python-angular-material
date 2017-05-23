
import logging

import webapp2

from authomatic import Authomatic
from common.web import BaseHandler
from config import CONFIG
from config import webapp2config


# Instantiate Authomatic.
authomatic = Authomatic(config=CONFIG, secret='7f8d3a6c-ab96-22d5-9ce6-0a7b3f9e5d41')

# Create a simple request handler for the login procedure.
class LogoutHandler(BaseHandler):
    
    # The handler must accept GET and POST http methods and
    # Accept any HTTP method and catch the "provider_name" URL variable.
    def any(self):
                
        #promote out of the iframe post parameters into session variables
        referer = self.requestParam('referer') 
        if referer is None:
            referer = self.request.referer
        if referer is None:
            referer = self.session.get('referer', None)
        if type(referer) is unicode:
            referer = referer.encode('ascii')          
        self.session['referer'] = None
        self.session['visitorid'] = None
        self.session["username"] = None
        self.session['twitterloggedin'] = False
        self.session['facebookloggedin'] = False
        self.session_store.save_sessions(self.response)
        logging.info("Redirecting logout to "+referer)
        self.redirect(referer)
        
# Create routes.
ROUTES = [webapp2.Route(r'/logout', LogoutHandler, handler_method='any'),]


# Instantiate the webapp2 WSGI application.
app = webapp2.WSGIApplication(ROUTES, debug=True, config=webapp2config)

