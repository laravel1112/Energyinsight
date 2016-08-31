import numpy as np 
import pandas as pd 
from sklearn.cluster import MeanShift, estimate_bandwidth, SpectralClustering
from sklearn.datasets.samples_generator import make_blobs
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import normalize
"""
use correlation to detect anomaly among multiple curves.
assuption of this algorithm: curves have correlation 
"""
"""
how to use:
test = AnomalyCorr()
alert = test.exam(df)
df: format--pandas.DataFrame (0.18.1)
    index--pandas.datetime

"""
class AnomalyCorr():
	def __init__(self):
		pass
	# window points means the alert range of each time
	# for example: df's frequency is 5min, then 24 window points means 5min*24 = 2 hours
	def exam(self, df, window_points = 24):
		df['alert'] = None
		alert_index = list(df.index)
		alert_index_sliced = [alert_index[i:i+window_points] for i in xrange(0,len(alert_index),window_points)]
		
		for window in alert_index_sliced:
			corr_result = df.loc[window].corr("spearman").applymap(np.abs).sum().sum()
			df.ix[window,"alert"]=corr_result

		alert = df[["alert"]]
		normed = normalize(alert).reshape(alert.shape[0])
		alert = pd.DataFrame({"alert":normed},index=alert.index)
		alert["alert"]=alert["alert"].map(lambda x: 1-x)

		# if alert is 0: has high correlation, means good
		# if alert is 1: has low correlation, means not good, raise alert
		return alert
		
class AnomalyProp():
	def __init__(self):
		pass
	def exam(self,df):
		test = df.copy()
		# calculate slope of every target point and original point
		# cluster the slopes with mean shift
		k_record=[]
		for i,j in zip(test[0],test[1]):
			if np.isinf(i/j) or np.isnan(i/j):
				pass
			else:
				k_record.append(i/j)
		K = np.array(k_record).reshape(-1,1)

		# Compute clustering with MeanShift
		# The following bandwidth can be automatically detected using
		bandwidth = estimate_bandwidth(K)
		ms = MeanShift(bandwidth=bandwidth, bin_seeding=True)
		ms.fit(K)
		labels = ms.labels_
		cluster_centers = ms.cluster_centers_

		labels_unique = np.unique(labels)
		n_clusters_ = len(labels_unique)
		main_k = cluster_centers[0]

		print("number of estimated clusters : %d" % n_clusters_)
		print("most likely slope is: %f" % main_k)

		tol_band = 25
		alert_record_time, alert_record = self.mul_prop(df,main_k,tol_band)
		alert_index = alert_record_time
		alert_value = self.alert_record_filter(alert_record)

	# give tolerance from a line to a band
	def tolerance(self,line_k,t,x):
		bottom = x[0]*line_k-t
		top = x[0]*line_k+t
		if bottom < x[1] < top:
			return True
		else:
			return False

	# generate alert according to the slope band
	def mul_prop(self,df, slope, tol_band=25):
		alert_record = []
		alert_record_time=[]
		for row in df.dropna().iterrows():
			time = row[0]
			point = row[1]
			if self.tolerance(slope,tol_band,point):
				alert_record.append(0)
			else:
				alert_record.append(1)
			alert_record_time.append(time.to_datetime())
		return alert_record_time, alert_record

	def alert_record_filter(self, alert_record, alert_window_hour = 1, sample_in_an_hour = 12):
		cor_hex = []
		data = 0
		show_anomaly = 1
		show_non_anomaly = 0
		tol = int(sample_in_an_hour*alert_window_hour)
		for i in range(len(alert_record)):
			cor_hex.append(show_non_anomaly)
			if alert_record[i]==0:
				data = 0
			else:
				data = data+1
				if data>tol:
					cor_hex[(-1)*tol:]=[show_anomaly]*tol
		return cor_hex

class AnomalyDens():
	def __init__(self):
		pass
	def exam(self,df):
		DB = DBSCAN(eps=10, min_samples=20)
		DB.fit(df.values)
		labels = DB.labels_

		n=0
		alert_record = []
		alert_record_time = []
		for label,t in zip(labels,df.index):
			alert_record_time.append(t.to_datetime())
			if label==-1:
				alert_record.append(1)
				n=n+1
			else:
				alert_record.append(0)
		print "Cluster: ",set(labels)
		print "Num of outliers: ",n
		print "Num of total data: ",len(labels)

		alert_index = alert_record_time
		h = 1.0/12
		alert_value = self.alert_record_filter(alert_record,h)


	def alert_record_filter(self, alert_record, alert_window_hour = 1, sample_in_an_hour = 12):
		cor_hex = []
		data = 0
		show_anomaly = 1
		show_non_anomaly = 0
		tol = int(sample_in_an_hour*alert_window_hour)
		for i in range(len(alert_record)):
			cor_hex.append(show_non_anomaly)
			if alert_record[i]==0:
				data = 0
			else:
				data = data+1
				if data>tol:
					cor_hex[(-1)*tol:]=[show_anomaly]*tol
		return cor_hex
