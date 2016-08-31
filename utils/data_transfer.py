import json
import base64
import urllib
import urllib2


class dataTransfer():
    def sendingRequestToDB(self, url, data):
        try:
            login = 'demouser'
            password = 'demouser'
            base64string = base64.encodestring('%s:%s' % (login, password)).replace('\n', '')
            print(base64string)

            additional = {'User-Agent': 'Mozilla/5.0', 'Authorization': 'Basic %s' % base64string }
            req = urllib2.Request(url, data, additional)
            result = urllib2.urlopen(req).read()
            #print result
            return result

        except Exception, e:
            print(e)


    def download(self, address, energy_unit_id, time_format='s', operation='raw'):
        try:
            values = {'isExternalRequest': True, 'time_format': time_format, 'operation': operation}
            data = urllib.urlencode(values)

            url = "http://" + address + "/api/getseries/"+energy_unit_id+"/"

            results = self.sendingRequestToDB(url, data)
            results = json.loads(results)
            returned_data = results[0]['points']
            time = zip(*returned_data)[0]
            data = zip(*returned_data)[2]

            results = map(list, reversed(zip(time, data)))
            print len(results)
        except:
            print "Failed to download"
            results = []

        return results

    def upload_data(self, address, energy_unit_id, points):

        while True:
            try:
                # self.client.write_points(json.dumps(v), 's', 5000)
                # print "Success to upload " + item
                # break
                values = {'isExternalRequest': True, 'points': points, 'time_format': 's', 'erase_flag': False}
                data = urllib.urlencode(values)

                url = "http://" + address + "/api/putseries/"+energy_unit_id+"/"

                self.sendingRequestToDB(url, data)
                print "Success to upload "
                break
            except:
                print "Failed to add, sleep 10s"
                time.sleep(10)
        return None

    def getEU(self,address):
        url="http://"+address+"/api/energyunit/";
        login = 'demouser'
        password = 'demouser'
        base64string = base64.encodestring('%s:%s' % (login, password)).replace('\n', '')
        print(base64string)

        additional = {'User-Agent': 'Mozilla/5.0', 'Authorization': 'Basic %s' % base64string }
        req = urllib2.Request(url=url)
        result = urllib2.urlopen(req).read()

if __name__ == "__main__":
    energy_unit_id = '81'

    dt = dataTransfer()
    #points = dt.download("localhost:8000", energy_unit_id)
    dt.getEU("localhost:8000");
    #dt.upload_data("app.equotaenergy.com", energy_unit_id, points)
    # print points
    exit()
