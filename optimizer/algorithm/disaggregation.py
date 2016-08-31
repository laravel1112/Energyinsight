# -*- coding: utf-8 -*-
from __future__ import division
# from time import gmtime
import time
import sys
import pytz
from datetime import datetime, timedelta
import calendar
import copy
import numpy as np
import scipy.stats
from scipy.special import gammaln
from scipy.misc import comb
from scipy.misc import logsumexp
import scipy.ndimage.filters
import logging

from decorator import decorator
from functools import partial
import matplotlib.pyplot as plt


# Event Detection
def _dynamic_programming(f, *args, **kwargs):
    if f.data is None:
        f.data = args[0]

    if not np.array_equal(f.data, args[0]):
        f.cache = {}
        f.data = args[0]

    try:
        f.cache[args[1:3]]
    except KeyError:
        f.cache[args[1:3]] = f(*args, **kwargs)
    return f.cache[args[1:3]]


def dynamic_programming(f):
    f.cache = {}
    f.data = None
    return decorator(_dynamic_programming, f)


def cp_detect(data, truncate=-np.inf):
    '''
    Compute the likelihood of changepoints on data.

    Keyword arguments:
    data                                -- the time series data
    prior_func                          -- a function given the likelihood of a changepoint given the distance to the last one
    truncate                            -- the cutoff probability 10^truncate to stop computation for that changepoint log likelihood

    P                                   -- the likelihoods if pre-computed
    '''

    n = len(data)
    Q = np.zeros((n,))
    g = np.zeros((n,))
    G = np.zeros((n,))
    P = np.ones((n, n)) * -np.inf

    # save everything in log representation
    for t in range(n):
        prior_func = partial(const_prior, l=(len(data) + 1))
        g[t] = np.log(prior_func(t))
        if t == 0:
            G[t] = g[t]
        else:
            G[t] = np.logaddexp(G[t - 1], g[t])

    P[n - 1, n - 1] = gaussian_obs_log_likelihood(data, n - 1, n)
    Q[n - 1] = P[n - 1, n - 1]

    for t in reversed(range(n - 1)):
        sys.stdout.write('step 1/2: ' + str(int(((n - 2 - t) / (n - 1)) * 1000) / 10) + '%')
        sys.stdout.flush()
        sys.stdout.write('\r')

        P_next_cp = -np.inf  # == log(0)
        for s in range(t, n - 1):
            P[t, s] = gaussian_obs_log_likelihood(data, t, s + 1)

            # compute recursion
            summand = P[t, s] + Q[s + 1] + g[s + 1 - t]
            P_next_cp = np.logaddexp(P_next_cp, summand)

            # truncate sum to become approx. linear in time (see
            # Fearnhead, 2006, eq. (3))
            if summand - P_next_cp < truncate:
                break

        P[t, n - 1] = gaussian_obs_log_likelihood(data, t, n)

        # (1 - G) is numerical stable until G becomes numerically 1
        if G[n - 1 - t] < -1e-15:  # exp(-1e-15) = .99999...
            antiG = np.log(1 - np.exp(G[n - 1 - t]))
        else:
            # (1 - G) is approx. -log(G) for G close to 1
            antiG = np.log(-G[n - 1 - t])

        Q[t] = np.logaddexp(P_next_cp, P[t, n - 1] + antiG)

    Pcp = np.ones((n - 1, n - 1)) * -np.inf

    for t in range(n - 1):

        Pcp[0, t] = P[0, t] + Q[t + 1] + g[t] - Q[0]
        if np.isnan(Pcp[0, t]):
            Pcp[0, t] = -np.inf

    for j in range(1, n - 1):
        sys.stdout.write('step 2/2: ' + str(int((j / (n - 1)) * 1000) / 10))
        sys.stdout.flush()
        sys.stdout.write('\r')

        for t in range(j, n - 1):
            tmp_cond = Pcp[j - 1, j - 1:t] + P[j:t + 1, t] + Q[t + 1] + g[0:t - j + 1] - Q[j:t + 1]
            Pcp[j, t] = logsumexp(tmp_cond.astype(np.float32))
            if np.isnan(Pcp[j, t]):
                Pcp[j, t] = -np.inf

    pcpsum = np.insert(np.exp(Pcp).sum(0), n - 1, 0)
    pcpsum[np.where(pcpsum < 1e-3)] = 0

    idxpcp = (np.diff(np.sign(np.diff(pcpsum))) < 0).nonzero()[0] + 1
    idx_del = (np.diff(idxpcp) < 10).nonzero()[0] + 1  # del multiple peaks
    idxpcp = np.delete(idxpcp, idx_del)

    return (idxpcp, pcpsum)


@dynamic_programming
def gaussian_obs_log_likelihood(data, t, s):
    s += 1
    n = s - t
    mean = data[t:s].sum(0) / n

    muT = (n * mean) / (1 + n)
    nuT = 1 + n
    alphaT = 1 + n / 2
    betaT = 1 + 0.5 * ((data[t:s] - mean) ** 2).sum(0) + ((n) / (1 + n)) * (mean ** 2 / 2)
    scale = (betaT * (nuT + 1)) / (alphaT * nuT)
    prob = np.sum(np.log(1 + (data[t:s] - muT) ** 2 / (nuT * scale)))
    lgA = gammaln((nuT + 1) / 2) - np.log(np.sqrt(np.pi * nuT * scale)) - gammaln(nuT / 2)

    return np.sum(n * lgA - (nuT + 1) / 2 * prob)


def const_prior(r, l):
    return 1 / (l)


########################################################
def preprocess(data):
    if data[0] == 0:
        data[0] = np.mean(data[1:10])

    for i in range(1, len(data)):
        ratio = abs(data[i] - data[i - 1]) / data[i - 1]
        if data[i] == 0 or ratio >= 2:
            data[i] = data[i - 1]
    return data


def z_outlier(err, thresh):
    if len(err) == 1:
        'Warning: only one data point'
    z_score = scipy.stats.mstats.zscore(err)
    return abs(z_score) > thresh


'''Savitzky-Golay filter'''


def s_filter(data, wspan, polyorder):
    y_filtered = scipy.signal.savgol_filter(data, wspan, polyorder, mode='nearest')
    return y_filtered


def cartesian(arrays):
    arrays = [np.asarray(a) for a in arrays]
    shape = (len(x) for x in arrays)

    ix = np.indices(shape, dtype=int)
    ix = ix.reshape(len(arrays), -1).T

    for n, arr in enumerate(arrays):
        ix[:, n] = arrays[n][ix[:, n]]

    return ix


# remove outliers for single event
def removeoutlier(y, mediansize=8, thresh=1.5):
    y_removeoutlier = copy.copy(y)
    y_filtered = scipy.ndimage.filters.median_filter(y, size=mediansize)
    idx_outlier = np.where(z_outlier(y - y_filtered, thresh) == True)
    for i in idx_outlier:
        y_removeoutlier[i] = y_filtered[i]
    return y_removeoutlier


# get y_removeoutlier for all time
def removeoutlier_all(y, idxpcp_start, idxpcp_end):
    N_event = len(idxpcp_start)
    y_removeoutlier = copy.copy(y)
    for i in range(N_event):
        y_event = y[idxpcp_start[i]:idxpcp_end[i]]
        y_event_removeoutlier = removeoutlier(y_event, mediansize=8, thresh=1.5)
        for idx in range(idxpcp_start[i], idxpcp_end[i] + 1):
            y_removeoutlier[idx] = y_event_removeoutlier[idx - idxpcp_start[i]]
    return y_removeoutlier


def mean_event(y, idxpcp_start, idxpcp_end):
    N_event = len(idxpcp_start)
    value_event = np.zeros(N_event)
    for i in range(N_event):
        value_event[i] = np.mean(y[idxpcp_start[i]:idxpcp_end[i]])
    return value_event


def viterbi(data_event, status, power, conditions, num_change, feature_events):
    N = len(data_event)
    num_app = len(status)
    # possible status for each event
    s = cartesian(status)
    num = len(s)
    del_i = []
    for i in range(num):
        for j in range(num_app):
            if s[i][j] < conditions[j]:
                del_i.append(i)
                break
    del_i = np.asarray(del_i)
    cond_i = np.setdiff1d(np.linspace(0, num - 1, num).astype(int), del_i)

    # possible status change sub_s
    sub_s = [[]]
    for i in range(num):
        for i_change in range(1, num_change + 1):
            for j in range(num):
                if (s[j] == s[i]).sum() == num_app - i_change:
                    sub_s[i].append(j)
        if i < num - 1:
            sub_s.append([])

    sub_s = np.asarray(sub_s, dtype=np.int32)

    # Create error matrix
    err_matrix = np.zeros((num, N))
    for i in range(num):
        for j in range(N):
            err_matrix[i][j] = -data_event[j]
            for num_app_i in range(num_app):
                idx = s[i][num_app_i]
                err_matrix[i][j] += power[num_app_i][idx]
                #            err_matrix[i][j] = err_matrix[i][j] * err_matrix[i][j]
                err_matrix[i][j] = abs(err_matrix[i][j])

    # Apply feature event probablity

    event_prob_matrix = np.zeros((num, N))
    for i in range(num):  # num of states
        for j in range(N):  # num of events
            # s[i] is appliance status for each state
            for num_app_i in range(num_app):
                event_prob_matrix[i][j] += feature_events[j][num_app_i][s[i][num_app_i]]

    # Apply conditions
    for j in range(0, N):
        for i in range(num):
            if (del_i == i).sum() == 1:
                err_matrix[i, j] = np.inf

    chain = np.ones((num, N), dtype=np.int32) * -1
    for j in range(1, N):
        for i in cond_i:
            idx = np.argmin((err_matrix[sub_s[i], j - 1]))
            min_i = sub_s[i][idx]
            chain[i][j - 1] = min_i
            err_matrix[i][j] = (err_matrix[min_i][j - 1]) + (err_matrix[i][j])
            # err_matrix[i][j]+=err_matrix[min_i][j-1]
            # err_matrix[i][j]+=abs(err_matrix[min_i][j-1])
            '''if abs(err_matrix[i][j])<=abs(err_matrix[i][j]+err_matrix[min_i][j-1]):
                err_matrix[i][j]+=0
            else:
                err_matrix[i][j]+=err_matrix[min_i][j-1]'''

            # subtract feature probility term
            # TODO: 100 is a constant, it should be computed relative to total error
            err_matrix[i][j] -= event_prob_matrix[i][j] * 100

    min_i = np.argmin(abs(err_matrix[:, N - 1]))
    chain[min_i][N - 1] = min_i

    viterbi_chain = np.zeros(N, dtype=np.int32)
    viterbi_chain[N - 1] = min_i

    for j in range(N - 1):
        j = N - 2 - j
        viterbi_chain[j] = chain[viterbi_chain[j + 1]][j]

    viterbi_status = s[viterbi_chain]
    viterbi_errors = np.zeros(N)
    for j in range(N):
        viterbi_errors[j] = -data_event[j]
        for num_app_i in range(num_app):
            idx = viterbi_status[j][num_app_i]
            viterbi_errors[j] += power[num_app_i][idx]

    return (viterbi_status, viterbi_errors)


def stat_power(viterbi_status, power, start_idx, end_idx, t, freq):
    num = len(power)
    N = len(viterbi_status)
    time_p = np.zeros((N, num), dtype=np.int32)
    stat_p = np.zeros(num, dtype=np.int32)

    for i in range(N):
        for j in range(num):
            status = viterbi_status[i][j]
            time_p[i][j] = power[j][status]
            stat_p[j] += power[j][status] * (t[end_idx[i]] - t[start_idx[i]]) / freq  # kwh

    return (time_p, stat_p)


def create_event_probability_array(power, N_event):
    # return feature event. It is a list of number of event, each element is same size as power
    # if the value is not zero, it represents the probalilty in 100 of likelyhood of the state
    # each row of the feature_event must be add to 100 if non zero

    feature_events = []
    for i in range(N_event):
        prob_zero = np.copy(power)
        for j, v in enumerate(prob_zero):
            prob_zero[j] = np.zeros(len(v))

        feature_events.append(prob_zero)

    return feature_events


def disaggregation(t, data, power, conditions, sampling_rate, num_change=1, preproc_data=0):
    # status index for each appliance
    status = []
    for item in power:
        status.append([i for i in range(len(item))])
    status = np.array(status)

    N = len(data)

    if preproc_data == 1:
        y = data * 1000.0 / 3.0  # magic number

        # delete obvious outliers y=0
        y = preprocess(y)

        # rlowess filter
        fraction = 5 / float(N)
        try:
            y_filtered = rlowess(y, fraction, iter=3)
        except:
            y_filtered = s_filter(y, wspan=45, polyorder=2)
    else:
        y_filtered = data

    # change point detection
    timestart = time.clock()

    (idxpcp_start, pcpsum) = cp_detect(y_filtered[::-1])
    idxpcp_start = N - 1 - idxpcp_start[::-1]
    idxpcp_start = np.insert(idxpcp_start, 0, 0)

    (idxpcp_end, pcpsum) = cp_detect(y_filtered)
    idxpcp_end = np.insert(idxpcp_end, len(idxpcp_end), N - 1)

    timend = time.clock()

    # Determine event for viterbi
    N_event = len(idxpcp_start)

    # Remove outliers
    y_removeoutlier = removeoutlier_all(y_filtered, idxpcp_start, idxpcp_end)

    # Get Mean value for each event
    value_event = mean_event(y_removeoutlier, idxpcp_start, idxpcp_end)

    # Feature extraction, feature events is an all zero array by default
    feature_events = create_event_probability_array(power, N_event)

    # Feature detection results    feature_events[ event_id ] [ appliance_id ] [ state_idx ] = probability of status.
    #    feature_events[2][0][2] = 100
    #    feature_events[6][0][1] = 100



    # Viterbi disaggregation
    '''
        stat_p: Power Consumption(kwh) for each appliance for whole period
        time_p: Power status(kw) for each appliance for each event
    '''
    (viterbi_status, viterbi_errors) = viterbi(value_event, status, power, conditions, num_change, feature_events)
    (time_p, stat_p) = stat_power(viterbi_status, power, idxpcp_start, idxpcp_end, t, sampling_rate)

    # value_event_err: error compensation
    time_p_err = np.zeros((N_event, len(power)), dtype=np.int32)
    stat_p_err = np.zeros(len(power), dtype=np.int32)

    for i in range(N_event):
        err_ratio = value_event[i] / (value_event[i] + viterbi_errors[i])
        time_p_err[i] = time_p[i] * err_ratio
        for j in range(len(power)):
            status = viterbi_status[i][j]
            stat_p_err[j] += err_ratio * power[j][status] * (
            t[idxpcp_end[i]] - t[idxpcp_start[i]]) / sampling_rate  # kwh

    ##PLOT data##
    t_plot = np.vstack((t[idxpcp_start], t[idxpcp_end])).ravel([-1])
    y_plot = np.zeros((len(power), 2 * N_event), dtype=np.int32)
    for j in range(len(power)):
        y_plot[j] = np.vstack((time_p_err[:, j], time_p_err[:, j])).ravel([-1])

    # redistribute errors back to all the appliances
    y_result = np.zeros((len(power), len(t)), dtype=np.int32)
    y_disagg = np.zeros((len(power), len(t)), dtype=np.int32)

    for idx in range(len(t_plot)):
        for j in range(len(power)):
            if idx == len(t_plot) - 1:
                y_result[j][t_plot[idx]:] = y_plot[j][idx]
            else:
                y_result[j][t_plot[idx]:t_plot[idx + 1]] = y_plot[j][idx]  # TODO: better to use linear interpretation

    y_total = y_result.sum(axis=0)
    y_err = data - y_total

    for idx in range(len(t)):
        for j in range(len(power)):
            y_disagg[j][idx] = y_result[j][idx] + (y_result[j][idx] * y_err[idx] + y_total[idx] / 2) / y_total[idx]

    return t_plot, y_plot, y_disagg, pcpsum


def plot_disagg_results(picname, y_disagg, y_true, y_filtered, t, pcpsum, power, t_plot, y_plot):
    plt.figure()
    plt.subplot(2, 1, 1)
    # plt.plot(t,y,'g.--')
    plt.plot(t, y_filtered, 'b')
    plt.subplot(2, 1, 2)
    plt.plot(t, pcpsum)
    plt.savefig('changepoint' + picname + '.png', bbox_inches='tight')
    plt.ion()  # turns on interactive mode
    plt.show()

    # === Display disagg results ===
    plt.figure()
    plt.plot(t, y_filtered, color='black', label='Total')
    colormap = ['blue', 'green', 'red', 'cyan', 'magenta', 'yellow', 'white']
    for j in range(len(power)):
        colortype = colormap[j]
        labelname = 'App ' + str(j)
        plt.plot(t, y_disagg[j], color=colortype, label=labelname)

    plt.legend(bbox_to_anchor=(1.05, 1), loc=2, borderaxespad=0.)
    plt.title('disaggregation: ' + picname)
    plt.xlabel('Time (*xx s)')
    plt.ylabel('Power Consumption (kwh)')

    plt.savefig('disaggr_' + picname + '.png', bbox_inches='tight')
    plt.ion()  # turns on interactive mode
    plt.show()

    # === Display errors ===
    plt.figure()
    for j in range(len(power)):
        plt.subplot(len(power), 1, j + 1)
        plt.plot(t, y_true[j], 'b-', t, y_disagg[j], 'r-', t_plot, y_plot[j], 'y-')
        true_power = y_true.sum(axis=1)[j]
        disagg_power = y_disagg.sum(axis=1)[j]
        disagg_err = abs(disagg_power - true_power) / true_power * 100
        "App " + str(j) + ": " + str(disagg_power) + "/" + str(true_power) + " Kwh     Error " + str(
            disagg_err) + "%"

    total_err = abs(y_disagg - y_true).sum() / y_true.sum() * 100

    plt.savefig('apperr_' + picname + '.png', bbox_inches='tight')
    plt.show()

##############################################################
# class Disaggregation(OptimizerBase):

#    def __init__(self, optmizertask_id):
#        self.myopt_id = optmizertask_id
#        # parameters

#    def dailydisaggregation(self):

#         # parameters #
#         #define status space/# of appliances/min# of status#
#         status=np.array([[0,1,2,3,4],           # 
#                        [0,1,2,3,4,5],           #
#                        [0,1],                   #
#                        [0,1]])                  #

#         power=np.array([[0,38,76,114,152],      # pump
#                       [0,130,190,210,285,333],  # Chiller
#                       [0,55],                   # Fan
#                       [0,28]])                  # 

#         conditions=np.array([2,0,0,1])          # minimun number of on units
#         sampling_rate=60 #datapoints per hour
#         num_change=1 #define max # of changing unit:1 to num_app

#         # get optimizer object
#         opt_obj = OptimizerBase.get_optimizer(self, self.myopt_id)

#         # influx series name
#         '''series_name = [opt_obj.lighting_series_light.encode('utf-8')]'''
#         series_name=['atest02']
#         print "series name: %s" % series_name

#         # determine Start and End Time 
#         # IMPORTANT to make sure datetime are in Shanghai TZ
#         curTime = datetime.now(pytz.timezone('Asia/Shanghai'))
#         tipTime = datetime.fromtimestamp(OptimizerBase.get_series_tip_utc(self, series_name), tz=pytz.timezone('Asia/Shanghai'))

#         #        print curTime
#         #        print tipTime

#         if  (curTime - tipTime).days >= 2 :
#             curTime = tipTime

#         endTime = curTime.replace(hour=0, minute=0, second=0, microsecond=0)

#         startTime = endTime - timedelta(days=1)

#         '''startTime=datetime(2015, 8, 25, 16, 0)
#         endTime=datetime(2015, 8, 26, 16, 0)'''

#         print startTime, endTime

#         # fetch data
#         datalist = OptimizerBase.get_series_data(self, series_list=series_name, 
#            start_utc = calendar.timegm(startTime.utctimetuple()),
#            end_utc = calendar.timegm(endTime.utctimetuple()) )         

#         datapoints = datalist[0]['points']
#         # print data points
#         print datapoints[-1]
#         print datapoints[0]

#         #hourly data (assuming starting from 1:00), data is reverted 
#         data=np.array(list(reversed(zip(*datapoints)[2])))
#         time=np.array(list(reversed(zip(*datapoints)[0])))

#         print gmtime(time[0])
#         print gmtime(time[-1])

#         stat_p_err=disaggregation(time,data,status,power,conditions,sampling_rate,num_change)
#         #print stat_p_err
