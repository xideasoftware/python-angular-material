
from google.appengine.ext import ndb
import webapp2

from common.web import BaseHandler
from config import webapp2config
import common


# Create a simple request handler for the login procedure.
class PageCopy(BaseHandler):
    
    def get(self, page_id):
        page = ndb.Key('PageCopy', int(page_id)).get()
        self.response.write(page.content)

# Create routes.
ROUTES = [webapp2.Route(r'/pagecopy/<:.*>', PageCopy, handler_method='get'),]


# Instantiate the webapp2 WSGI application.
app=common.env.startWSGIServer(ROUTES)



