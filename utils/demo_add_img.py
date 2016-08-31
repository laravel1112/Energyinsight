import urllib, urllib2, base64
import httplib2

import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
import requests
with open(os.path.join(BASE_DIR, "1.jpg"), 'rb') as f:
    print f
    print (type(f))
    a = os.path.join(BASE_DIR, "1.jpg")
    print a
    print(os.path.getsize(a))

    login = 'demouser'
    password = 'demouser'
    base64string = base64.encodestring('%s:%s' % (login, password)).replace('\n', '')
    headers = {'Authorization': 'Basic %s' % base64string }

    response = requests.post("http://localhost:8009/api/company/",
                             files={'logo': f}, data={"name": "test company222"},
                             headers=headers)
    print response.content


# from poster.encode import multipart_encode
# from poster.streaminghttp import register_openers
# import urllib2
# import os
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# import itertools

# register_openers()
#
# login = 'demouser'
# password = 'demouser'
# base64string = base64.encodestring('%s:%s' % (login, password)).replace('\n', '')
# print(base64string)
# additional = {'User-Agent': 'Mozilla/5.0',
#               'Authorization': 'Basic %s' % base64string }
#
# with open(os.path.join(BASE_DIR, "1.jpg"), 'r') as f:
#     datagen, headers = multipart_encode({"logo": f, "name": "55"})
#     headers['Authorization']= 'Basic %s' % base64string
#     print(headers)
#     print datagen
#     request = urllib2.Request("http://localhost:8009/api/company/", datagen, headers)
#     response = urllib2.urlopen(request,  timeout = 17)
#     the_page = response.read()
#     print (the_page)


# login = 'demouser
# password = 'demouser'
# base64string = base64.encodestring('%s:%s' % (login, password)).replace('\n', '')
#
# page = 'http://localhost:8009/api/company/'
# with open(os.path.join(BASE_DIR, "1.jpg"), 'rb') as image_file:
#     encoded_image = base64.b64encode(image_file.read())
# raw_params = {'name': '44', 'image': encoded_image}
# params = urllib.urlencode(raw_params)
# request = urllib2.Request(page, params)
# request.add_header("Content-type", "multipart/form-data")
# request.add_header('Authorization', 'Basic %s' % base64string)
# page = urllib2.urlopen(request,  timeout = 7)
# info = page.info()
# print info