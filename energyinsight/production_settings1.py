import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# SECURITY WARNING: don't run with debug turned on in production!

DEBUG = False
TEMPLATE_DEBUG = False
ALLOWED_HOSTS = ['*']

LOCALHOST_SETTINGS = "http://127.0.0.1:8009"
WEATHER_EU_ID = '88'

# Internationalization
# https://docs.djangoproject.com/en/1.7/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.7/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

STATICFILES_DIRS = (
    os.path.join(
         BASE_DIR,
    ),
)

# Database
# https://docs.djangoproject.com/en/1.7/ref/settings/#databases

DATABASES = {
    'default': {
        'NAME': 'maindb8',
        'ENGINE': 'django.db.backends.mysql',
        'HOST': '10.10.166.108',
        'PORT': '3306',
        'USER': 'root',
        'PASSWORD': 'Equotaenergy12#$',
    }
}
