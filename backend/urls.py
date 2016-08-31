from django.conf.urls import patterns, include, url
from backend import models
from backend import views
from backend.api import *


urlpatterns = patterns('',

    #to fix finding another row by "series" key word
    url(r'^getseries/(?P<id>\w+)/$', views.getSeries),
    url(r'^getweather/(?P<id>\w+)/$', views.getWeather),
    url(r'^putseries/(?P<id>\w+)/$', views.putSeries),
    url(r'^events',views.getEvents),
    url(r'^predictseries/(?P<id>\w+)/$', views.predictSeries),
    url(r'^stratege/0/',views.strategeTest),
    url(r'^geocoder/',views.geocoder),

    url(r'^', include(EnergyUnitResource().urls)),
    url(r'^', include(UnitTypeResource().urls)),
    url(r'^', include(CampusParamResource().urls)),
    url(r'^', include(BuildingParamResource().urls)), 
    url(r'^', include(MeterParamResource().urls)),

    url(r'^', include(SegmentationResource().urls)),
    url(r'^', include(CategoryResource().urls)),
    url(r'^', include(OptimizerTypeResource().urls)),
    url(r'^', include(ValueResource().urls)),
    url(r'^', include(TimePeriodResource().urls)),
    url(r'^', include(IntervalResource().urls)),
    url(r'^', include(OptimizerTaskResource().urls)),
    url(r'^', include(CrontabScheduleResource().urls)),

    url(r'^', include(RecommendationCategoryResource().urls)),
    url(r'^', include(RecommendationComplexityResource().urls)),
    url(r'^', include(RecommendationStatusResource().urls)),
    url(r'^', include(RecommendationPaybackTimeResource().urls)),
    url(r'^', include(RecommendationResource().urls)),
    url(r'^', include(RecommendationStatusLogResource().urls)),

    url(r'^', include(BlogCategoryResource().urls)),
    url(r'^', include(BlogTagResource().urls)),
    url(r'^', include(BlogPostResource().urls)),
    url(r'^', include(Question_categoryResource().urls)),
    url(r'^', include(FAQ_questionResource().urls)),

    url(r'^', include(UserResource().urls)),
    url(r'^', include(CompanyResource().urls)),
    url(r'^', include(ClientSettingsResource().urls)),

    url(r'^', include(PriorityResource().urls)),
    url(r'^', include(DailyOptimizerTaskResource().urls)),
    url(r'^', include(HourlyOptimizerTaskResource().urls)),
    url(r'^', include(MonitoringConfigResource().urls)),

    url(r'^', include(UserAccountResource().urls)),


    url(r'^', include(AlertStatusResource().urls)),
    url(r'^', include(AlertResource().urls)),
    url(r'^', include(AlertTypeResource().urls)),
    url(r'^', include(AlertLogResource().urls)),

    url(r'^reports/', include('backend.reports.urls')),
)
