from pynginxconfig import NginxConfig 


def generate(inputf,outputf,PROJECT_PATH='/webapp/',DJANGO_SERVERS=["localhost:80","localhost:81"],TWISTED_SERVERS=["localhost:8000","localhost:8001"],SHINY_SERVERS=["localhost:80","localhost:81"]):
	UWSGI_PARAM=PROJECT_PATH+'uwsgi_params';
	DJANGO_ROOT=PROJECT_PATH+"energyinsight2.0/"
	nc=NginxConfig()
	nc.loadf(inputf);


	# Set twisted server upstream
	twisted_servers=[('server',x) for x in TWISTED_SERVERS];
	nc.set([('http',),('upstream','twisted')],twisted_servers);

	# Set django server upstream
	django_servers=[('server',x) for x in DJANGO_SERVERS];
	nc.set([('http',),('upstream','django')],django_servers);
	# Set shiny server upstream
	shiny_servers=[('server',x) for x in SHINY_SERVERS];
	nc.set([('http',),('upstream','shiny')],shiny_servers);
	
	# Set the uwsgi_parameters
	nc.set([('http',),('server',),('location','~ ^\\/api\\/(put|get)series'),'include'],UWSGI_PARAM)
	nc.set([('http',),('server',),('location','/'),'include'],UWSGI_PARAM)
	nc.set([('http',),('server',),('location','/static')],[('root',DJANGO_ROOT+"/")])
	
	# set lua path
	nc.set([('http',),'lua_package_path'],"\""+PROJECT_PATH+"jwt/?.lua;;\"");


	# http_block=nc.get(('http',))['value'];
	# for b in http_block:
	# 	if b['name']=='server':
	# 		for i,t in enumerate(b['value']):
	# 			if isinstance(t,tuple) and t[0]=='lua_package_path':
	# 				b['value'][i]=('lua_package_path',"\""+PROJECT_PATH+";;\"");
	
	nc.savef(outputf)
# setup twisted server configuration
#nc.append({'name':'upstrea','param':'twisted','value':[('server','localhost'),('server','app.equotaenergy.com')]},http_block,position=1);
# setup django server configuration
#nc.append({'name':'upstrea','param':'django','value':[('server','localhost'),('server','app.equotaenergy.com')]},http_block,position=1);



#print(nc.gen_config())