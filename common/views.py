from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from revproxy.views import ProxyView
from django.http import JsonResponse
from influxdb.influxdb08  import InfluxDBClient
from datetime import datetime
from dateutil import parser

from django.http import HttpResponse
def unix_time(dt):
    epoch = datetime.utcfromtimestamp(0)
    delta = dt - epoch
    return delta.total_seconds()

def unix_time_millis(dt):
    return unix_time(dt) * 1000.0


@login_required
def home(request):
    return render(request, 'common/report.html',{"active_tab": "home"})

@login_required
def chart(request):
    return render(request, 'common/report.html',{"active_tab": "chart"})

@login_required
def energy_report(request):
    return render(request, 'common/report.html',{"active_tab": "report"})

@login_required
def recommendation(request):
    return render(request, 'common/report.html',{"active_tab": "recommendation"})

@login_required
def user_admin(request):
    return render(request, 'common/report.html',{"active_tab": "admin"})


def angular(request,name="home"):
    return render(request, 'angular/index.html',{"active_tab": name})
def login(request,name="login"):
    return render(request, 'angular/index.html',{"active_tab": name})
# @login_required
# def proxyview(request,url):
#     #return HttpProxy.as_view(base_url='http://52.87.232.48',url=url,rewrite=True),
#     print url
#     response = HttpResponse()
#     response['X-Accel-Redirect'] = "/protected/"+url;
#     return response

@login_required
def change_theme(request, theme):
    request.session["theme"] = theme
    return redirect('chart_index')


class BackendProxyView(ProxyView):
    upstream = settings.INFLUXDB_URL

    def _created_proxy_response(self, request, path):
        credentials = {'u': settings.INFLUXDB_USERNAME,
                       'p': settings.INFLUXDB_PASSWORD}
        secure_get = request.GET.copy()
        secure_get.update(credentials)
        request.GET = secure_get
        return super(BackendProxyView, self)._created_proxy_response(request, path)


def getList(request):
    unit =serializers.serialize('json', EnergyUnit.objects.all().select_related("type"))
    raw=EnergyUnit.objects.all().select_related("type");
    results = [ob.toJSON() for ob in raw]
    print results
    return JsonResponse(results,content_type='json',safe=False);


