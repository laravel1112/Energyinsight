from django.conf import settings
from django.conf.urls import patterns, include, url
from django.contrib import admin
from common import views as common_views
from django.views.generic.base import RedirectView

from django.contrib.staticfiles.urls import staticfiles_urlpatterns 


urlpatterns = patterns('',
    #url(r'^$', common_views.index, name='index'),
    # url(r'^home/',common_views.home,name='home'),
    # url(r'^charts/', common_views.chart, name='chart_index'),
    # url(r'^report/', common_views.energy_report, name='energy_report'),
    # url(r'^recommendation/', common_views.recommendation, name='recommendation'),
    # url(r'^user_admin/', common_views.user_admin, name='user_admin'),
    url (r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT}),

    url(r'^$', common_views.angular,name='home'),
    url(r'^home/',common_views.angular,name='home'),
    url(r'^charts/', common_views.angular, name='chart_index'),
    url(r'^reports/', common_views.angular, name='energy_report'),
    url(r'^recommendations/', common_views.angular, name='recommendation'),
    url(r'^user_admin/', common_views.angular, name='user_admin'),
    url(r'^account/', common_views.angular, name='account'),
    url(r'^api-token-auth/', 'jwt_auth.views.obtain_jwt_token'),
    # Django administration
    url(r'^admin/', include(admin.site.urls)),
    #url(r'^proxy/(?P<url>.*)$',common_views.proxyview),
    
    # Theme
    url(r'^change_theme/(?P<theme>\w+)/$', 'common.views.change_theme', name='change_theme'),

    # User accounts
    url(r'^login/$', common_views.angular,name='login'),
    #url(r'^login/$', 'django.contrib.auth.views.login', {'template_name': 'common/login.html'}, name='login'),
    url(r'^logout/$', 'django.contrib.auth.views.logout', {'next_page': '/login/'}, name='logout'),
    url(r'^$',RedirectView.as_view(url='/home/',permanent=False),name='index'),

    # back end API
    url(r'^api/', include('backend.urls')),

    #admin pages customization theme
    url(r'^grappelli/', include('grappelli.urls')),

    # angular
    url(r'^angular/',common_views.angular,name='home'),

    # hijack
    url(r'^hijack/', include('hijack.urls')),

    #for creating posts in blog
    url(r'^tinymce/', include('tinymce.urls')),
)

urlpatterns += staticfiles_urlpatterns()