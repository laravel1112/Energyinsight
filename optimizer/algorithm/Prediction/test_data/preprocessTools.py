# coding=utf-8
from __future__ import division
from __future__ import unicode_literals
from scipy.signal import savgol_filter
from scipy.stats.mstats import zscore
import numpy as np
import pandas as pd


class normalize_data():
    '''reindex_time, resample_data'''

    def __init__(self):
        pass

    def _reindex_time(self, points_sr, start_dt, end_dt, sample_rate,
                      time_zone='Asia/Shanghai'):
        """
        Description: revise index of pd.series to right time, fill no-exist as
                        Nan

        Parameters: points_sr: pandas.Series
                    start_dt: datetime,
                    end_dt: datetime,
                    sample_rate: str, unit 's'
                    time_zone: str, default 'Asia/Shanghai'

        Returns: points_sr_reindex: pandas.Series
        """
        index = pd.date_range(start_dt, end_dt, freq=sample_rate, tz=time_zone)

        points_sr_res = points_sr.resample(sample_rate).mean().fillna(np.nan)

        points_sr_reindex = points_sr_res.reindex(index[:-1])

        return points_sr_reindex

    def resample_data(self, points_sr, start_dt, end_dt, sample_rate,
                      obj_rate, is_power=True, time_zone='Asia/Shanghai'):
        """
        Description: resample pandas.Series to object rate

        Parameters: points_sr: pandas.Series
                    start_dt: datetime,
                    end_dt: datetime,
                    sample_rate: str, unit 's'
                    obj_rate, str, e.g. '1D', '10Min'
                    is_power: boolean
                    time_zone: str, default 'Asia/Shanghai'

        Returns: pd.Series
        """
        points_sr_reindex = self._reindex_time(points_sr, start_dt, end_dt,
                                               sample_rate, time_zone)

        points_sr_fill = points_sr_reindex.interpolate(limit_direction='both')

        if is_power:
            return points_sr_fill.resample(obj_rate).mean()
        else:
            electric_sr = points_sr_fill * (float(sample_rate[:-1])/3600)
            return electric_sr.resample(obj_rate).sum()

    def remove_outliers(self, points_sr, thresh=2.5, window_length=5,
                        polyorder=3, tz='Asia/Shanghai'):
        """
        Description: remove outliers by savgol_filter

        Parameters: points_sr: pandas.Series
                    thresh: float
                    window_length: int, odd number
                    polyorder: int
                    tz: str

        Returns: pandas.Series
        """
        points = points_sr.values
        points_filtered = savgol_filter(points, window_length, polyorder,
                                        mode='nearest')
        points_zscored = zscore(points-points_filtered)
        for i, score in enumerate(points_zscored):
            if abs(score) > thresh:
                points_sr[i] = np.nan

        return points_sr


if __name__ == "__main__":
    from loadTools import load_data
    from datetime import datetime
    user = 'mhshcc'
    pswd = 'mhshcc'
    server = 'app.equotaenergy.com'
    ID = '148'
    start_dt = datetime(2016, 5, 20)
    end_dt = datetime(2016, 6, 11)
    for ID in ['201']:
        points_sr = load_data().get_series_as_pd(user, pswd, server, ID, start_dt,
                                             end_dt)
        usage = normalize_data().resample_data(points_sr, start_dt, end_dt, '300s',
                                           '300s', False)
        print points_sr
        print len(points_sr)
        print points_sr.max()
        print ID, usage.sum()
    exit()
