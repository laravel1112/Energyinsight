import time
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseForbidden
from django.http import HttpResponse
from django.http import Http404

from optimizer.scripts.data_factory_test import *
from optimizer.algorithm.optimizerbase import OptimizerBase
from backend.api import *

from backend.views import *
from backend.views import _getSeries

from backend.models import *

import datetime

@csrf_exempt
def getMonthlyData(request, id):

    print "log in:", request.user
    print request

    # authentication
    if not request.user.is_authenticated():
        return HttpResponseForbidden()

    param = request.POST
    # internal request
    if len(param) == 0:
        param = json.loads(request.body)
    print "Get series param", param

    # check id availability
    energy_unit_id = id
    if 'isExternalRequest' in param:
        isExternalRequest = param['isExternalRequest']
    else:
        isExternalRequest = "False"
    print "isExternalRequest:", isExternalRequest
    is_eu_available = \
        checking_eu_availability(request, energy_unit_id, isExternalRequest)
    print "is_eu_available:", is_eu_available
    if not is_eu_available:
        return HttpResponseForbidden()

    objs = EnergyUnit.objects.filter(id=energy_unit_id)

    if objs.count() != 1:
        raise ValueError('invalid energy unit Id %d ' % (energy_unit_id))
    id_type = objs[0].type.name
    # influx_key = objs[0].influxKey

    if 'start_utc' in param:
        start_utc = long(param['start_utc'])
    else:
        if isExternalRequest == 'True':
            start_utc = None
        else:
            start_utc = long(time.time()-2*365*24*3600)

    if 'end_utc' in param:
        end_utc = long(param['end_utc'])
    else:
        if isExternalRequest == 'True':
            end_utc = None
        else:
            end_utc = long(time.time())

    if end_utc < start_utc:
        start_utc = long(end_utc - 2*365*24*3600)

    if 'time_format' in param:
        time_format = param['time_format']
    else:
        time_format = 's'

    if 'operation' in param:
        operation = param['operation']
        if 'interval' in param:
            interval = str(param['interval'])
        else:
            interval = 'auto'

    else:
        operation = 'raw'
        interval = None
        if isExternalRequest == "False":
            limitcnt = 5000

    if 'limit' in param:
        limitcnt = param['limit']
    else:
        limitcnt = None

    if 'disagg' in param:
        disagg = param['disagg']
    else:
        disagg = None

    if interval == 'auto':
        dif = (end_utc - start_utc) / 60
        numpoints = 5000
        interval = str(max(int(dif / numpoints)+1, 1)) + "m"
	
    results = _monthlyData(param, energy_unit_id, start_utc, end_utc, \
	time_format, operation, limitcnt, disagg, interval, id_type)

    if results == False:
        return HttpResponse(False)
    elif results != None:    
	result = json.dumps(results)
        return HttpResponse(result)

    return HttpResponseForbidden()

def _monthlyData(param, energy_unit_id, start_utc, end_utc, \
	time_format, operation, limitcnt, disagg, interval, id_type):
    # get series data for last one year
    results = _getSeries(energy_unit_id, start_utc, end_utc, \
	time_format, operation, limitcnt, disagg, interval, id_type)

    if results == False:
        return False

    last_30_date = end_utc - 30 * 24 * 60 * 60
    this_month = 0

    # get series data group by month
    for token in results:
        res = dict()
        for point in token['points']:
            try:
                date_string = datetime.datetime.fromtimestamp(int(point[0]/1000)).strftime('%Y/%m')
            except:
                continue

            if date_string not in res:
                res[date_string] = point[1]
            else:
                res[date_string] += point[1]

            if token['usage'] == 'total' and point[0]/1000 > last_30_date:
                this_month += point[1]

        token['points'] = [[date, res[date]] for date in res]

    # get kwh for 12 month
    total = 0
    for month in res:
        total += res[month]
    results[0]["total_energy"] = [total, total * 0.8]

    # get kwh/m2
    building_id = param["building_id"]
    eu = EnergyUnit.objects.get(id=building_id)

    area = eu.buildingparam.buildingarea
    results[0]["energy_unit"] = [total/int(area), total/int(area) * 0.8]
    
    # get compare value
    last_30_date = start_utc - 30 * 24 * 60 * 60
    last_month = 0
    tp_results = _getSeries(energy_unit_id, start_utc, end_utc, \
	time_format, operation, limitcnt, disagg, interval, id_type)

    for token in tp_results:
        for point in token['points']:
            if token['usage'] == 'total':
                last_month += point[1]

    results[0]["promot"] = [this_month, this_month/last_month * 100 - 100]

    return results
