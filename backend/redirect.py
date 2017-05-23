
import webapp2

from authomatic import Authomatic
from config import CONFIG
from config import webapp2config


from common.web import, RestHandler


# Instantiate Authomatic.
authomatic = Authomatic(config=CONFIG, secret='7f8d3a6c-ab96-22d5-9ce6-0a7b3f9e5d41', debug=True)

# Create a simple request handler for the login procedure.
class Redirect(RestHandler):
    
    # The handler must accept GET and POST http methods and
    # Accept any HTTP method and catch the "provider_name" URL variable.
    def any(self):
        self.redirect(str(self.requestParam("redirect")))

# Create routes.
ROUTES = [webapp2.Route(r'/redirect', Redirect, handler_method='any'),]
# Instantiate the webapp2 WSGI application.
app=common.env.startWSGIServer(ROUTES)


