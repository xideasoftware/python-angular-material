
from datetime import datetime
from os import walk, path
import logging
import socket

from google.appengine.ext import ndb
from google.appengine.ext.webapp.util import run_wsgi_app
import webapp2

from common.env import isProduction
from common.q import getQConnection
from common.web import AbstractHandler
from config import webapp2config
from qpython import qtemporal, qtype
import common
import numpy as np


conn = None

def getConnection():
    global conn
    if conn is None:
        conn = socket.create_connection(('stats1.positiondial.com', 40049),60)
        conn.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
        conn.setsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)
        conn.settimeout(60)
        logging.info("made socket")
    return conn

class TestHandler1(AbstractHandler):

    def get(self):
        c = getQConnection("stats")
        self.response.write("%s<BR/>"% c(".z.d"))
        for v in np.array([ts for ts in c("10#.z.d")]):
            self.response.write("%s<BR/>"%v)
        self.response.write("%s<BR/>"% c(".z.p"))
        time = c("{x}",qtemporal.qtemporal(np.datetime64(datetime.now()), qtype=qtemporal.QTIMESTAMP))
        self.response.write("%s - %s<BR/>"% (type(time),time))
        for v in np.array([ts for ts in c("10#.z.p")]):
            self.response.write("%s<BR/>"%v)

        # Walk the tree.
        
class TestHandler2(AbstractHandler):

    @ndb.toplevel
    def get(self):
        self.c = getQConnection("stats")
        for r in [self.doquery(".z.p") for a in range(100)]:
            self.response.write("%s<BR/>"% r.get_result())
    
    @ndb.tasklet
    def doquery(self, q):
        return self.c(q)
    
class TestHandler3(AbstractHandler):

    def get(self):
        for r in [self.doquery(".z.p") for a in range(10)]:
            self.response.write("%s<BR/>"% r)
    
    def doquery(self, q):
        connection= getConnection()
        now = datetime.now()
        connection.sendall(q)
        res=connection.recv(len(q))
        logging.info(datetime.now() - now)
        return res
        
class TestHandler4(AbstractHandler):

    @ndb.toplevel
    def get(self):
        self.c = getConnection()
        for r in [self.publish(".z.p") for a in range(100)]:
            self.response.write("%s<BR/>"% datetime.now())
    
    @ndb.tasklet
    def publish(self, q):
        return self.c.sendall(q)        
# Create routes.
ROUTES = [webapp2.Route(r'/test/1', TestHandler1, handler_method='get'),
          webapp2.Route(r'/test/2', TestHandler2, handler_method='get'),
          webapp2.Route(r'/test/3', TestHandler3, handler_method='get'),
          webapp2.Route(r'/test/4', TestHandler4, handler_method='get'),
          ]

# Instantiate the webapp2 WSGI application.
app=common.env.startWSGIServer(ROUTES)
    