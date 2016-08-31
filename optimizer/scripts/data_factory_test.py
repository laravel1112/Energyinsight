# -*- coding: utf-8 -*-
import os
import sys
import django

from optimizer.algorithm.predictor import *
from optimizer.algorithm.datafactory import *
from optimizer.algorithm.datafactory import DataFactory
from optimizer.models import OptimizerTask

from backend.models import EnergyUnit
from backend.models import Appliance

reload(sys)
sys.setdefaultencoding("utf-8")


def convert_timestr_to_utc(timeStr):
    parsedStr = parser.parse(timeStr)
    return calendar.timegm(parsedStr.utctimetuple())


def test_predictor():
    featureList = ['87']
    start_utc = convert_timestr_to_utc('2014-2-1 00:00:00 +8')
    end_utc = convert_timestr_to_utc('2014-6-1 00:00:00 +8')

    test_start_utc = convert_timestr_to_utc('2014-12-1 00:00:00 +8')
    test_end_utc = convert_timestr_to_utc('2014-12-31 00:00:00 +8')

    # start = 1451577600
    # start = 1454256000
    start = 1456761600
    end = start + 3600
    tempList = None
    featureList = ['94', '95', '96']
    objList = ['97']
    predictor = Predictor()

    predictor = Predictor(tempList, featureList, objList)
    start_reg_utc = start
    end_reg_utc = end
    start_pre_utc = start
    end_pre_utc = end
    freq = '1Min'
    predictor.linearPredictor(start_reg_utc, end_reg_utc,
                                       start_pre_utc, end_pre_utc, freq)
    return


def put_series_data(series_list, mainMeter, resample_freq='5Min'):
    data = []
    for category in series_list:
        influxdbkey = "test" + mainMeter + '__' + str(category)
        # series_list[category].resample(resample_freq,how="sum")
        points = [None] * series_list[category].size
        for i in xrange(series_list[category].size):
            # manually put the datapoints
            # x is timestamp
            x = series_list[category].axes[0][i].value / 1000000000
            y = series_list[category].values[i]
            points[i] = [x, y]
        data.append({"name": influxdbkey, "columns": ['time', 'value'], "points": points})
        # data=[{"name":influxdbkey,"columns":['time','value'],"points":points}]
        # data = json.dumps(data)

    return data


def backend_api_data_factory(energy_unit_id, debug=False, start_time=None,
                             end_time=None, disagg=None, interval=None,
                             total_ind=None, operation=None, flag = None):
    testMeterSpec = []
    if energy_unit_id:
        stack = [energy_unit_id]

        #compute total
        if len(stack) > 0:
            current_unit = stack.pop()

            if EnergyUnit.objects.filter(parent=current_unit, type__name="Electricity Folder"):
                pre_children = EnergyUnit.objects.filter(parent=EnergyUnit.objects.filter(parent=current_unit, type__name="Electricity Folder"))
                for i in range(0,len(pre_children)):
                    stack.append(pre_children[i])

            else:
                try:
                    pre_children = EnergyUnit.objects.filter(parent=current_unit)
                    for i in range(0,len(pre_children)):
                        stack.append(pre_children[i])

                except Exception as e:
                    logging.exception(e)
                    # pre_children = EnergyUnit.objects.filter(parent = current_unit)
                    # stack.append(pre_children[0])
                    stack.append(current_unit)  # here needs more thinking
        while len(stack) > 0:
            current_unit = stack.pop()
            all_apps = Appliance.objects.filter(app_unit=current_unit)

            if current_unit.influxKey is not None and (current_unit.influxKey != ""):
                print("here")
                item = {'seriesName': current_unit.influxKey, 'Loads': [{'LoadID': 1, 'outputSegment': 'total'}]}
                testMeterSpec.append(item)

        if not total_ind:
            #compute everything else with appliances
            stack = [energy_unit_id]

            if len(stack) > 0:
                current_unit = stack.pop()

                if EnergyUnit.objects.filter(parent=current_unit, type__name="Electricity Folder"):
                        pre_children = EnergyUnit.objects.filter(parent=EnergyUnit.objects.filter(parent=current_unit, type__name="Electricity Folder"))
                        for i in range(0,len(pre_children)):
                                stack.append(pre_children[i])

                else:
                    try:
                        pre_children = EnergyUnit.objects.filter(parent=current_unit)
                        for i in range(0,len(pre_children)):
                            stack.append(pre_children[i])



                    except Exception as e:
                        logging.exception(e)
                        # pre_children = EnergyUnit.objects.filter(parent = current_unit)
                        # stack.append(pre_children[0])
                        stack.append(current_unit)  # here needs more thinking

            while len(stack) > 0:
                current_unit = stack.pop()
                all_apps = Appliance.objects.filter(app_unit=current_unit)

                if len(all_apps) < 1 or current_unit.influxKey is None or current_unit.influxKey == "":
                    # no app, then keep searching the children
                    childrens = EnergyUnit.objects.filter(parent=current_unit)
                    for x in childrens:
                        stack.append(x)

                else:

                    item = {'seriesName': current_unit.influxKey, 'Loads': []}

                    if not flag:

                        for (ind, val) in enumerate(all_apps):
                            item['Loads'].append({'loadId': ind, 'outputSegment': val.outputSegment.name})
                    elif flag ==1:

                        for (ind, val) in enumerate(all_apps):
                            item['Loads'].append({'loadId': ind, 'outputSegment': val.location})

                    elif flag ==2:

                        for (ind, val) in enumerate(all_apps):
                            item['Loads'].append({'loadId': ind, 'outputSegment': val.outputSegment})

                    else:
                        pass
                    testMeterSpec.append(item)
            # print("--Log from data_factory_test.py------------------------------")
            # print(testMeterSpec)


        df = DataFactory(1)

        df.SetMainMeter(energy_unit_id)

        df.SetTestMeters(testMeterSpec)


        results = df.devbackend_api_DataProcess(debug=debug, startTime=start_time, endTime=end_time, interval=interval, operation=operation)

        return results



def test_data_factory(optimizertask_id, debug=False, start_time=None, end_time=None):
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "energyinsight.settings")

    django.setup()

    df = DataFactory(optimizertask_id)

    testMeterSpec = []
    # The only input for test_data_factory is optimizertask_id

    try:
        energy_unit = OptimizerTask.objects.get(id=optimizertask_id).eu_id
    except:
        # do not exit the whole program
        exit('Error, no such EnergyUnit!!!')

    stack = [energy_unit]

    # TODO: add excecption when meterspec is wrong


    while len(stack) > 0:
        current_unit = stack.pop()
        all_apps = Appliance.objects.filter(app_unit=current_unit)
        if len(all_apps) < 1 or current_unit.influxKey is None or current_unit.influxKey == "":
            # no app, then keep searching the children
            childrens = EnergyUnit.objects.filter(parent=current_unit)
            for x in childrens:
                stack.append(x)
        else:
            item = {'seriesName': current_unit.influxKey, 'Loads': []}
            for (ind, val) in enumerate(all_apps):
                item['Loads'].append({'loadId': ind, 'outputSegment': val.outputSegment})
            testMeterSpec.append(item)

    # testMeterSpec.append( { 'seriesName': 'CPuser.CrownePlaza.分项.照明与插座',
    #                       'Loads': [  { 'loadId': 0, 'outputSegment': 'lighting'} ] } )



    df.SetMainMeter(energy_unit)

    df.SetTestMeters(testMeterSpec)

    df.DataProcess(debug=debug)


def run(optmizertask_id, debug=False, start_time=None, end_time=None):
    # test_predictor()

    test_data_factory(optmizertask_id, debug=debug, start_time=start_time, end_time=end_time)

    return


# run(1)



def old_test_data_factory(optmizertask_id):
    df = DataFactory(optmizertask_id)
    testMeterSpec = []

    testMeterSpec.append({'seriesName': 'CPuser.CrownePlaza.分项.照明与插座',
                          'Loads': [{'loadId': 0, 'outputSegment': 'lighting'}]})

    df.SetTestMeters(testMeterSpec)

    # df.InitMeterSpec()

    df.DataProcess()


'''
def convert_time_to_utc(timeStr):
    # default timezone is Shanghai
    parsedStr = parser.parse(timeStr)

    return calendar.timegm(parsedStr.utctimetuple())

    #lighting_opt = LightingOptimizer(optmizertask_id)

    #lighting_opt.dailypatterncheck()

    #hvac_opt = HvacOptimizer(optmizertask_id)

    #hvac_opt.dailymatchcheck()

    disaggregation_opt = Disaggregation(optmizertask_id)

    disaggregation_opt.dailydisaggregation()
'''
