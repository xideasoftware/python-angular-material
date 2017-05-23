
import json
import logging

from google.appengine.api import taskqueue
import webapp2

from common.env import isProduction
from common.filecache import needsminifyjs, sendminify
from common.filestorage import load, save, listfiles
from common.web import filepreload
from config import webapp2config
import common


class RebuildPageCache(webapp2.RequestHandler):
    
    #
    #Watch channel identifier: static
    #Canonicalized resource identifier: Hsdu7ycT7IVG6c_-cByKVj7lMbs
    #Client state token: h4t678h43gt86g3h9879j3r0
    #
    def any(self):
        #updating cdn.positiondial.com articles/45370.html exists
        resource_state = self.request.headers['X-Goog-Resource-State']
        if resource_state == 'sync':
            logging.info('Sync message received.')
        else:
            an_object = json.loads(self.request.body)
            bucket = an_object['bucket']
            resource = str(an_object['name'])
            logging.info('updating %s %s %s', bucket, resource, resource_state)
            try:
                if resource.startswith("build"):
                    listfiles("/"+"/".join(str(resource).split("/")[:-1])+"/")                   
                    if resource.endswith("js") and not ".min." in resource:
                        (needs, newfile, originalbody) = needsminifyjs(resource)
                        if needs:
                            save(newfile, originalbody)                            
                            taskqueue.add(url='/securenotify/'+resource, queue_name='reminify')
                        load("/"+resource)
                    if resource.endswith(".min.js"):
                        load("/"+resource)
                        filepreload(True)
                        filepreload(False)
                    if resource.endswith("html"):
                        load("/"+resource)
                        filepreload(True)
                        filepreload(False)
                if resource.startswith("optimized"):
                    load("/"+resource)
                    filepreload(True)
                    filepreload(False)
                elif "img" in resource.split("/")[0]:
                    load("/"+resource)
            except Exception as e:
                logging.exception(e)
                    


class ReminifyPageCache(webapp2.RequestHandler):
    
    def any(self, resource):
        if ".min.min" in resource:
            logging.warn("ignoring "+resource)
            return
        
        (needs, newfile, data) = needsminifyjs(resource)
        if not needs:
            return
        try:
            logging.debug("Minifying "+resource)
            data = sendminify(data)
        except Exception as e:
            logging.exception(e)
        logging.debug("New file:\n"+data)
        save(newfile, data)
            
# Create routes.
ROUTES = [
          webapp2.Route(r'/securenotify/<resource:.*>', ReminifyPageCache, handler_method='any'),
          webapp2.Route(r'/securenotify', RebuildPageCache, handler_method='any'),
          ]

# Instantiate the webapp2 WSGI application.
app=common.env.startWSGIServer(ROUTES)
