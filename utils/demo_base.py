import urllib, urllib2, base64
import requests
import pytz
import json
class base(object):
	def __init__(self):
		self.username="demouser"
		self.password="demouser"
		self.tz=pytz.timezone("Asia/Shanghai")
		self.setToken();	

	def setToken(self):
		url="http://localhost:8000/api-token-auth/"
		values={"username":self.username,"password":self.password};
		data=json.dumps(values)
		additional = {'User-Agent': 'Mozilla/5.0'}
		req = urllib2.Request(url, data, additional)
		try:
			result = urllib2.urlopen(req).read()
			result=json.loads(result);
			self.token=result['token']
			print "token is set",self.token
		except urllib2.HTTPError, e:
			print "Authentication failed with error code: "+str(e.code)
		except Exception:
			import traceback
			print traceback.format_exc()

	def sendingRequestToDB(self, url, data):
		if self.token is None:
			print "Token is not set"
			return None;
		try:
			additional = {'User-Agent': 'Mozilla/5.0', 'Authorization':  "Bearer "+self.token}
			req = urllib2.Request(url, data, additional)
			result = urllib2.urlopen(req).read()
			return result
		except Exception, e:
			print(e)
			
	def checking_eu_availability(self, energy_unit_id):
		values = {"isExternalRequest": True, "isHTMLResponseRequired": True, "energy_unit_id": energy_unit_id}
		data = urllib.urlencode(values)
		# data = values
		url = "http://localhost:8000/api/eu/"
		is_available = self.sendingRequestToDB(url, data)
		return is_available



