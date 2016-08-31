# coding=utf-8
import pandas as pd
import numpy as np
import csv
import os
import matplotlib.pyplot as plt
import time
from scipy.cluster.vq import kmeans, vq, whiten
from scipy.spatial.distance import cdist
import matplotlib
import math
from datetime import datetime
import pytz
from sklearn import tree
from pybrain.tools.shortcuts import buildNetwork
from pybrain.supervised.trainers import BackpropTrainer
from pybrain.datasets import SupervisedDataSet,UnsupervisedDataSet
from pybrain.structure import LinearLayer
from sklearn import cross_validation


class ReadData():
	def __init__(self, test_mode = None):
		self.test_mode = test_mode


    # the goal is to generate a time series 
	def read_temp_from_CSV(self, file_path, file_name):

		# import hourly temp
		temp = pd.DataFrame.from_csv(file_path+file_name)
		temp = temp[['WetBulbFarenheit','RelativeHumidity','Date','Time']]

		# store temp in data, datetime in index
		data = [value for value in temp['WetBulbFarenheit']]
		hum_value = [value for value in temp['RelativeHumidity']]
		index = []


		for j in temp.iterrows():
			c = datetime(int(str(j[1].Date)[0:4]),int(str(j[1].Date)[4:6]),int(str(j[1].Date)[6:8]),int(math.floor(j[1].Time/100)),int(j[1].Time-(math.floor(j[1].Time/100)*100)))
			index.append(c)
		ts_temp = pd.DataFrame({'Temp':data,'Hum':hum_value},index = index)
		ts_temp['Temp'] = ts_temp['Temp'].apply(self.filter_num)
		ts_temp['Hum'] = ts_temp['Hum'].apply(self.filter_num)
		
		hourly_temp = ts_temp.resample('H').mean().fillna(method='ffill')
		
		#self.external_series = pd.Dataframe({'Temp':hourly_temp,'Hum':})
		# prepare temp data
		self.external_series = hourly_temp
		self.prepare_temp_data()

	def read_energy_load_from_CSV(self, file_path, csv_file_name, time_zone,tag = 'value'):

		# set time zone
		local_tz = pytz.timezone(time_zone)

		# read energy load from csv file
		energy_load_read = pd.DataFrame.from_csv(file_path+csv_file_name)[tag]

		# convert energy load's index from timestamp to datetime format
		energy_index = [datetime.fromtimestamp(x,tz=local_tz) for x in energy_load_read.index]

		# reset the load's index
		energy_load = pd.DataFrame({'Value':list(energy_load_read)},index=energy_index).resample('H').mean()
		self.energy_load_series = energy_load.copy()

		# prepare load data
		self.prepare_load_data()
	
	def read_temp(self, temp_series):
		self.external_series = temp_series

		self.prepare_temp_data()
		
	def read_energy_load(self, energy_load_series):

		self.energy_load_series = energy_load_series
		
		self.prepare_load_data()
	
	def read_meta(self):
		pass
	"""
		reshape temp data from list-like to dailyblocks
	"""
	def to_dailyblocks(self, series_data):

		try:
			series_data = series_data.copy()
			series_data.columns = ["Value"]
	
			# eries_data = pd.DataFrame({"Temp":series_data.values},index = series_data.index)

			series_data['Time'] = series_data.index.map(lambda t: t.time())

			series_data['Date'] = series_data.index.map(lambda t: t.date())

			# reshape
			dailyblocks_data = pd.pivot_table(series_data, values='Value', index='Date', columns='Time', aggfunc='mean')

			# fill the missing data with the next available value
			dailyblocks_data = dailyblocks_data.fillna(method='ffill')
			return dailyblocks_data

		except:
			print "cannot convert to dailyblocks"

	def prepare_temp_data(self):
		"""
		generate features about temp accroding to temp and time information
		"""
		# convert series data to dailiblocks
		
		self.temp_series = pd.DataFrame({"Temp":self.external_series["Temp"]},index=self.external_series.index)
		self.dailyblocks_temp = self.to_dailyblocks(self.temp_series).dropna()
		self.low_temp = pd.DataFrame({'Low Temp': self.dailyblocks_temp.index.map(lambda t: self.dailyblocks_temp.loc[t].min())}, index = self.dailyblocks_temp.index)
		self.high_temp = pd.DataFrame({'High Temp': self.dailyblocks_temp.index.map(lambda t: self.dailyblocks_temp.loc[t].max())}, index = self.dailyblocks_temp.index)
		self.average_temp = pd.DataFrame({'Average Temp': self.dailyblocks_temp.index.map(lambda t: self.dailyblocks_temp.loc[t].mean())}, index = self.dailyblocks_temp.index)

		
		self.weekday_num = pd.DataFrame({'Weekday': self.dailyblocks_temp.index.map(lambda x: x.isoweekday())},index = self.dailyblocks_temp.index)
		#self.weekday_one_hot = pd.get_dummies(self.weekday_num['Weekday'])
		self.weekday_one_hot = self.to_one_hot_code(7, self.weekday_num['Weekday'])
		self.month_num = pd.DataFrame({'Month': self.dailyblocks_temp.index.map(lambda x: x.month)}, index = self.dailyblocks_temp.index)
		#self.month_one_hot = pd.get_dummies(self.month_num['Month'])
		self.month_one_hot = self.to_one_hot_code(12, self.month_num['Month'])

		#self.weekday_num_norm,_ = self.mean_norm(self.weekday_num)

		try:
			self.humidity_series = pd.DataFrame({"Hum":self.external_series["Hum"]},index=self.external_series.index)

			self.dailyblocks_hum = self.to_dailyblocks(self.humidity_series).dropna()

			self.average_hum = pd.DataFrame({'Average Hum': self.dailyblocks_hum.index.map(lambda t: self.dailyblocks_hum.loc[t].mean())}, index = self.dailyblocks_hum.index)

		except:
			print "no humidity"
			self.humidity_series = None
			self.dailyblocks_hum = None
			self.average_hum = None

		"""
		check with weather API
		"""
		try:
			weather_labels = set(external_series['Wx'].values)
		 	self.wx_series = pd.DataFrame({"Wx":self.external_series["Wx"]},index=self.external_series.index)
		 	self.dailyblocks_wx = self.to_dailyblocks(self.wx_series).dropna()
		 	self.wx_one_hot = self.to_one_hot_code(len(weather_labels), self.wx_num['Month'])
		except: 
			self.wx_one_hot = None


	def prepare_load_data(self):

		self.dailyblocks = self.to_dailyblocks(self.energy_load_series).dropna()
		self.dailyblocks_norm,_ = self.mean_norm(self.dailyblocks)

	def to_one_hot_code(self,num,x):
		df = []
		for i in x:
			row = [0]*num
			row[i-1] = 1
			df.append(row)
		return pd.DataFrame(df,index=x.index)

	def combine_filter(self, *part_join):

		# part_join is a list
		part = pd.concat(part_join, axis = 1)
		return part

	def combine_norm(self,norm_para = None, *part_join):
		part = pd.concat(part_join, axis = 1)
		part_norm, norm_info = self.mean_norm(part, norm_para)

		return part_norm,norm_info

	def mean_norm(self, x, norm_para = None):
		if type(norm_para) == dict:
			return (x-norm_para["mean"])/(norm_para["max"]-norm_para["min"]),None
		else:
			return (x-x.mean())/(x.max()-x.min()),{"max":x.max(),"min":x.min(),"mean":x.mean()}

	def filter_num(self, x):
		try:
			return np.float(x)
		except:
			return np.nan

	# make two dataframes at same size
	def same_size(self, a, b):
		a = a.copy().dropna()
		b = b.copy().dropna()
		for i in a.index:
			if i in b.index:
				pass
			else:
				a = a.drop(i)
		for i in b.index:
			if i in a.index:
				pass
			else:
				b = b.drop(i)
		return a,b

	def blocks_to_series(self, table, name = "Value"):
		series_index = []
		series_value = []
		import datetime
		for date,value in table.iterrows():
			for hour in range(len(value)):
				series_index.append(datetime.datetime.combine(date,datetime.time(hour,0)))
				series_value.append(value[hour])
		ts = pd.DataFrame({name:series_value}, index = series_index )
		return ts

	def print_info(self):
		pass


	def plot_data(self, name):
		pass



class Cluster_methods():
	def __init__(self, data):
		self.data = data.dropna()

	def kmeans_cluster(self, cluster_num = 4):
		daily_matrix=np.matrix(self.data)
		centers, distance = kmeans(daily_matrix, cluster_num, iter=10000)
		cluster, _ = vq(daily_matrix, centers)
		clusterdf = pd.DataFrame({'ClusterNo':cluster},index = self.data.index)

		return clusterdf


# decision tree

class Decision_tree():
    def __init__(self):
        pass
    def train(self, feature, label):

        Y = label['ClusterNo'].astype(str)
        X = feature.values
        
        clf = tree.DecisionTreeClassifier()
        self.clf = clf.fit(X, Y)
        print "Decision Tree has been trained"
       
    def prediction(self, feature, label = None):
        
        X = feature.values 

        tree_predict = self.clf.predict(X)

        result_table = pd.DataFrame({'ClusterNo':tree_predict}, index = feature.index)

        # print accuracy if the label is given
        if type(label)==pd.DataFrame:
        	correct_num = 0
        	for time in result_table.index:

        		if result_table.loc[time][0] == str(label.loc[time][0]):
        			correct_num+=1

        	print 'Decision Tree Accuracy=',float(correct_num)/float(result_table.shape[0])

        return result_table


class ANN():
	def __init__(self, net_num = 1):
		self.net_num = net_num
		self.prediction_net = [0]*net_num
		self.error_abs_sum=[]
		self.error_actual_sum=[]
		self.result = {}
		self.predict_plot = []

	def cal_error_sum(self):
		self.abs_sum = np.array(self.error_abs_sum).sum()
		self.actual_sum = np.array(self.error_actual_sum).sum()
		return self.abs_sum/self.actual_sum
	# 
	def cal_error_for_list(self,pre,a):
		error_abs=[]
		for i in range(len(pre)):
			error_abs.append(abs(pre[i]-a[i]))
		self.error_abs_sum.append(np.array(error_abs).sum())
		self.error_actual_sum.append(np.array(a).sum())

	def plot_record(self):
		pass


	def train_net(self, input_table, daily, label= None, hidden_num = 40, epoch_num = 200):
		if self.net_num == 1:
			ds = SupervisedDataSet(input_table.shape[1], daily.shape[1])
			for time,value in daily.iterrows():
				ds.addSample(input_table.loc[time],daily.loc[time])
			self.prediction_net[0] = buildNetwork(input_table.shape[1], hidden_num, daily.shape[1], outclass=LinearLayer,bias=True)
			trainer = BackpropTrainer(self.prediction_net[0], ds)
			trainer.trainEpochs(epoch_num)
		else:
			for i in range(self.net_num):
			
				pure_f=label[label['ClusterNo'].isin([i])].copy()

				ds = SupervisedDataSet(input_table.shape[1], daily.shape[1])

				for time,value in pure_f.iterrows():
					ds.addSample(input_table.loc[time],daily.loc[time])

				self.prediction_net[i] = buildNetwork(input_table.shape[1],hidden_num, daily.shape[1], outclass=LinearLayer,bias=True)

				trainer = BackpropTrainer(self.prediction_net[i], ds)
				trainer.trainEpochs(epoch_num)
 		print "ANN has been trained"
	def test_net(self, input_table, daily = None, label = None):
		if self.net_num == 1:
			
			for date,value in input_table.iterrows():

				ts = UnsupervisedDataSet(input_table.shape[1],)

				ts.addSample(value)

				pred = self.prediction_net[0].activateOnDataset(ts)[0]

				self.predict_plot.append(pred)
				self.result[date] = pred

				actual = np.array(daily.loc[date])				

				self.cal_error_for_list(pred,actual)

		else:
			for date,classNo in label.iterrows():
				classNo_int=int(classNo[0])

				# add test sample
				ts = UnsupervisedDataSet(input_table.shape[1],) 

				ts.addSample(input_table.loc[date])
	
				# create prediction result

				pred = self.prediction_net[classNo_int].activateOnDataset(ts)[0]  

				self.predict_plot.append(pred)
				self.result[date] = pred


				if isinstance(daily, pd.DataFrame):
					
					actual=np.array(daily.loc[date])
					self.cal_error_for_list(pred,actual)
					
				else:
					pass
		if isinstance(daily, pd.DataFrame):
			
			print "MAPE = ",self.cal_error_sum()
			


class ANN_Prediction():
	def __init__(self, cluster_num = 4, hidden_num = 40, epoch_num = 200):
		self.cluster_num = cluster_num
		self.hidden_num = hidden_num
		self.epoch_num = epoch_num
		self.plot_record_real = []
		self.plot_record_pred = []


	def train(self,temp_data_train ,load_data_train):
 		"""
 		read train data
 		"""
		dataset_train = ReadData()
		dataset_train.read_energy_load(load_data_train)
		
		dataset_train.read_temp(temp_data_train)

		"""
		k-means
		"""
		cluster = Cluster_methods(dataset_train.dailyblocks_norm)
		cluster_result = cluster.kmeans_cluster(self.cluster_num)
		self.cluster_result = cluster_result


		"""
		decision tree, important, please add feature here
		"""
		""""
		add new feature here
		"""
		feature_train = dataset_train.combine_filter(dataset_train.low_temp, dataset_train.high_temp, dataset_train.average_temp, dataset_train.wx_one_hot, dataset_train.average_hum, dataset_train.weekday_one_hot)
		

		DT = Decision_tree()
		feature_train, cluster_result = dataset_train.same_size(feature_train, cluster_result)
		self.feature_train = feature_train


		DT.train(feature_train, cluster_result)
		self.DT = DT
		

		# ann 
		""""
		add new feature here
		"""
		input_table_train,self.norm_info = dataset_train.combine_norm(None, dataset_train.dailyblocks_temp, dataset_train.average_hum, dataset_train.wx_one_hot, dataset_train.weekday_one_hot)
		input_table_train, daily_train = dataset_train.same_size(input_table_train, dataset_train.dailyblocks)

		self.input_table_train = input_table_train
		self.daily_train = daily_train

		ANN_predictor = ANN(self.cluster_num)
		ANN_predictor.train_net(input_table_train, daily_train, cluster_result, self.hidden_num, self.epoch_num )
		self.ANN_predictor = ANN_predictor
		

	def predict(self, temp_data_test, load_data_test = None, test_mode = False):

		"""
		read test data
		"""
		
		dataset_test = ReadData()
		dataset_test.read_temp(temp_data_test)

		if type(load_data_test) == pd.DataFrame:
			dataset_test.read_energy_load(load_data_test)
		self.dataset_test = dataset_test

		# generate feature
		""""
		add new feature here
		"""
		self.feature_test = dataset_test.combine_filter(dataset_test.low_temp, dataset_test.high_temp, dataset_test.average_temp, dataset_test.average_hum, dataset_test.wx_one_hot, dataset_test.weekday_one_hot)
		
		# set whether check the DT result
		"""
		use dicision tree to obtain which cluster the day belong to 
		"""
		if test_mode == True:
			self.ann_label = self.DT.prediction(self.feature_test, self.cluster_result)
		else:
			self.ann_label = self.DT.prediction(self.feature_test)
		
		"""
		normalize input_table using self.norm_info
		"""
		""""
		add new feature here
		"""
		input_table_test,_ = dataset_test.combine_norm(self.norm_info, dataset_test.dailyblocks_temp, dataset_test.average_hum, dataset_test.wx_one_hot, dataset_test.weekday_one_hot)
		self.input_table_test = input_table_test

		if type(load_data_test)==pd.DataFrame:
			self.daily = dataset_test.dailyblocks



		input_table_test, self.ann_label = dataset_test.same_size(input_table_test, self.ann_label)
	
		# check if has load_data_test
		"""
		use ann to predict feature load
		"""
		if type(load_data_test)==pd.DataFrame:
			dataset_test.same_size(input_table_test,self.daily)
			self.ANN_predictor.test_net(input_table_test, self.daily, self.ann_label)
		else:
			self.ANN_predictor.test_net(input_table = input_table_test, label = self.ann_label)

		self.result = self.ANN_predictor.result
		pred_result = pd.DataFrame(self.result).T


		pred_index = []
		pred_value = []
		import datetime
		for date,value in pred_result.iterrows():
			for hour in range(len(value)):
				pred_index.append(datetime.datetime.combine(date,datetime.time(hour,0)))
				pred_value.append(value[hour])
		ts = pd.Series(pred_value,name = "Value",index= pred_index )


		self.ts_result = ts
		return ts, self.ANN_predictor.abs_sum, self.ANN_predictor.actual_sum

	

	def cross_validation(self, temp_data, load_data, n_iter = 1, test_size=0.05):
		"""
 		read data
 		"""
 		data_info = {"Hum":None}

 		abs_cv = []
 		actual_cv = []


		d = ReadData()
		d.read_energy_load(load_data)
		d.read_temp(temp_data)

		self.train_hum = None
		self.test_hum = None
		# generate cross validation list
		ss = cross_validation.ShuffleSplit(d.dailyblocks.shape[0], n_iter, test_size, random_state=0)
		for train,test in ss:
			ds = pd.DataFrame({"Date":list(set(d.external_series.index.date))})

			self.train_load = d.energy_load_series.select(lambda x: x.date() in ds.iloc[train].values, axis=0)
			self.test_load = d.energy_load_series.select(lambda x: x.date() in ds.iloc[test].values, axis=0)

			self.train_ex = d.external_series.select(lambda x: x.date() in ds.iloc[train].values, axis=0)
			self.test_ex = d.external_series.select(lambda x: x.date() in ds.iloc[test].values, axis=0)
			

			self.train(self.train_ex,self.train_load)
			test_result, abs_one_time, actual_one_time = self.predict(self.test_ex,self.test_load)

			abs_cv.append(abs_one_time)
			actual_cv.append(actual_one_time)

			self.plot_record_real.append(self.test_load)
			self.plot_record_pred.append(test_result.to_frame())

		self.plot_real = pd.concat(self.plot_record_real, axis = 0)
		self.plot_pred = pd.concat(self.plot_record_pred, axis = 0)

		total_error_cv = np.array(abs_cv).sum()/np.array(actual_cv).sum()
		print "Total abs error = ",total_error_cv



		
	


