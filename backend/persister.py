import logging

import webapp2

from common.database import getDatabaseCursor
from common.env import isProduction
from common.visitorcache import flushVisitor
from config import webapp2config
import common


class VisitorPersistHandler(webapp2.RequestHandler):

    def any(self):
        flushVisitor(anyvisitor=True)
        
class PersistAuthorReactionsHandler(webapp2.RequestHandler):
    
    def any(self):
        cursor = getDatabaseCursor()
        cursor.execute("INSERT INTO incoming_author_reactions (author_id, statement_id, reaction, asof) VALUES (%(authorid)s,%(statementid)s,%(reaction)s,%(when)s)", dict(self.request.params))
        pass

class PersistPartyReactionsHandler(webapp2.RequestHandler):
    
    def any(self):
        cursor = getDatabaseCursor()
        cursor.execute("INSERT INTO incoming_party_reactions (party_id, statement_id, reaction, asof) VALUES (%(partyid)s,%(statementid)s,%(reaction)s,%(when)s)", dict(self.request.params))
        pass


#This is where we request the author id - duplicate for brand
class PersistAuthorStatementHandler(webapp2.RequestHandler):
    
    def any(self):
        cursor = getDatabaseCursor()
        args = {'authorid':int(self.request.params.get("authorid", None)), 'statement': self.request.params.get("statement", None)}
        logging.debug(args)
        cursor.execute("INSERT INTO incoming_author_statements (author_id, statement) VALUES (%(authorid)s,%(statement)s)", args)
        pass
    
# Create routes.
ROUTES = [
          webapp2.Route(r'/persist/visitor', VisitorPersistHandler, handler_method='any'),
          webapp2.Route(r'/persist/authorselfreactions', PersistAuthorReactionsHandler, handler_method='any'),
          webapp2.Route(r'/persist/partyselfreactions', PersistPartyReactionsHandler, handler_method='any'),
          webapp2.Route(r'/persist/authorselfstatement', PersistAuthorStatementHandler, handler_method='any'),
          ]

# Instantiate the webapp2 WSGI application.
app=common.env.startWSGIServer(ROUTES)
