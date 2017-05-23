
import base64
import datetime
import logging

import ipaddr
import webapp2

from config import webapp2config
from data.store import getById
import common
import model


subnets = {}
#Localhost
subnets['127.0.0.1'] = ipaddr.IPNetwork('127.0.0.1')
#FB
subnets['2401:db00:'] = ipaddr.IPNetwork('2401:db00::/32')
subnets['2620:0:1c:'] = ipaddr.IPNetwork('2620:0:1c00::/40')
subnets['2a03:2880:'] = ipaddr.IPNetwork('2a03:2880::/32')
#TWITTER
subnets['199.16.156'] = ipaddr.IPNetwork('199.16.156.0/24')
subnets['199.59.148'] = ipaddr.IPNetwork('199.59.148.0/24')
subnets['199.59.149'] = ipaddr.IPNetwork('199.59.149.0/24')

timediff = datetime.timedelta(days=14)

class ShareImage(webapp2.RequestHandler):
    
    def get(self, imageid):
        share = getById(model.Share, imageid)
        ip = self.request.remote_addr
        ipprefix = ip[:10]
        logging.debug(ip)
        if not ipprefix in subnets:
            self.error(404)
        ip = ipaddr.IPAddress(self.request.remote_addr)
        if not ip in subnets[ipprefix]:
            self.error(404)
            
        if share is not None:
            now = datetime.datetime.now()
            self.oldestallowed = now-timediff
            if share.created < self.oldestallowed:
                share.key.delete()
                self.error(404)
            
            pngbinary = base64.b64decode(share.imagedataurl.split('base64')[1])
            self.response.headers['Content-Type'] = 'image/png'
            self.response.out.write(pngbinary)
        else:
            self.error(404)            

# Create routes.
ROUTES = [webapp2.Route(r'/shareimage/<imageid>', ShareImage, handler_method='get'),]

# Instantiate the webapp2 WSGI application.
app=common.env.startWSGIServer(ROUTES)



