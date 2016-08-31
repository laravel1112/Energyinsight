import base64
import logging

from django.contrib.auth import authenticate, login
from datetime import datetime, timedelta

from jwt_auth.mixins import JSONWebTokenAuthMixin
from jwt_auth.utils import jwt_decode_handler, get_authorization_header, jwt_encode_handler
from jwt_auth.exceptions import AuthenticationFailed
from jwt_auth import settings

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s',
                    datefmt='%m-%d %H:%M',
                    filename='logfile.log',
                    filemode='w')
console = logging.StreamHandler()
console.setLevel(logging.INFO)
formatter = logging.Formatter('%(levelname)-8s %(message)s')
console.setFormatter(formatter)
logging.getLogger('').addHandler(console)


class jwtMiddleware():

    @staticmethod
    def process_request(request):
        if 'HTTP_AUTHORIZATION' in request.META:
            header = get_authorization_header(request).split()
            if header is not None:
                if header[0].lower() == "basic":
                    username, password = base64.b64decode(header[1]).split(":")
                    user = authenticate(username=username, password=password)
                    if user is not None and user.is_active:
                        login(request, user)
                elif header[0].lower() == settings.JWT_AUTH_HEADER_PREFIX.lower():
                    # use jwt auth
                    try:
                        auth = JSONWebTokenAuthMixin().authenticate(request)
                        if auth is not None:
                            user = auth[0]
                            user.backend = 'django.contrib.auth.backends.ModelBackend'
                            login(request, user)
                    except AuthenticationFailed as e:
                        logging.exception(e)
        return None

    @staticmethod
    def process_response(request, response):
        if 'HTTP_AUTHORIZATION' in request.META:
            try:
                auth_indicator = JSONWebTokenAuthMixin().authenticate(request)
            except AuthenticationFailed as e:
                logging.exception(e)
                return response
            if auth_indicator is None:
                return response
            token = auth_indicator[1]
            token = jwt_decode_handler(token)
            exp = token['exp']
            exp = datetime.fromtimestamp(exp)
            if exp - timedelta(0, 3600) < datetime.now():
                # expiring in one hour
                # renew the token
                from jwt_auth import settings
                token['exp'] = datetime.utcnow() + settings.JWT_EXPIRATION_DELTA
                token = jwt_encode_handler(token)
                newtoken = settings.JWT_AUTH_HEADER_PREFIX + " " + token
                response['HTTP_AUTHORIZATION'] = newtoken
        return response
