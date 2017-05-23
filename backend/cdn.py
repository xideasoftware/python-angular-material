import logging
import os

from google.appengine.api import urlfetch
import PIL
import webapp2

from cachemodels import ImageCache
from common.cache import Cache
from common.env import isAppEngineDeploy, isProduction
from common.env import whereami
from common.filestorage import load, loadlocal
from common.web import currentversionid, isadmin
from config import webapp2config
import cStringIO as StringIO
import common

isprod = isProduction()

class CDNPartialHandler(webapp2.RequestHandler):
        
    def any(self,path):
        epath = os.path.join(whereami, 'app/partials/'+path)
        body = loadlocal(epath)
        if not isadmin():
            self.response.headers['cache-control'] = 'no-transform,public,max-age=60'
        self.response.write(body)

class CDNJS2MINHandler(webapp2.RequestHandler):
        
    def any(self, path):
        epath = os.path.join(whereami, 'app/jsmain/'+path+'.js')
        body = loadlocal(epath)
        if not isadmin():
            self.response.headers['cache-control'] = 'no-transform,public,max-age=60'
        self.response.headers['content-type'] = 'text/javascript'
        self.response.write(body)
        
class CDNJSControllersHandler(webapp2.RequestHandler):
    
    def any(self, path):
        epath = os.path.join(whereami, 'app/jscontrollers/'+path+'.js')
        logging.info("path = "+epath)
        body = loadlocal(epath)
        if not isadmin():
            self.response.headers['cache-control'] = 'no-transform,public,max-age=60'
        self.response.headers['content-type'] = 'text/javascript'
        self.response.write(body)    

class CDNBulkJSHandler(webapp2.RequestHandler):
        
    def any(self,path):
        body = load("/build/%s/%s" % (currentversionid,path))
        self.response.headers['content-type'] = 'text/javascript'
        self.response.write(body)

class CDNCSSHandler(webapp2.RequestHandler):
        
    def any(self,path):
        epath = os.path.join(whereami, 'app/css/'+path)
        body = loadlocal(epath)
        if not isadmin():
            self.response.headers['cache-control'] = 'no-transform,public,max-age=60'
        self.response.headers['content-type'] = 'text/css'
        self.response.write(body)

class CDNSVGHandler(webapp2.RequestHandler):
        
    def any(self,path):
        body = load("/%s" % (path))
        if not isadmin():
            self.response.headers['cache-control'] = 'no-transform,public,max-age=60'
        self.response.headers['content-type'] = 'image/svg+xml'
        self.response.write(body)

class CDNJPGHandler(webapp2.RequestHandler):
        
    def any(self,path):
        body = load("/%s" % (path))
        if not isadmin():
            self.response.headers['cache-control'] = 'no-transform,public,max-age=1800'
        self.response.headers['content-type'] = 'image/jpg'
        self.response.write(body)
  
@Cache(cls=ImageCache, shouldbepersistent=True)
def resizedimageifneeded(filename, path, backupbucketlocation, backuppath=None):
    try:
        if path is not None:
            body = load("/%s/%s" % (path, filename), immediate_call=True)
            return body
    except:
        pass
    #got here because image didn't exist               
    pathbits = filename.split(".")
    if len(pathbits) < 4 or pathbits[-1] != pathbits[-4]:
        raise Exception("not long enough")
    filename = ".".join(pathbits[:-3])
    (new_width, new_height) = (int(pathbits[-3]),int(pathbits[-2]))
    fullpath = ("/%s" % (filename)) if backuppath is None else ("/%s/%s" % (backuppath, filename))
    body = load(fullpath, bucket="/"+backupbucketlocation, immediate_call=True)
    buffer = StringIO.StringIO(body)
    img = PIL.Image.open(buffer)
    (width, height) = img.size
    if img.mode not in ('L', 'RGB', 'RGBA'):
        img = img.convert('RGB')
        (width, height) = img.size
    
    if height < 50 or width < 50:
        raise Exception("Image is not big enough!")
    
    new_ratio= float(new_height)/float(new_width)
    orig_ratio= float(height) / float(width)
                
    if orig_ratio < new_ratio:
        if orig_ratio * (1+LEEWAY) < new_ratio: 
            ratio=orig_ratio*(1+LEEWAY)
        else:
            ratio=new_ratio
        new_size=(int(new_height/ratio),new_height)
    else:
        if orig_ratio * (1-LEEWAY) > new_ratio: 
            ratio=orig_ratio*(1-LEEWAY)
        else:
            ratio=new_ratio
        new_size=(new_width,int(new_width*ratio))
           
    (actual_new_width,actual_new_height)=new_size

    sizedimg = img.resize(new_size, PIL.Image.ANTIALIAS)

    up=int((actual_new_height-new_height)*OFFSET)
    across=int((actual_new_width-new_width)*OFFSET)
    
    cropbox=(across,up,across+new_width,up+new_height)
    #print cropbox
    newimg=sizedimg.crop(cropbox) 
    
    output= StringIO.StringIO()
    newimg.save(output, "JPEG", quality=90)
    output.seek(0)
    binary = output.read()
    output.close()
    return binary

class CDNJPGArticleHandler(webapp2.RequestHandler):
        
    def any(self,path):
        try:
            if isAppEngineDeploy():
                body = resizedimageifneeded(path, "articleimg", "articleorigimg", None)
            else:
                result = urlfetch.fetch("http://www.positiondial.com/cdn/articleimg/"+path)
                body = result.content
            if not isadmin():
                self.response.headers['cache-control'] = 'no-transform,public,max-age=7200'
            self.response.headers['content-type'] = 'image/jpg'
            self.response.write(body)
        except Exception as e:
            logging.exception(e)
            self.abort(404)

class CDNJPGAuthorHandler(webapp2.RequestHandler):
        
    def any(self,path):
        try:
            if isAppEngineDeploy():
                body = resizedimageifneeded(path, "authorimg", "cdn.positiondial.com", "authorimg")
            else:
                result = urlfetch.fetch("http://www.positiondial.com/cdn/authorimg/"+path)
                body = result.content
            if not isadmin():
                self.response.headers['cache-control'] = 'no-transform,public,max-age=7200'
            self.response.headers['content-type'] = 'image/jpg'
            self.response.write(body)
        except Exception as e:
            logging.exception(e)
            self.abort(404)

class CDNPNGHandler(webapp2.RequestHandler):
        
    def any(self,path):
        body = load("/%s" % (path))
        if not isadmin():
            self.response.headers['cache-control'] = 'no-transform,public,max-age=1800'
        self.response.headers['content-type'] = 'image/png'
        self.response.write(body)

class CDNGIFHandler(webapp2.RequestHandler):
        
    def any(self,path):
        body = load("/%s" % (path))
        if not isadmin():
            self.response.headers['cache-control'] = 'no-transform,public,max-age=1800'
        self.response.headers['content-type'] = 'image/gif'
        self.response.write(body)

LEEWAY=0.025
OFFSET=0.3



ROUTES = [
    webapp2.Route(r'/cdn/partials/<path:.*>', CDNPartialHandler, handler_method='any'),
    webapp2.Route(r'/cdn/jsmain/<path:.*>.min.js', CDNJS2MINHandler, handler_method='any'),
    webapp2.Route(r'/cdn/jsmain/<path:.*>.js', CDNJS2MINHandler, handler_method='any'),
    webapp2.Route(r'/cdn/jscontrollers/<path:.*>.min.js', CDNJSControllersHandler, handler_method='any'),
    webapp2.Route(r'/cdn/jscontrollers/<path:.*>.js', CDNJSControllersHandler, handler_method='any'),
    webapp2.Route(r'/cdn/articleimg/<path:.*jpg>', CDNJPGArticleHandler, handler_method='any'),
    webapp2.Route(r'/cdn/authorimg/<path:.*jpg>', CDNJPGAuthorHandler, handler_method='any'),
    webapp2.Route(r'/cdn/css/<path:.*css>', CDNCSSHandler, handler_method='any'),
	webapp2.Route(r'/cdn/<path:.*svg>', CDNSVGHandler, handler_method='any'),
    webapp2.Route(r'/cdn/<path:.*jpg>', CDNJPGHandler, handler_method='any'),
    webapp2.Route(r'/cdn/<path:.*png>', CDNPNGHandler, handler_method='any'),
    webapp2.Route(r'/cdn/<path:.*gif>', CDNGIFHandler, handler_method='any'),
    webapp2.Route(r'/cdn/<path:.*pd.min.js>', CDNBulkJSHandler, handler_method='any')
    ]
# Instantiate the webapp2 WSGI application.
app=common.env.startWSGIServer(ROUTES)

