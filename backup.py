from influxdb.influxdb08  import InfluxDBClient as InfluxDBClient08
from influxdb import InfluxDBClient
import time


hostName='10.10.193.249'
newHostName='10.10.16.102'
hostPort=8086
username="svcuser"
password="svcuser"
database="EnergydB00"
oldClient=InfluxDBClient08(hostName,hostPort,username,password,database)

newClient=InfluxDBClient(newHostName,hostPort,username,password,database);

# serieToStart='enernoc_116'
# sql="select * from "+serieToStart;
# print "Built Query : "+sql;
# result=oldClient.query(sql,"s");
# if len(result)<1:
# 	continue;
# r=result[0];
# columns=r['columns'];
# points=r['points'];
# name=r['name'];
# bulksize=1000;
# index=0;
# while(index*bulksize<len(points)):
# 	curBulk=points[index*bulksize:(index+1)*bulksize];
# 	toWrite=[{
# 		"time":x[0],
# 		"measurement":"test_enerc",
# 		'fields':{
# 			'value':x[2],
# 		}
# 	} for x in curBulk];
# 	print "Uploading series "+name+ " bulk "+str(index);
# 	newClient.write_points(toWrite[index*bulksize:(index+1)*bulksize],time_precision="s");
# 	index=index+1;

# print "done"

listSeries=oldClient.get_list_series();

found=False;
for serie in listSeries:
	# if serie==serieToStart:
	# 	found=True;
	# if found==False:
	# 	continue;
	
	sql="select * from "+serie;
	print "Built Query : "+sql;
	result=oldClient.query(sql,"s");
	if len(result)<1:
		continue;
	r=result[0];
	columns=r['columns'];
	points=r['points'];
	name=r['name'];
	bulksize=1000;
	index=0;
	#delte it first
	newClient.delete_series(database=database,measurement=name,tags={"meter":"default"})
	
	while(index*bulksize<len(points)):
		curBulk=points[index*bulksize:(index+1)*bulksize];
		toWrite=[{
			"time":x[0],
			"measurement":name,
			'fields':{
				'value':x[2],
			}
		} for x in curBulk];
		print "Uploading series "+name+ " bulk "+str(index);
		newClient.write_points(toWrite[index*bulksize:(index+1)*bulksize],time_precision="s");
		index=index+1;
	#newClient.write_points(toWrite[index*bulksize:(index+1)*bulksize],time_precision="s",batch_size=1000);
	time.sleep(2)

