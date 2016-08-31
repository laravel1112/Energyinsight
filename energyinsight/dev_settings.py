import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# SECURITY WARNING: don't run with debug turned on in production!

DEBUG = True
TEMPLATE_DEBUG = False
ALLOWED_HOSTS = ['*']

#LOCALHOST_SETTINGS = "http://127.0.0.1:8009"
#WEATHER_EU_ID = '88'

# Internationalization
# https://docs.djangoproject.com/en/1.7/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Database
# https://docs.djangoproject.com/en/1.7/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
	'NAME': os.path.join(BASE_DIR, 'db.sqlite3')
    }
}
