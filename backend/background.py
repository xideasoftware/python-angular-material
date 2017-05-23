import logging
import os

import webapp2

from common.env import isProduction
from config import webapp2config
import common


class BackendDefault(webapp2.RequestHandler):
    
    def any(self):
        self.response.write("alive")
        
            
# Create routes.
ROUTES = [
          webapp2.Route(r'/_ah/start', BackendDefault, handler_method='any'),
          webapp2.Route(r'/_ah/stop', BackendDefault, handler_method='any'),
          ]

# Instantiate the webapp2 WSGI application.
app=common.env.startWSGIServer(ROUTES)
