#!/usr/bin/env python
# -*- coding: utf-8 -*-

import numpy
import time
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseForbidden
from django.http import HttpResponse
from django.http import Http404

from optimizer.scripts.data_factory_test import *
from optimizer.algorithm.optimizerbase import OptimizerBase
from api import *

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


def test():
    import os
    import django
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "energyinsight.settings")

    django.setup()
    from optimizer.scripts.data_factory_test import backend_api_data_factory

    return backend_api_data_factory(3, start_time=1468195200, end_time=1469860042, disagg='total', interval="60m")


def makingUserFakedAuthenticated():
    username = 'demouser'
    password = 'demouser'
    user = authenticate(username=username, password=password)
    return user


def makingUserAuthenticated(auth_info):
    auth = auth_info.split()
    if len(auth) == 2 and auth[0].lower() == "basic":
        username, password = base64.b64decode(auth[1]).split(":")
        try:
            user = authenticate(username=username, password=password)
            return user
        except:
            return False


@csrf_exempt
def checking_eu_availability(request, energy_unit_id='', isExternalRequest=False):

    # try:
    #     isExternalRequest = request.POST.get("isExternalRequest")
    #     if "HTTP_AUTHORIZATION" in request.META:
    #         print(request.META["HTTP_AUTHORIZATION"])
    #         user = makingUserAuthenticated(request.META["HTTP_AUTHORIZATION"])
    #         request.user = user
    #         isHTMLResponseRequired = request.POST.get('isHTMLResponseRequired')
    #     else:
    #         data = {"result": "something went wrong"}
    #         return JsonResponse(data)
    #     print ('2')
    # except:
    #     data = {"result": "no such user and password combination"}
    #     return JsonResponse(data)
    if request.user.is_authenticated():
        # try:
        #     isExternalRequest = request.POST.get("isExternalRequest")
        #     user_authenticated = makingUserFakedAuthenticated()
        #     #adding authorized user to request for further checking of its permissions
        #     request.user = user_authenticated
        #     isHTMLResponseRequired = request.POST.get('isHTMLResponseRequired')
        # except:
        #     pass

        """
        getting energy_unit_id from POST request (=external request) if energy_unit_id was not passed by internal
        request internal request (from get_series function) - it is doublecheck of energy unit availability
        in addition to external request check (it checks it before sending request to getSeries url
        """

        if energy_unit_id == '':
            try:
                energy_unit_id = request.POST.get('energy_unit_id')
            except:
                pass
        else:
            pass
        isHTMLResponseRequired = False

        allEnergyUnits = EnergyUnitResource()
        request_bundle = allEnergyUnits.build_bundle(request=request)
        allowedEnergyUnitsList = allEnergyUnits.obj_get_list(request_bundle)

        for eu in allowedEnergyUnitsList:
            if eu.id == int(energy_unit_id):
                if request.method == "POST" and isHTMLResponseRequired == "True":
                    return HttpResponse(True)
                else:
                    return True
    return False


def unix_time(dt):
    epoch = datetime.utcfromtimestamp(0)
    delta = dt - epoch
    return delta.total_seconds()


def unix_time_millis(dt):
    return unix_time(dt) * 1000.0


def convert_time_to_utc(timeStr):
    # default timezone is Shanghai
    timeStr = timeStr + " +8"
    parsedStr = parser.parse(timeStr)

    return calendar.timegm(parsedStr.utctimetuple())


def InfluxClient():
    try:
        influxdb_setting = InfluxdbSettings.objects.get(is_active=True)
    except Exception as e:
        logging.exception(e)
        # it means no is_active == True instance or more than 1 instance with is_Active = True
        influxdb_setting = InfluxdbSettings.objects.filter(name="Main")

    host_name = influxdb_setting.host_name
    host_port = influxdb_setting.host_port
    username = influxdb_setting.username
    password = influxdb_setting.password
    database = influxdb_setting.database
    return InfluxDBClient(host_name,
                          host_port,
                          username,
                          password,
                          database)


def getMeterEnergy(request):
    numPoints = 900  # one minute resolution for a week

    param = request.GET.copy()
    # setup start and end date of series
    pythondate = datetime.today().replace(year=datetime.today().year - 2)  # By default start date is two years ago
    if 'start' in param:
        startTime = long(param['start'])
    else:
        startTime = long(unix_time_millis(pythondate))  # milisecond
    if 'end' in param:
        endTime = long(param['end'])
    else:
        endTime = long(unix_time_millis(datetime.today()))
    dif = (endTime - startTime) / 1000 / 60
    # group by how many minutes, this should not exceed 60. (just because it looks better...) and should also be greater than 0
    groupby = str(max(min(30, int(dif / numPoints)), 1)) + "m"
    if 'aggregate' in param:
        groupby = dif + "m"
    # Now setup what series. For building type, get all children meter. For Meter, just get it.
    id = param['serieName']
    eu = EnergyUnit.objects.get(id=id)
    if eu.type.name == "Building":
        allmeters = EnergyUnit.objects.filter(parent=id).values_list('influxKey', flat=True)
        name = ",".join(allmeters)
    if eu.type.name == "Meter":
        name = eu.influxKey
    sql = "select MEAN(value) from \"" + name + "\" group by time(" + groupby + ") where time > " + str(
        startTime) + "ms and time < " + str(endTime) + "ms"

    client = InfluxClient()

    try:
        results = client.query(sql, 'ms')
    except Exception as e:
        logging.exception(e)
        return JsonResponse("{}", content_type='json', safe=False)
    return JsonResponse(results, content_type='json', safe=False)


@csrf_exempt
def putSeries(request, id):
    print "log in:", request.user
    print request

    # authentication
    if not request.user.is_authenticated():
        return HttpResponseForbidden()

    param = request.POST
    # internal request
    if len(param) == 0:
        param = json.loads(request.body)
    print "Put series param", param

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

    # check id type
    objs = EnergyUnit.objects.filter(id=energy_unit_id)

    if objs.count() != 1:
        raise ValueError('invalid energy unit Id %d ' % (energy_unit_id))
        return HttpResponseForbidden()

    id_type = objs[0].type.name

    if id_type not in ["Meter"]:
        return HttpResponseForbidden()
    influx_key = objs[0].influxKey

    # erase data
    if 'erase_flag' in param:
        if eval(param['erase_flag']) is True:
            try:
                start_utc = long(param['start_utc'])
            except:
                start_utc = None
            try:
                end_utc = long(param['end_utc'])
            except:
                end_utc = None
            # call influxdb driver
            ob = OptimizerBase()
            result = ob.delete_series_data([influx_key], start_utc, end_utc)
            return HttpResponse(result)
    # upload data
    else:
        points = eval(param['points'])
        # need upgrade ---------------------
        try:
            columns = eval(param['columns'])
            if not columns:
                columns = ['time', 'value']
        except:
            columns = ['time', 'value']
        # ----------------------------------
        # call influxdb driver
        ob = OptimizerBase()
        result = ob.put_series_data({'name': influx_key,
                                     'points': points,
                                     'columns': columns})
        return HttpResponse(result)

    return HttpResponseForbidden()


@csrf_exempt
def getWeather(request, id):
    # check energy_unit_id type must be building and must have GPSlocation otherwise return error
    energy_unit_id = id
    # find the nearest weather station
    objs = WeatherStation.objects.all()
    print "objs", WeatherStation.objects
    energy_unit = EnergyUnit.objects.filter(id=energy_unit_id)[0]

    distance = 100000000000000.0

    # find nearest weather station
    for weather_station in objs:

        try:
            map(float, weather_station.GPSlocation.split(','))
        except:
            weather_station.GPSlocation = "0,0"

        try:
            map(float, energy_unit.buildingparam.GPSlocation.split(','))
        except:
            energy_unit.buildingparam.GPSlocation = "0,0"

        a = numpy.linalg.norm(numpy.array(map(float, energy_unit.buildingparam.GPSlocation.split(','))) - numpy.array(
            map(float, weather_station.GPSlocation.split(','))))

        if distance > a:
            distance = a
            eu = weather_station

    weather_id = eu.unit.id

    print "getWeather: nearest weather station for building id ", id , " is id: ", weather_id

    return getSeries(request, weather_id)

def _getSeries(energy_unit_id, start_utc, end_utc, \
	time_format, operation, limitcnt, disagg, interval, id_type):

    if id_type == "Building":

        meterMap = {'lighting': '照明用电', 'plug': '设备与插座',
                    'heating': '取暖用电', 'motor': '动力用电',
                    'cooling': '空调制冷', 'misc': '特殊用电'}

        if disagg == 'total' or disagg is None:
            results = backend_api_data_factory(energy_unit_id,
                                               start_time=start_utc,
                                               end_time=end_utc,
                                               disagg=disagg,
                                               interval=interval,
                                               total_ind=1,
                                               operation=operation)
            if len(results) == 0:
                return []
            toReturn = []
            for key in results.keys():
                temp = results[key]
                series = {"points": [], "usage": key}
                for row in temp.iteritems():
                    series['points'].append([row[0].value // 10 ** 6, row[1]])
                series['points'] = list(reversed(series['points']))
                # results[key]=series
                toReturn += [series]
            for i in toReturn:
                if i['usage'] == 'total':
                    result = [i]
                    break
                # results = json.dumps(toReturn)
            return result

        elif disagg == 'location':
            results = backend_api_data_factory(energy_unit_id,
                                               start_time=start_utc,
                                               end_time=end_utc,
                                               disagg=disagg,
                                               interval=interval,
                                               operation=operation,
                                               flag=1)
            results = put_series_data(results, energy_unit_id)
        elif disagg == 'all':
            results = backend_api_data_factory(energy_unit_id,
                                               start_time=start_utc,
                                               end_time=end_utc,
                                               disagg=disagg,
                                               operation=operation,
                                               interval=interval)
            toReturn = []
            for key in results.keys():
                temp = results[key]
                series = {"points": [], "usage": key}
                for row in temp.iteritems():
                    series['points'].append([row[0].value // 10 ** 6, row[1]])
                series['points'] = list(reversed(series['points']))
                toReturn += [series]
            result = []
            for item in toReturn:
                if item['usage'] != 'total':
                    result.append(item)
            # results = json.dumps(toReturn)
            # return HttpResponse(results)
            return result
        elif disagg in meterMap.keys():
            results = backend_api_data_factory(energy_unit_id,
                                               start_time=start_utc,
                                               end_time=end_utc,
                                               disagg=disagg,
                                               operation=operation,
                                               interval=interval)
            results = results[disagg]
            results = [{disagg: results}]
            results = put_series_data(results, energy_unit_id)
        elif disagg == 'subSegment':
            results = backend_api_data_factory(energy_unit_id,
                                               start_time=start_utc,
                                               end_time=end_utc,
                                               disagg=disagg,
                                               interval=interval,
                                               operation=operation,
                                               flag=2)
            results = put_series_data(results, energy_unit_id)
        else:
            return False
        toReturn = []
        for key in results.keys():
            temp = results[key]
            series = {"points": [], "usage": key}
            for row in temp.iteritems():
                series['points'].append([row[0].value // 10 ** 6, row[1]])
            series['points'] = list(reversed(series['points']))
            toReturn += [series]
        for i in toReturn:
            if i['usage'] == 'total':
                result = [i]
                break
        return result

    elif id_type in ["Meter", "Weather"]:
        ob = OptimizerBase()
        results = ob.get_series_data([energy_unit_id], start_utc, end_utc,
                                     limitcnt, operation, interval,
                                     time_format)
        return results
    else:
        return None

@csrf_exempt
def getSeries(request, id):
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
	
    results = _getSeries(energy_unit_id, start_utc, end_utc, \
	time_format, operation, limitcnt, disagg, interval, id_type)

    if results == False:
        return HttpResponse(False)
    elif results != None:    
	result = json.dumps(results)
        return HttpResponse(result)

    return HttpResponseForbidden()


def getEvents(request):
    param = request.GET.copy()
    name = request.GET['seriesName']
    eventSerieNames = name.split(",")
    pythondate = datetime.today().replace(year=datetime.today().year - 2)

    if 'limit' in param:
        limit = int(param['limit'])
    else:
        limit = 5
    if 'merge' in param:
        merge = bool(param['merge'])
    else:
        merge = False
    if merge == True:
        name = "merge(" + name + ")"
    if 'start' in param:
        startTime = long(param['start'])
    else:
        startTime = long(unix_time_millis(pythondate))  # milisecond
    if 'end' in param:
        endTime = long(param['end'])
    else:
        endTime = long(unix_time_millis(datetime.today()))
    client = InfluxClient()
    results = "{}"
    sql = "select time,event_msg from \"" + name + "\" where time > " + str(startTime) + "ms and time < " + str(
        endTime) + "ms" + " limit " + str(limit) + ""

    try:
        results = client.query(sql, 'ms')
    except Exception as e:
        logging.exception(e)
        return JsonResponse("{}", content_type='json', safe=False)
    if 'origin' in param:
        origin = param['origin']
        originSerieNames = origin.split(",")
        event2origin = {}
        for ind, val in enumerate(eventSerieNames):
            event2origin[val] = originSerieNames[ind]
        for r in results:
            r['origin'] = event2origin[r['name']]
    if 'color' in param:
        color = param['color']
        colorSerieNames = color.split(",")
        event2color = {}
        for ind, val in enumerate(eventSerieNames):
            event2color[val] = colorSerieNames[ind]
        for r in results:
            r['color'] = event2color[r['name']]
    return JsonResponse(results, content_type='json', safe=False)



@csrf_exempt
def predictSeries(request, id):
    print "log in:", request.user
    print request

    param = request.POST
    # internal request
    if len(param) == 0:
        param = json.loads(request.body)
    print "Predict series param", param

    data = getSeries(request, id)
    print data

    if 'start_utc' in param:
        start_utc = long(param['start_utc'])
    else:
        if isExternalRequest == 'True':
            start_utc = None
        else:
            start_utc = long(time.time()-2*365*24*3600)

    if 'base_end_utc' in param:
        base_end_utc = long(param['base_end_utc'])
    else:
        base_end_utc = start_utc


    if 'base_start_utc' in param:
        base_start_utc = long(param['base_end_utc'])
    else:
        base_start_utc = base_end_utc - 24*3600*3*30

    if 'disagg' in param:
        disagg = param['disagg']
    else:
        disagg = None

    is_eu_available = checking_eu_availability(request, energy_unit_id, isExternalRequest)
    if is_eu_available == True:

        # return JsonResponse("{}",content_type='json',safe=False)
        client = InfluxClient()
        results = "{}"

        objs = EnergyUnit.objects.filter(id=energy_unit_id)

        if objs.count() != 1:
            raise ValueError('invalid energy unit Id %d ' % (energy_unit_id))
        eu = objs[0]

        if eu.type.name == "Building":
            meterMap = {'lighting': '照明用电',
            'plug': '设备与插座',
            'heating': '取暖用电',
            'motor': '动力用电',
            'cooling': '空调制冷',
            'misc': '特殊用电'}

            if disagg is None:
                meters = EnergyUnit.objects.filter(parent=energy_unit_id)
                energy_unit_id = meters[0].id
            elif disagg == 'all':
                meterNames = meterMap.values()
                allmeters = map(lambda x: "\"" + eu.influxKey + '__' + x + "\"", meterMap.keys())

            elif disagg in meterMap.keys():
                meterNames = [meterMap[disagg]]
                allmeters = ["\"" + eu.influxKey + '__' + disagg + "\""]
            else:
                return HttpResponse(False)

        else:
            meterNames = 'default'
            influxdb_series = "\"" + eu.influxKey + "\""

        # # TODO: replace by actual prediction module
        # sql = "select mean(value) from  "+ influxdb_series + "  where time > " + str(start_utc) + "s and time < " + str(end_utc) + "s" + " group by time (1h)"
        # print "INFLUXDB GET: ", sql.encode('utf-8')
        # try:
        #     results = client.query(sql, time_format)
        # except Exception  as e:
        #     print e
        #     return JsonResponse([],content_type='json',safe=False)
        # # TODO: end
        # print results

        # Call Predict API
        tempList = None  # ['87']
        featureList = [str(energy_unit_id)]
        # featureList = ['70']
        objList = [str(energy_unit_id)]
        #predictor = Predictor(featureList, objList, tempList)
        predictor = RFPredictor(objList)
        interval = 3600
        #result = predictor.linearPredictor(start_reg_utc=base_start_utc, end_reg_utc=base_end_utc,
        #    start_pre_utc=start_utc, end_pre_utc=end_utc, freq=interval)
        result = predictor.Predictor(start_utc = base_start_utc, end_utc = base_end_utc,start_pre_utc = start_utc,end_pre_utc = end_utc,freq = interval)
        result_time = range(start_utc * 1000, (end_utc + 1) * 1000, interval * 1000)
        result_and_time = list(zip(result_time, result))
        result_and_time = [list(x) for x in result_and_time]
        # result_and_time.reverse()
        result_and_time = list(result_and_time)
        result_and_time.reverse()
        if result is not None:
            results = [{'object': objList, 'points': result_and_time}]
        else:
            results = [{'object': 'error', 'points': [0] * 5}]

        # here add all these series the name that they should display on webpage
        # this variant works more than JsonResponse(data,content_type='json',safe=False
            """
            if disagg is not None and len(results)>0 and eu.invisible==True:
                print "result length is "+str(len(results))
                for ind in range(0,len(meterNames)):
                    results[ind]['usage']=meterNames[ind]
            elif len(results)>0:
                results[0]['usage']='总能耗'
                    #results[ind]['visible']=visibility[ind]
            """
        results = json.dumps(results)
        return HttpResponse(results)


    return HttpResponse(data)


def strategeTest(request):
    time.sleep(0)
    return JsonResponse("{result:true}", content_type='json', safe=False)


def geocoder(request):
    # address = request.GET.get('address', '').encode('utf-8')
    ak = request.GET.get('ak', '').encode('utf-8')
    unit_id = request.GET.get('eu', '')
    eu = EnergyUnit.objects.get(id=unit_id)
    if eu.type.name != "Building":
        raise Http404("Unit is not a building")
    if eu.GPSlocation is not None:
        eu.buildingparam.GPSlocation = eu.GPSlocation
        eu.buildingparam.save()
    if eu.buildingparam.GPSlocation is not None:
        coordinates = eu.buildingparam.GPSlocation.split(",")
        if len(coordinates) == 2:
            results = {}
            results['location'] = {}
            results['location']['lng'] = coordinates[0]
            results['location']['lat'] = coordinates[1]
            results = json.dumps(results)
            return HttpResponse(results)
    address = eu.buildingparam.address
    if address is None:
        raise Http404("Unit does not have address")
    urladdr = "http://api.map.baidu.com/geocoder/v2/" + "?address=" + address + "&output=json" + "&ak=" + ak
    response = urllib2.urlopen(urladdr)
    results = response.read()
    results = json.loads(results)
    if results['status'] == 0:
        coordinates = str(results['result']['location']['lng']) + "," + str(results['result']['location']['lng'])
        eu.buildingparam.GPSlocation = coordinates
        eu.buildingparam.save()
        results = json.dumps(results['result'])
        return HttpResponse(results)
    raise Http404(results['msg'])
    # return HttpResponse(results)
