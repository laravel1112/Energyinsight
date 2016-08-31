from sklearn.ensemble import RandomForestRegressor
import pandas as pd
import numpy as np
import time
from datetime import datetime

class RF():
    def __init__(self):
        pass

    def cal_error_for_list(self,pred,actual):
        error_abs=[]
        for i in range(len(pred)):
            error_abs.append(abs(pred[i]-actual[i]))
        actual_sum = np.array(actual).sum()
        error_sum = np.array(error_abs).sum()
        print "Mape Error = ",float(error_sum)/float(actual_sum)
        return error_sum,actual_sum

    def train(self, *df):

        total = pd.concat(df,axis=1).dropna()
        total["Month"] = total.index.map(lambda x: x.month)
        total["Weekday"] = total.index.map(lambda x: x.isoweekday())
        total["Hour"] = total.index.map(lambda x: x.hour)

        target = total[["Value"]]
        feature = total.copy().drop("Value",axis=1)

        Y = target.values.reshape(1,-1)[0]
        X = feature.values

        self.clf = RandomForestRegressor(n_estimators=10)
        self.clf = self.clf.fit(X, Y)

    def predict(self,*df):

        total = pd.concat(df,axis=1).dropna()
        total["Month"] = total.index.map(lambda x: x.month)
        total["Weekday"] = total.index.map(lambda x: x.isoweekday())
        total["Hour"] = total.index.map(lambda x: x.hour)


        try:
            target = total[["Value"]]
            feature = total.copy().drop("Value",axis=1)
            Y = target.values.reshape(1,-1)[0]
            X = feature.values
            pred = self.clf.predict(X)
            error,actual = self.cal_error_for_list(pred, Y)

        except:
            feature = total.copy()
            X = feature.values
            pred = self.clf.predict(X)
        pred_df = pd.DataFrame({"Value":pred},index=total.index)
        return pred_df