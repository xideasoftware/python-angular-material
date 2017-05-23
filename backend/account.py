import json
import logging
import md5

from google.appengine.api import mail
from google.appengine.ext import ndb
from webapp2_extras import auth
from webapp2_extras.auth import InvalidAuthIdError, InvalidPasswordError
import webapp2

from common.cache import Cache
from common.env import isProduction
from common.web import AbstractHandler
from config import VISITORTRANSACTIONRETRIES
from config import webapp2config
from data.visitor import mergevisitors
from main import MainHandler
import authmodels
import model

class AccountHandler(MainHandler ):
    
    def any(self, dummy):
        #promote out of the iframe post parameters into session variables
        referer = self.request.params.get('referer', None )
        if referer is None:
            referer = self.session.get('referer', None)
        if type(referer) is unicode:
            referer = referer.encode('ascii')       
        if referer is None and self.request.referer is not None:
            referer = self.request.referer.encode('ascii')    
        self.session['referer'] = referer
        super(AccountHandler, self).any()

@Cache()
def getLegacyNames():
    names = set()
    for a in authmodels.User.query(authmodels.User.legacypassword != None).fetch():
        names.add(a.auth_ids[0])
        if hasattr(a,'email_address'):
            names.add(a.email_address)
        if hasattr(a,'email'):
            names.add(a.email)
    return names

class AuthHandler(AbstractHandler):
    @webapp2.cached_property 
    def auth(self):
        return auth.get_auth()
 
    @webapp2.cached_property
    def user_info(self):
        return self.auth.get_user_by_session()
 
    @webapp2.cached_property
    def user(self):
        u = self.user_info
        return self.user_model.get_by_id(u['user_id']) if u else None
 
    @webapp2.cached_property
    def user_model(self):
        return self.auth.store.user_model
    
    def visitorkey(self, check=True):
        visitorid = self.session.get("visitorid", None)
        if isinstance(visitorid, (str, unicode)):
            visitorid = int(visitorid)
        return model.Visitor.get_by_id(visitorid).key if check else ndb.Key(model.Visitor, visitorid)

class DetailHandler(AuthHandler):
    
    @ndb.transactional(xg=True, retries=VISITORTRANSACTIONRETRIES)
    def post(self):
        visitor = self.visitorkey().get()
        provider_name='pd'
        provideridentity = None
        for identity in visitor.identities:
            if identity.provider == provider_name:
                provideridentity = identity
        if isinstance(provideridentity.external_id, ndb.Key):
            provideridentity.external_id = provideridentity.external_id.id()
            visitor.put()
        user=ndb.Key('User',provideridentity.external_id).get()
        userdict={}
        if user is None or len(user.auth_ids) == 0:
            user = authmodels.User(email = visitor.email, auth_ids=(visitor.name,), name = visitor.name)
            provideridentity.provider = 'oldpd' 
            newprovideridentity = model.Identity(provider = provider_name)
            visitor.identities.append(newprovideridentity)
            newprovideridentity.name = provideridentity.name
            newprovideridentity.external_id = user.put().id()
            newprovideridentity.email = provideridentity.email
            visitor.put()
        userdict['email_address'] = user.email
        userdict['username'] = user.auth_ids[0]
        userdict['name'] = user.name
        userdict['area'] = user.area
        self.SendJson({"user":userdict})

class SaveUserDetailsHandler(AuthHandler):
    
    @ndb.transactional(xg=True, retries=VISITORTRANSACTIONRETRIES)
    def post(self):
        visitor = self.visitorkey().get()
        provider_name='pd'
        provideridentity = None
        for identity in visitor.identities:
            if identity.provider == provider_name:
                provideridentity = identity
        user = authmodels.User.get_by_id(provideridentity.external_id)
        user.email_address = self.request.get('email')
        user.email = self.request.get('email')
        user.name = self.request.get('name')
        user.area = self.request.get('area')
        user.put()
        msg = "Your details were updated"
        self.SendJson({"message":msg})
        
class SignupMeUpHandler(AuthHandler):
 
    def post(self):
        posted = json.loads(self.request.body)
        user_name = posted['username']
        email = posted['email']
        password = posted['password']

        if not mail.is_email_valid(email):
            self.SendJson({"message":'Email is not valid %s' % email, "isloggedin":False, "username":user_name})
 
        user_data = self.user_model.create_user(user_name,
                                                [],
                                                password_raw=password, email=email,
                                                verified=False)
        if not user_data[0]: #user_data is a tuple
            self.SendJson({"message":'Unable to create user %s for email %s because it already exists' % (user_name, email), "isloggedin":False, "username":user_name})
            return
 
        user = user_data[1] 
        
        #associate with visitor

        visitor = self.visitorkey().get()
        
        provider_name='pd'
        provideridentity = None
        for identity in visitor.identities:
            if identity.provider == provider_name:
                provideridentity = identity
        if provideridentity is None:
            provideridentity = model.Identity(provider = provider_name)
            visitor.identities.append(provideridentity)
        provideridentity.name = user.auth_ids[0]
        visitor.name = user.auth_ids[0]
        provideridentity.external_id = user.get_id()
        provideridentity.email = user.email
        visitor.put()
        self.session['visitorid'] = visitor.key.id()
        self.session['username'] = visitor.name    
                
        self.sendConfirmEmail(user)
        msg = "Thanks for Registering!  A registration confirmation email has been sent to %s" % email 
        self.SendJson({"message":msg, "isloggedin":True, "username":user_name})
        # Set P3P header
        # Save all sessions.
        self.session_store.save_sessions(self.response)

    def sendConfirmEmail(self, user):
        user_id = user.get_id()
        token = self.user_model.create_signup_token(user_id)
        email = user.email
        confirmation_url = "https://www.positiondial.com/confirmuseremail/v/%s/%s" % (user_id,token)
        sender_address = "PositionDial.com <info@positiondial.com>"
        subject = "Confirm your registration"
        body = """Welcome to PositionDial. Thank you for registering!Please confirm your email address by clicking on the link below:%s""" % confirmation_url
        mail.send_mail(sender_address, email, subject, body)

class SignInHandler(AuthHandler):

    def post(self):
        posted = json.loads(self.request.body)
        username = posted['username']
        password = posted['password']
        try:
            self.signin(username, password)
        except (InvalidAuthIdError, InvalidPasswordError) as e:
            rawuserlist = authmodels.User.query(ndb.OR(authmodels.User.auth_ids==username,authmodels.User.email==username)).fetch(1)
            if len(rawuserlist) == 1:
                if not username in getLegacyNames(): # give legacy users a fighting chance
                    logging.info("Logging in by email "+username)
                    try:
                        self.signin(rawuserlist[0].auth_ids[0], password)
                        return
                    except (InvalidAuthIdError, InvalidPasswordError) as e:
                        pass
                else:
                    legacyuser = rawuserlist[0]
                    oldhash=md5.new(password).hexdigest()
                    if legacyuser.legacypassword == oldhash:
                        logging.warn("legacy login by "+username)
                        legacyuser.set_password(password)
                        legacyuser.legacypassword = None
                        legacyuser.put()
                        try:
                            self.signin(username, password)
                            msg = "You are now logged in" 
                            self.SendJson({"message":msg, "isloggedin":True, "username":username})
                            return
                        except (InvalidAuthIdError, InvalidPasswordError) as e:
                            pass
            msg = 'Could not find a user %s with that password' % username
            logging.info(msg)
            self.SendJson({"message":msg, "isloggedin":False, "username":""})

    def signin(self, username, password):
        user = self.auth.get_user_by_password(username, password, remember=False)            
        external_id = user['user_id']
        logging.info("PD User %s tried to signin", external_id)
        visitorquery = model.Visitor.query().filter(model.Visitor.identities.external_id == external_id)
        visitor = None
        for avisitor in visitorquery:
            for aidentity in avisitor.identities:
                if aidentity.provider == 'pd':
                    visitor = avisitor  
                    logging.info("PD User %s had a corresponding visitor %s " % (external_id, visitor.key.id()))
        requestvisitorkey = self.visitorkey(check=False)
        if visitor is None:
            logging.info("PD User %s couldnt find a corresponding visitor but this key is %s " % (external_id, requestvisitorkey))
            visitor = requestvisitorkey.get()
            if visitor is None:
                if self.request.referer is None:
                    referer=self.request.url.encode('ascii')
                else:
                    referer=self.request.referer.encode('ascii')
                visitor = model.Visitor(key=self.visitorkey, referer = referer)
        else:
            #merge new visitor to existing visitor and remove
            newvisitor = requestvisitorkey.get()
            if newvisitor is not None:
                if visitor.key.id() != newvisitor.key.id(): 
                    logging.info("PD User %s had built a second visitor %s, merging with existing %s " % (external_id, newvisitor.key.id(), visitor.key.id()))
                    if len(newvisitor.identities) > 0:
                        logging.error("PD User %s abandoning merging with second visitor as already had identities " % (external_id, newvisitor.key.id()))
                    else:
                        mergevisitors(visitor, newvisitor)

        #add pd identity if its missing
        provideridentity = None
        for identity in visitor.identities:
            if identity.provider == "pd":
                provideridentity = identity
        if provideridentity is None:
            provideridentity = model.Identity(provider = "pd")
            visitor.identities.append(provideridentity)
        provideridentity.name = username
        provideridentity.external_id = external_id
        provideridentity.email = None
        if visitor.name is None:
            visitor.name = provideridentity.name
        visitor.put()
        self.session['visitorid'] = visitor.key.id()
        self.session['username'] = visitor.name        
        
        msg = "You are now signed-in" 
        self.SendJson({"message":msg, "isloggedin":True, "username":username})
        self.session_store.save_sessions(self.response)

class ErrorHandler(MainHandler):
    def any(self, *args, **kwargs):
        super(ErrorHandler, self).any()


class ResetPasswordHandler(MainHandler):
    def any(self, *args, **kwargs):
        user = None
        user_id = kwargs['user_id']
        reset_token = kwargs['reset_token']
        super(ResetPasswordHandler, self).any()

class ResetPasswordRestHandler(SignInHandler):
    def post(self, *args, **kwargs):

        user_id = self.request.get('user_id')
        reset_token = self.request.get('token')
        password = self.request.get('password')
 
        if not self.user_model.validate_signup_token(int(user_id), reset_token):
            logging.info("Password reset email has expired")
            msg="Password reset email has expired - please request another"
            self.SendJson({"message":msg, "isloggedin":False, "username":None})
            return
        
        user = self.user_model.get_by_id(int(user_id))
        user.set_password(password)
        user.put()
        # remove signup token, we don't want users to come back with an old link
        self.user_model.delete_signup_token(user.get_id(), reset_token)
 
        super(ResetPasswordRestHandler, self).signin(user.auth_ids[0], password)

class SendPasswordResetHandler(AuthHandler):

    def post(self):
        username = self.request.get('username')
        userlist = authmodels.User.query(ndb.OR(authmodels.User.auth_ids==username,authmodels.User.email==username)).fetch(1)
        if len(userlist) == 0:
            self.SendJson({"message":'Could not find %s' % username})
            return
        user = userlist[0]        
        msg = self.sendResetEmail(user)
        self.SendJson({"message":msg, "isloggedin":False})
    
    def sendResetEmail(self, user):
        user_id = user.get_id()
        token = self.user_model.create_signup_token(user_id)
        email = user.email
        if email is None or email.strip() == "":
            return 'No e-mail registered with %s' % user.name       
        confirmation_url = "http://www.positiondial.com/account/resetpassword/p/%s/%s" % (user_id,token)
        sender_address = "PositionDial.com <info@positiondial.com>"
        subject = "Password Reset Request"
        body = """Click on the link below to carry out a password reset for PositionDial.com Please ignore this email if you did not request this password reset%s""" % confirmation_url
        mail.send_mail(sender_address, email, subject, body)
        return "We've sent a password reset mail to %s, thanks!" % user.email

# Create routes.
ROUTES = [webapp2.Route(r'/account/signmeup', SignupMeUpHandler, handler_method='post'),
          webapp2.Route(r'/account/signin', SignInHandler, handler_method='post'),
          webapp2.Route(r'/account/detail', DetailHandler, handler_method='post'),
          webapp2.Route(r'/account/error', ErrorHandler, handler_method='any'),
          webapp2.Route(r'/account/sendpasswordreset', SendPasswordResetHandler, handler_method='post'),
          webapp2.Route(r'/account/saveuserdetails', SaveUserDetailsHandler, handler_method='post'),
          webapp2.Route(r'/account/resetpassword/<type:v|p>/<user_id:\d+>/<reset_token:.+>', ResetPasswordHandler, handler_method='any'),
          webapp2.Route(r'/account/resetpasswordservice', ResetPasswordRestHandler, handler_method='post'),
          webapp2.Route(r'/account<:.*>', AccountHandler, handler_method='any'),
          ]
# Instantiate the webapp2 WSGI application.
app=webapp2.WSGIApplication(ROUTES, debug=not isProduction(), config=webapp2config)
