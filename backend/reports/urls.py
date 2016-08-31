from django.conf.urls import patterns, include, url
from backend.reports import views
from backend.api import *


urlpatterns = patterns('',
    #to fix finding another row by "series" key word
    url(r'^monthly/(?P<id>\w+)/$', views.getMonthlyData),
)
