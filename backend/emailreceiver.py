
import logging

from google.appengine.ext.webapp.mail_handlers import InboundMailHandler
import webapp2

import common

class LogSenderHandler(InboundMailHandler):
    def receive(self, message):
        logging.info("Received a message from: " + message.sender)
        plaintext_bodies = message.bodies('text/plain')
        html_bodies = message.bodies('text/html')

        for content_type, body in html_bodies:
            logging.info(body.decode())
        
        for content_type, body in plaintext_bodies:
            logging.info(body.decode())
        
common.env.startWSGIServer([LogSenderHandler.mapping()])
        