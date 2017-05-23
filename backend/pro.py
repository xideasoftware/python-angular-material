
import logging

import webapp2

from common.env import isProduction
from common.web import InitialPageHandler
from config import webapp2config
from ui.axis import getAllAxis
from ui.topic import getAllTopics
from ui.visitor import generateVisitorData
import common


class ProHandler(InitialPageHandler ):

    def any(self, *args):
        self.addjson("visitor",generateVisitorData(self.visitorkey.get()))
        self.addjson("idtoaxis",getAllAxis())
        self.addjson("idtotopics",getAllTopics())
        self.settemplate('pro.html')
        self.addpartials(['wheretheystand','topinterests','plugins','sentiment','interestlongtail','buzz','promain','socialanalysis'])
        super(ProHandler, self).any()

# Create routes.
ROUTES = [
          webapp2.Route(r'/pro<:.*>', ProHandler, handler_method='any'),
          ]

# Instantiate the webapp2 WSGI application.
app=common.env.startWSGIServer(ROUTES)

    


