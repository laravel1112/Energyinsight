# coding=utf-8
from alert.subalerts.threshold_alert import *
from alert.subalerts.energy_alert import *
def run(series_name,debug = True):
    task = 1
    alert = EnergyAlert(task)
    Alert = ThresholdAlert(alert)
    Alert.runTask()
    return