
import webapp2

from common.env import isProduction
from config import webapp2config
from model import getExternalModel


from common.web import, RestHandler


class NumberFountainHandler(RestHandler):
    
    def get(self,classname,howmany):
        n=int(howmany)
        cls=getExternalModel(classname)
        self.SendJson(cls.allocate_ids(n))

ROUTES = [
          webapp2.Route(r'/numberfountain/<classname>/<howmany>', NumberFountainHandler, handler_method='get'),
          ]
app=common.env.startWSGIServer(ROUTES)


