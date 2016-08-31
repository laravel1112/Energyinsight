from time import gmtime
import sys
import pytz
from datetime import datetime, timedelta
import calendar
import heapq
import scipy.stats
import os
import django
from optimizer.algorithm.optimizerbase import OptimizerBase
import json
from backend.models import EnergyUnit
from optimizer.models import HourlyOptimizerTask
from alert.models import *

class SubAlertBase(object):

    def __init__(self, alert):
        self.alert = alert;

        try: 
            self.alertconfig = json.loads(alert.alertconfig_json)
        except:
            self.alertconfig = {}

        try: 
            self.alertstate = json.loads(alert.alertstate_json)        
        except:
            self.alertstate = {}

    def checkSeries(self):
        return;


    def generateTimeSeriesChart(self, title="", subtitle="", xtitle="", ytitle="", series=None):

        strtmp = """
    {   
    options: {
        chart: {
            type: 'spline'
        },
        title: {
            text: '<TITLE>'
        },
        subtitle: {
            text: '<SUBTITLE>'
        },
        xAxis: {
            type: 'datetime',
            labels: {
                overflow: 'justify'
            },
            title: {
                text: '<XTITLE>'
            }
        },
        yAxis: {
            title: {
                text: '<YTITLE>'
            },
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: '{point.x:%e. %b}: {point.y:.2f} m'
        },
        plotOptions: {
            spline: {
                lineWidth: 4,
                states: {
                    hover: {
                        lineWidth: 5
                    }
                },
                marker: {
                    enabled: false
                },
            }
        },
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    },
    series: <SERIES>,
    }
        """.replace("<TITLE>", title).replace("<SUBTITLE>", subtitle).replace("<XTITLE>", xtitle).replace("<YTITLE>", ytitle).replace("<SERIES>", series)

        return strtmp



    def generateScatterChart(self, title="", subtitle="", xtitle="", ytitle="", series=None):

        strtmp = """
{
    options: {
        chart: {
            type: 'scatter',
            zoomType: 'xy'
        },
        title: {
            text: '<TITLE>'
        },
        subtitle: {
            text: '<SUBTITLE>'
        },
        xAxis: {
            title: {
                enabled: true,
                text: '<XTITLE>'
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true
        },
        yAxis: {
            title: {
                text: '<YTITLE>'
            }
        },
        plotOptions: {
            scatter: {
                marker: {
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x} cm, {point.y} kg'
                }
            }
        }
    },
    
    series: <SERIES>,
    }
        """.replace("<TITLE>", title).replace("<SUBTITLE>", subtitle).replace("<XTITLE>", xtitle).replace("<YTITLE>", ytitle).replace("<SERIES>", series)

        return strtmp


    def reportAlertlog(self, title, description, saving_potential, energy_saved, highchart_plot):

        new_alert=AlertLog(
            alerttype=self.alert.alert_type,
            alert=self.alert,
            energyunit=self.alert.energyunit,

            title = title,
            description = description,
            saving_potential = saving_potential,
            energy_saved = energy_saved,

            alertstatus = AlertStatus.objects.filter(id=1)[0],   # set to unread
            alert_time = datetime.now(pytz.timezone('Asia/Shanghai')),
            highchart_plot = highchart_plot )

        new_alert.save();


    def runTask(self):

        # result is the number of alert
        result = self.checkSeries()

        if result != 0:
            self.alert.last_notification_time = datetime.now(pytz.timezone('Asia/Shanghai'));
            if self.alert.notification_count is None:
                self.alert.notification_count = 0
            self.alert.notification_count += 1

            print "SubAlertBase.runTask(): result = ", result
        if self.alert.run_count is None:
            self.alert.run_count = 0
        self.alert.run_count += 1
        self.alert.alertstate_json = json.dumps(self.alertstate)

        self.alert.save()

