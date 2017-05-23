import logging

import webapp2

from common.database import getDatabaseCursor
from common.env import isProduction
from common.q import upd, maptoqfromobjlistordict
from config import webapp2config
import common


class PublishUserHandler(webapp2.RequestHandler):

    def any(self, visitorid):
        logging.debug("Publish %s" % (visitorid)) 
        cur = getDatabaseCursor("research");
        res=cur.executefetchasdictlist("select * from visitor_statement_reaction where visitor_id="+str(visitorid))
        if len(res) == 0:
            return
        tab=maptoqfromobjlistordict(res, ("id","visitor_id","statement_id","time","reaction"), rename=("id","person","entity","time","reaction"))
        upd('feed','visitorstatementreaction',tab)
         
# Create routes.
ROUTES = [
          webapp2.Route(r'/publish/user/<visitorid>', PublishUserHandler, handler_method='any'),
          ]

# Instantiate the webapp2 WSGI application.
app=common.env.startWSGIServer(ROUTES)
