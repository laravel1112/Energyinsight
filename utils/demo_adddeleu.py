import urllib, urllib2, base64
import httplib2


h = httplib2.Http(".cache")

login = 'demouser'
password = 'demouser'
h.add_credentials(login, password)
url = 'http://localhost:8000/' #PUT HERE YOUR ACTUAL SERVER ADDRESS

# # GET
# print "GET: "
# (resp_headers, content) = h.request(url+"api/energyunit", "GET")
# print(resp_headers)
# print(content)


# # POST WITH CREATING OF THE RELATED OBJECT
# print "POST: "
#
# data = '{ "type": "/api/unittype/Building/", "name": "A new test meter 777", "invisible": "True", "meterparam": {"manufacturer": "test manufacturer"}}'
# headers = {"content-type": "application/json"}
#
# (resp, content) = h.request(url+"api/energyunit/", "POST", data, headers)
#
# print(resp)
# print(content)


# # DELETE
# print "DELETE: "
# (resp_headers, content) = h.request(url+"api/energyunit/92/", "DELETE")
# print(resp_headers)
# print(content)


# PUT
print "PUT: "

data = '{ "type": "/api/unittype/Building/", ' \
       '"name": "A new test55"}'
headers = {"content-type": "application/json"}

(resp, content) = h.request(url+"api/energyunit/89/", "PUT", data, headers)

print(resp)
print(content)


# # POST
# print "POST: "
#
# data = '{"manufacturer": "A new meter"}'
# headers = {"content-type": "application/json"}
#
# (resp, content) = h.request(url+"api/meterparam/", "POST", data, headers)
#
# print(resp)
# print(content)


# # PUT
# print "PUT for Meterparam: "
#
# data = '{"manufacturer": "Manufacturerrrr"}'
# headers = {"content-type": "application/json"}
#
# (resp, content) = h.request(url+"api/meterparam/58/", "PUT", data, headers)
#
# print(resp)
# print(content)