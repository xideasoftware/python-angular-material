
from google.appengine.ext import ndb
import webapp2

from common.ga import getCachedRunningExperiments
from config import webapp2config
import common


class RefreshExperimentsHandler(webapp2.RequestHandler):
        
    @ndb.toplevel
    def any(self):
        getCachedRunningExperiments()
        
         
# Create routes.
ROUTES = [
          webapp2.Route(r'/experiments/refresh', RefreshExperimentsHandler, handler_method='any'),
          ]
# Instantiate the webapp2 WSGI application.
app=common.env.startWSGIServer(ROUTES)


