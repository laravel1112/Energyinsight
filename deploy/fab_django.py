"""Deployment of your django project.
"""

from fabric.api import *
from fabric.contrib import *
import os
import socket
import time
from fab_nginx import deploy_nginx, start_nginx


PROJECT_PATH="/webapp/"
GIT_PROJECTNAME="energyinsight2.0";
GIT_REMOVE_REPO="https://evilsantac@bitbucket.org/equota/energyinsight2.0.git";
VENV="venv/"

@with_settings(warn_only=True)
def deploy_django(port):
    setup_dependency();
    setup_folders();
    setup_virtualenv();
    setup_uwsgi();
    update_django_project();
    setup_supervisord()
    start_supervisord();
    #start_uwsgi(port);

def start_supervisord():
    # start supervisord
    sudo("invoke-rc.d rabbitmq-server start")
    with prefix('source '+PROJECT_PATH+'venv/bin/activate'):
        run("supervisord");


@with_settings(warn_only=True)
def setup_dependency():
    sudo("apt-get update");
    sudo("apt-get install -y git python2.7-dev python-virtualenv python-pip fabric libreadline-dev libncurses5-dev libpcre3-dev libssl-dev perl make build-essential nodejs nodejs-legacy npm",shell=False);
    sudo("apt-get install -y libblas3gf libc6 libgcc1 libgfortran3 liblapack3gf libstdc++6 build-essential gfortran libblas-dev liblapack-dev libatlas-base-dev python-all-dev")
    # install rabbitmq
    with cd(PROJECT_PATH):
        # run("wget http://www.rabbitmq.com/releases/rabbitmq-server/v3.6.2/rabbitmq-server_3.6.2-1_all.deb");
        # sudo("dpkg -i rabbitmq-server_3.6.2-1_all.deb")
        # sudo("apt-get install -yf")
        run("echo 'deb http://www.rabbitmq.com/debian/ testing main' | sudo tee /etc/apt/sources.list.d/rabbitmq.list");
        sudo("apt-get update");
        sudo("apt-get install -y rabbitmq-server");
        #create symlink for the log file
        sudo("ln -s /var/log/rabbitmq "+PROJECT_PATH+"logs/rabbitmq")
def setup_folders():
    sudo("mkdir -p "+PROJECT_PATH);
    sudo("chmod 755 "+PROJECT_PATH);
    sudo("chown ubuntu "+PROJECT_PATH);
    run("mkdir -p "+PROJECT_PATH+"logs");

def setup_virtualenv():
    # Install virtualenv
    sudo("sudo apt-get install -y git python-virtualenv");
    if files.exists(PROJECT_PATH)==False:
        setup_folders();
    if files.exists(PROJECT_PATH+VENV+'/bin/activate'):
        return;
    with cd(PROJECT_PATH):
        run('virtualenv '+VENV)

def setup_uwsgi():
    if files.exists(PROJECT_PATH)==False:
        setup_folders();
    if files.exists(PROJECT_PATH+VENV+'/bin/uwsgi'):
        return;
    with prefix('source '+PROJECT_PATH+VENV+'bin/activate'):
        run('pip install uwsgi');
def create_swap():
    if files.exists("/swapfile"):
        with cd("/"):
            result=run('swapon -s');
            if "swapfile" not in result:
                sudo("swapon swapfile");
        return;
    with cd("/"):
        sudo("dd if=/dev/zero of=swapfile bs=1M count=3000");
        sudo("mkswap swapfile");
        sudo("swapon swapfile");

def update_django_project():
    """ Updates the remote django project.
    """
    
    if files.exists(PROJECT_PATH+GIT_PROJECTNAME):
        with cd(PROJECT_PATH+GIT_PROJECTNAME):
            run('git pull');
    else:
        run('git clone %s %s' % (GIT_REMOVE_REPO,PROJECT_PATH+GIT_PROJECTNAME));
    with cd(PROJECT_PATH+GIT_PROJECTNAME):
        with prefix('source '+PROJECT_PATH+'venv/bin/activate'):
            run('npm install');
            sudo('npm install -g gulp');
            create_swap();
            run('pip install -r requirements.txt')
            # These three some times install fails. better running them again.
            run('pip install scipy')
            run('pip install sklearn')
            run('pip install jwt')
            run('gulp live --min');
            run('python manage.py syncdb')
            run('python manage.py migrate') # if you use south
            run('python manage.py collectstatic --noinput')

def setup_supervisord():
    with prefix('source '+PROJECT_PATH+'venv/bin/activate'):
        run('pip install supervisor')
    put('deploy/conf/supervisord.conf',PROJECT_PATH+VENV+'supervisord.conf');

def start_uwsgi(BINDING_SOCKET):
    # check if uwsgi is installed
    if BINDING_SOCKET is None:
        print "No socket to bind"
        return
    if files.exists(PROJECT_PATH)==False:
        setup_folders();
    if files.exists(PROJECT_PATH+VENV+"bin/uwsgi")==False:
        setup_uwsgi();
    with prefix('source '+PROJECT_PATH+VENV+'bin/activate'):
        with cd(PROJECT_PATH+GIT_PROJECTNAME):
            #run uwsgi
            run("uwsgi --socket :"+BINDING_SOCKET+" --module energyinsight.wsgi");
