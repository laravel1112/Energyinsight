"""
Django settings for energyinsight project.

For more information on this file, see
https://docs.djangoproject.com/en/1.7/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.7/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)

import os
import datetime
BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# SECURITY WARNING: don't run with debug turned on in production!

DEBUG = True
TEMPLATE_DEBUG = True
ALLOWED_HOSTS = ['*']

# LOCALHOST_SETTINGS = "http://localhost:8000"

# Database
# https://docs.djangoproject.com/en/1.7/ref/settings/#databases

DATABASES = {
    'postgresql': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'energyinsight',                      
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'localhost',
        'PORT': '5432',
    },
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}


# Internationalization
# https://docs.djangoproject.com/en/1.7/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Shanghai'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Influx API URL
INFLUXDB_URL = 'http://52.0.184.153:8086/db/Testdb/series'
INFLUXDB_HOST_NAME = '52.0.184.153'
INFLUXDB_HOST_PORT = 8086
INFLUXDB_USERNAME = 'user1'
INFLUXDB_PASSWORD = 'user1'
INFLUXDB_DATABASE = 'Testdb'


#JWT token auth
JWT_EXPIRATION_DELTA = datetime.timedelta(seconds=7200) #2 hours
JWT_SECRET_KEY="L2938465YQWENNZXCJFOIEWT"
# CORS ALLOW-ORIGIN
CORS_ORIGIN_ALLOW_ALL = True
#CORS_ORIGIN_WHITELIST = ('google.com','hostname.example.com')
