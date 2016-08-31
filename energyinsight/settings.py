import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

import django.conf.global_settings as DEFAULT_SETTINGS


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'eaq-v-^4ptoq4!y49evfogr7dm8f(b-a6g3+&m!nfoz_j3)!*a'


CELERY_RESULT_BACKEND='djcelery.backends.database.DatabaseBackend'
BROKER_URL = 'amqp://guest:guest@localhost//'
CELERY_SEND_EVENTS = True
CELERYBEAT_SCHEDULER="djcelery.schedulers.DatabaseScheduler"
CELERY_ALWAYS_EAGER=False
CELERY_DISABLE_RATE_LIMITS = True
CELERY_ACCEPT_CONTENT = ['pickle']
CELERY_TIMEZONE = 'Asia/Shanghai'
CELERY_TASK_RESULT_EXPIRES = 1*86400


from kombu import Queue
CELERY_DEFAULT_QUEUE = 'low'
CELERY_QUEUES = (
    Queue('Low', routing_key='low'),
    Queue('High',    routing_key='high'),
)

CELERY_ROUTES = {
        # 'optimizer.tasks.task1': {'queue': 'low', 'routing_key': 'low',},
        # 'optimizer.tasks.task3': {'queue': 'high', 'routing_key': 'high',},
        # 'optimizer.tasks.scheduler': {'queue': 'scheduler', 'routing_key': 'scheduler',},
}

# # List of modules to import when celery starts (I replaced it with autodiscover across all modules in celery.py)
# CELERY_IMPORTS = ('scheduler.tasks', )
#
# ## Using the database to store task state and results.
# CELERY_RESULT_BACKEND = 'db+sqlite:///results.db

import djcelery
djcelery.setup_loader()



# Application definition

INSTALLED_APPS = (
    'grappelli',
    'django_gulp', # gulp tasks
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_extensions',
    'revproxy',
    'tinymce',

    'hijack',
    'compat',
    
    #external apps
    'djcelery',
    # 'djkombu',
    'crispy_forms',
    'djsupervisor',
    'crequest',

    'common',
    'backend',
    'optimizer',
    'top',
    'alert',
    'utils', #to allow import functions from it to celery
)
PROXY_API_KEYS = [
# Add the API KEYS you wish to allow consuming services
# API KEYS are required. Services cannot be consumed without an API KEY
]
MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'backend.jwtMiddleware.jwtMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'crequest.middleware.CrequestMiddleware',
)

TEMPLATE_CONTEXT_PROCESSORS = DEFAULT_SETTINGS.TEMPLATE_CONTEXT_PROCESSORS + (
    'django.core.context_processors.request',
    'common.context_processors.user',
    'common.context_processors.faq',
)

ROOT_URLCONF = 'energyinsight.urls'

WSGI_APPLICATION = 'energyinsight.wsgi.application'

CRISPY_TEMPLATE_PACK = 'bootstrap3'

LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = 'index'
API_LIMIT_PER_PAGE = 0
TASTYPIE_DEFAULT_FORMATS=['json']

LOCALHOST_SETTINGS = 'http://localhost:8000'
WEATHER_EU_ID = '87'


# hijack settings.py
HIJACK_LOGIN_REDIRECT_URL = '/'  # Where admins are redirected to after hijacking a user
REVERSE_HIJACK_LOGIN_REDIRECT_URL = '/admin/auth/user/'
HIJACK_USE_BOOTSTRAP = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.7/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


TINYMCE_DEFAULT_CONFIG = {

'theme': "advanced",
'theme_advanced_buttons1' : "save,newdocument,|,bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,|,styleselect,formatselect,fontselect,fontsizeselect",
'theme_advanced_buttons2' : "cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo,|,link,unlink,anchor,image,cleanup,help,code,|,insertdate,inserttime,preview,|,forecolor,backcolor",
'theme_advanced_buttons3' : "tablecontrols,|,hr,removeformat,visualaid,|,sub,sup,|,charmap,emotions,iespell,media,advhr,|,print,|,ltr,rtl,|,fullscreen",
# 'theme_advanced_buttons4' : "insertlayer,moveforward,movebackward,absolute,|,styleprops,spellchecker,|,cite,abbr,acronym,del,ins,attribs,|,visualchars,nonbreaking,template,blockquote,pagebreak,|,insertfile,insertimage",
'theme_advanced_toolbar_location' : "top",
'theme_advanced_toolbar_align' : "left",
'theme_advanced_statusbar_location' : "bottom",
'theme_advanced_resizing' : "true",
'theme_advanced_fonts' : "ProximaNovaRegular",

}
DEFAULT_FROM_EMAIL = 'noreply@equotaenergy.com'
EMAIL_HOST = 'smtp.exmail.qq.com'
EMAIL_PORT = '465'
EMAIL_HOST_USER = 'noreply@equotaenergy.com'
EMAIL_HOST_PASSWORD = 'NOreply2015'
#EMAIL_USE_TLS = True
EMAIL_USE_SSL=True
NOTIFICATION_EMAILS = ['ningke@gmail.com', 'han.lai321@gmail.com', ]

try:
    from .local_settings import *
except:
    pass

# try:
#     from .dev_settings import *
# except:
#     pass

try:
    from .production_settings import *
except:
    pass
