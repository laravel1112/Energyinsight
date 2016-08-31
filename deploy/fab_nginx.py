
from fabric.api import *
from fabric.contrib import *
from conf.config_generator import generate
import os
from energyinsight.local_settings import JWT_SECRET_KEY

def setup_folders(PROJECT_PATH="/webapp/"):
    sudo("mkdir -p "+PROJECT_PATH);
    sudo("chmod 755 "+PROJECT_PATH);
    sudo("chown ubuntu "+PROJECT_PATH);
    run("mkdir -p "+PROJECT_PATH+"logs");

def setup_nginx(PROJECT_PATH="/webapp/"):
    sudo("sudo apt-get update");
    sudo("sudo apt-get install -y git python2.7-dev python-virtualenv python-pip fabric libreadline-dev libncurses5-dev libpcre3-dev libssl-dev perl make build-essential",shell=False);

    if files.exists("/usr/local/openresty"):
        print "Nginx is already installed"
        return
    with cd(PROJECT_PATH):
        if files.exists("openresty-1.9.15.1.tar.gz")==False:
            run("wget https://openresty.org/download/openresty-1.9.15.1.tar.gz");
        # extract 
        run("tar xvf openresty-1.9.15.1.tar.gz");
        with cd("openresty-1.9.15.1"):
            run("./configure --with-pcre-jit --with-ipv6");
            run("make");
            sudo("make install");
            # Now setup path
            run("export PATH=/usr/local/openresty/bin:/usr/local/openresty/nginx/sbin:$PATH");
            # This might add more entry if this function is run many times.....
            #run("echo export PATH=/usr/local/openresty/bin:/usr/local/openresty/nginx/sbin:\$PATH > ~/.bash_profile");

def setup_nginx_jwt(PROJECT_PATH="/webapp/"):
    if files.exists("/usr/local/openresty")==False:
        setup_nginx();
    with cd(PROJECT_PATH):
        if files.exists("nginx-jwt.tar.gz")==False:
            run("wget https://github.com/auth0/nginx-jwt/releases/download/v1.0.1/nginx-jwt.tar.gz");
        run("mkdir -p jwt");
        run("tar xvf nginx-jwt.tar.gz -C jwt");

def setup_nginx_config(DHost,THost,SHost,PROJECT_PATH="/webapp/"):
    if files.exists("/usr/local/openresty")==False:
        setup_nginx();
    put('deploy/uwsgi_params',PROJECT_PATH+'uwsgi_params');
    # need more parameters on generating config
    generate('deploy/conf/nginx_template.conf','nginx_config',PROJECT_PATH,DHost,THost,SHost);
    put('nginx_config',PROJECT_PATH+'equota.conf',use_sudo=True);


def start_nginx(PROJECT_PATH="/webapp/"):
    with cd(PROJECT_PATH):
        with prefix("export PATH=/usr/local/openresty/bin:/usr/local/openresty/nginx/sbin:$PATH"):
            # Check if nginx is running
            with prefix("export JWT_SECRET="+JWT_SECRET_KEY):
                if files.exists(PROJECT_PATH+"logs/nginx.pid"):
                    try:
                        sudo("nginx -p `pwd`/ -c equota.conf -s stop" );
                    except:
                        pass;
                sudo("nginx -p `pwd`/ -c equota.conf" );


def deploy_nginx(DHost="",THost="",SHost="",PROJECT_PATH="/webapp/"):
    """ Install and start nginx;
    """
    #setup_folders(PROJECT_PATH);
    #setup_nginx(PROJECT_PATH);
    #setup_nginx_jwt(PROJECT_PATH);
    #setup_nginx_config(DHost,THost,SHost,PROJECT_PATH,);
    start_nginx(PROJECT_PATH);