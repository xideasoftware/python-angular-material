
from google.appengine.ext import ndb


def removeforeignstatements(visitor):
    for s in visitor.votes:
        s.statement=ndb.Key(s.statement.kind(), s.statement.id())
    for r in visitor.articlesread:
        r.article=ndb.Key(r.article.kind(), r.article.id())
    return visitor