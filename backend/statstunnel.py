
import webapp2

from common.web import RestHandler
from config import webapp2config
import common


class StatsHandler(RestHandler):

    def get(self):
        pass
        
# Create routes.
ROUTES = [
          webapp2.Route(r'/statstunnel/setup', StatsHandler),
          ]
# Instantiate the webapp2 WSGI application.
app=common.env.startWSGIServer(ROUTES)


