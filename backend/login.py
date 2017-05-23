
from urlparse import urlparse
import logging
import random
import string

import webapp2

from authomatic import Authomatic
from authomatic.adapters import Webapp2Adapter
from common.web import BaseHandler
from config import CONFIG
from config import webapp2config
from data.store import getById
from data.visitor import mergevisitors
import model


# Instantiate Authomatic.
authomatic = Authomatic(config=CONFIG, secret='7f8d3a6c-ab96-22d5-9ce6-0a7b3f9e5d41', debug=True)

# Create a simple request handler for the login procedure.
class Login(BaseHandler):
    
    # The handler must accept GET and POST http methods and
    # Accept any HTTP method and catch the "provider_name" URL variable.
    def any(self, provider_name):
                
        #promote out of the iframe post parameters into session variables
        referer = self.requestParam('referer') 
        if referer is None:
            referer = self.session.get('referer', None)
        if referer is None or (self.request.referer is not None and "positiondial.com" in urlparse(self.request.referer).netloc):
            if self.requestParam('referer') is None or "positiondial.com" not in urlparse(self.requestParam('referer')).netloc:
                referer = self.request.referer
        if type(referer) is unicode:
            referer = referer.encode('UTF-8')          
        self.session['referer'] = referer
        visitorid = self.session.get('visitorid', None)    
        # It all begins with login.
        if provider_name == 'ptw':
            self.redirect("/login/tw?"+self.request.query)
            return

        
        result = authomatic.login(Webapp2Adapter(self), provider_name)
        
        # Do not write anything to the response if there is no result!
        if result:
            # If there is result, the login procedure is over and we can write to response.
            
            if result.error:
                # Login procedure finished with an error.
                self.abort(404)
            
            elif result.user:
                creds=authomatic.credentials(result.user.credentials)
                # Test auto tweet
                
                # OAuth 2.0 and OAuth 1.0a provide only limited user data on login,
                # We need to update the user to get more info.
                if not (result.user.name and result.user.id):
                    result.user.update()
                visitorquery = model.Visitor.query().filter(model.Visitor.identities.external_id == result.user.id, model.Visitor.identities.provider == provider_name)
                visitor = visitorquery.get()                   
                newvisitor = getById('Visitor', visitorid)
                
                #merge new visitor to existing visitor and remove
                if newvisitor != visitor:                    
                    if visitor is not None:
                        if newvisitor is not None:
                            mergevisitors(visitor, newvisitor)
                    else: #shouldn't ever get here unless you've a messed up account like mine
                        visitor = newvisitor
                
                if visitor is None:
                    visitor = model.Visitor()
                    
                pdprovideridentity = None
                provideridentity = None
                    
                for identity in visitor.identities:
                    if identity.provider == provider_name:
                        provideridentity = identity
                    if identity.provider == 'pd':
                        pdprovideridentity = identity
                        
                if provideridentity is None:
                    provideridentity = model.Identity(provider = provider_name)
                    visitor.identities.append(provideridentity)

                #if we found this provider, update the details
                provideridentity.name = result.user.name
                provideridentity.external_id = result.user.id
                provideridentity.email = result.user.email
                    
                #if there's no positiondial account, create one 
                if pdprovideridentity is None:   
                    try:
                        randompass = id_generator(size=16)
                        user_data = self.user_model.create_user(result.user.name,
                                                [],
                                                password_raw=randompass, email=provideridentity.email,
                                                verified=False)
                        if user_data[0]:
                            user = user_data[1] 
                            pdprovideridentity = model.Identity(provider = 'pd')
                            pdprovideridentity.name = user.auth_ids[0]
                            pdprovideridentity.external_id = user.get_id()
                            pdprovideridentity.email = user.email
                            visitor.identities.append(pdprovideridentity)
                    except Exception as e:
                        logging.exception(e)
                        pass
                
                #if there's no nickname (visitor name) take it from this identity
                if visitor.name is None:
                    visitor.name = provideridentity.name
                    

                if type(visitor.referer) is unicode:
                    visitor.referer = visitor.referer.encode('UTF-8')          

                #now save
                try:
                    visitor.put()
                except Exception as e:
                    replacementvisitor = model.Visitor(id=visitor.key.id())
                    mergevisitors(replacementvisitor, visitor)
                    replacementvisitor.put()
                    logging.debug(e)

                if result.provider.name == 'tw':
                    self.session['twittertoken'] = creds.token
                    self.session['twittersecret'] = creds.token_secret
                    self.session['twitterloggedin'] = True

                if result.provider.name == 'fb':
                    self.session['facebookloggedin'] = True

                self.session['visitorid'] = visitor.key.id()
                self.session['username'] = visitor.name
                self.redirect(referer)
                logging.info("Redirecting login to "+referer)
                self.session['referer']=None
                return
                
                # Seems like we're done, but there's more we can do...
                
                # If there are credentials (only by AuthorizationProvider),
                # we can _access user's protected resources.
                if result.user.credentials:
                    
                    # Each provider has it's specific API.
                    if result.provider.name == 'fb':
                        self.response.write('Your are logged in with Facebook.<br />')
                        
                        # We will access the user's 5 most recent statuses.
                        url = 'https://graph.facebook.com/{}?fields=feed.limit(5)'
                        url = url.format(result.user.id)
                        
                        # Access user's protected resource.
                        response = result.provider.access(url)
                        
                        if response.status == 200:
                            # Parse response.
                            statuses = response.data.get('feed').get('data')
                            error = response.data.get('error')
                            
                            if error:
                                self.response.write(u'Damn that error: {}!'.format(error))
                            elif statuses:
                                self.response.write('Your 5 most recent statuses:<br />')
                                for message in statuses:
                                    
                                    text = message.get('message')
                                    date = message.get('created_time')
                                    
                                    self.response.write(u'<h3>{}</h3>'.format(text))
                                    self.response.write(u'Posted on: {}'.format(date))
                        else:
                            self.response.write('Damn that unknown error!<br />')
                            self.response.write(u'Status: {}'.format(response.status))
                        
                    if result.provider.name == 'tw':
                        self.response.write('Your are logged in with Twitter.<br />')
                        
                        # We will get the user's 5 most recent tweets.
                        url = 'https://api.pdtwitter.com/1.1/statuses/user_timeline.json'
                        
                        # You can pass a dictionary of querystring parameters.
                        response = result.provider.access(url, {'count': 5})
                                                
                        # Parse response.
                        if response.status == 200:
                            if type(response.data) is list:
                                # Twitter returns the tweets as a JSON list.
                                self.response.write('Your 5 most recent tweets:')
                                for tweet in response.data:
                                    text = tweet.get('text')
                                    date = tweet.get('created_at')
                                    
                                    self.response.write(u'<h3>{}</h3>'.format(text.replace(u'\u2013', '[???]')))
                                    self.response.write(u'Tweeted on: {}'.format(date))
                                    
                            elif response.data.get('errors'):
                                self.response.write(u'Damn that error: {}!'.\
                                                    format(response.data.get('errors')))
                        else:
                            self.response.write('Damn that unknown error!<br />')
                            self.response.write(u'Status: {}'.format(response.status))

def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

# Create routes.
ROUTES = [webapp2.Route(r'/login/<:.*>', Login, handler_method='any'),]
# Instantiate the webapp2 WSGI application.
app = webapp2.WSGIApplication(ROUTES, debug=True, config=webapp2config)


