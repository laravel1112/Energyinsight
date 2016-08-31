"""
To Do:
    Add to settings:
        INSTALLED_APPS += ('gunicorn', )
    Install new requirements:
        fabric==1.12.0
        gunicorn==19.6.0

    Add to ~/.bashrc
        export WORKON_HOME=/sites/.virtualenvs
        source /usr/local/bin/virtualenvwrapper.sh

    >> source ~/.bashrc

Improvements:
    - Remove /temp/ folder after fab deploy
    - Remove local_settings.py from repo and add it to .gitignore
    - Create fab command to modify ~/.bashrc file
    - Catch all exceptions
    - Remove 'deploy' folder

Settings:
    PROJECT_NAME
    DOMAIN
    env.hosts
    env.password
    env.user
    GIT_REPO

Commands to deploy a new project:
    >> fab deploy
         - It will install pip, virtualenv, sendmail, nginx, supervisor
         - Create `sites` folder for projects
         - Supervisor, nginx and gunicorn configs will be in /sites/<project_name>/deploy/ folder and
            will be symlinked
         - Logs in /sites/<project_name>/logs/
         - Media in /sites/<project_name>/media/, same with static /sites/<project_name>/static/
         - Git will be initialized in /sites/<project_name>/src/
         - Creating env
         - Installing requirements.txt
         - Migrating db based on local_settings.py
         - Collecting staticfiles
         - Installing nmp and running gulp

     In case of errors:
        >> fab install_requirements

To update existing project:
    >> fab update

Restart nginx:
    >> fab restart_nginx

Restart supervisor
    >> fab restart_project

"""


import os, sys
from fabric.api import *

env.hosts = ['120.132.6.207']
env.password = 'EquotaEnerg'
env.user = "ubuntu"
env.warn_only = True
# 'sites@120.132.6.207': 'EquotaEnergSites'
# env.key_filename=['firstAMIkey.pem']

GIT_REPO = 'https://adubnyak@bitbucket.org/equota/energyinsight2.0.git'

PROJECT_NAME = 'energy'
DOMAIN = 'energy.com'
PROJECT_ROOT = '/sites/%s/src/' % PROJECT_NAME


def add_projects_root():
    sudo('adduser sites')
    sudo('mkdir /sites')
    sudo('chown sites:sites /sites')
    # append('/etc/nginx/nginx.conf')
    # sites ALL=(ALL)NOPASSWD: ALL
    with settings(user='sites', password='EquotaEnergSites'):
        run('mkdir /sites/.virtualenvs')
        run('source ~/.bashrc')


def add_project():
    with settings(user='sites', password='EquotaEnergSites'):
        run('mkdir /sites/%s' % PROJECT_NAME)
        run('mkdir /sites/%s/deploy' % PROJECT_NAME)
        run('mkdir /sites/%s/src' % PROJECT_NAME)
        run('mkdir /sites/%s/media' % PROJECT_NAME)
        run('mkdir /sites/%s/static' % PROJECT_NAME)
        run('mkdir /sites/%s/logs' % PROJECT_NAME)
        run('exit')

    curpath = os.path.abspath(os.curdir)
    local('mkdir temp/')  # creating local folder

    gunicorn_local_file = '%s/temp/gunicorn.conf.py' % curpath
    gunicorn_filename = 'temp/gunicorn.conf.py'
    fp = open(gunicorn_filename, 'w+')
    gunicorn = """bind = "127.0.0.1:8888"
workers = 5
logfile = "/sites/%s/logs/gunicorn.log"
loglevel = "info"
proc_name = "%s"
""" % (PROJECT_NAME, PROJECT_NAME)
    fp.write(gunicorn)
    fp.close()
    put(gunicorn_local_file, '/sites/%s/deploy/gunicorn.conf.py' % PROJECT_NAME, use_sudo=True)

    supervisor_filename = 'temp/supervisor.conf'
    supervisor_local_file = '%s/temp/supervisor.conf' % curpath
    fp = open(supervisor_filename, 'w+')
    supervisor = """[program:%s]
command=/sites/.virtualenvs/%s/bin/gunicorn %s.wsgi -c /sites/%s/deploy/gunicorn.conf.py
directory=/sites/%s/src
user=sites
autostart=true
autorestart=true
stdout_logfile=/sites/%s/logs/supervisord.log
redirect_stderr=true
[program:celeryworker]
command=python %s/manage.py celery worker -n worker1 -f celery_log --loglevel=info -Q low

[program:celerybeat]
command=python %s/manage.py celery -A mobile_apps beat -l info
""" % (PROJECT_NAME, PROJECT_NAME, PROJECT_NAME, PROJECT_NAME, PROJECT_NAME, PROJECT_NAME, PROJECT_ROOT, PROJECT_ROOT)
    fp.write(supervisor)
    fp.close()
    put(supervisor_local_file, '/sites/%s/deploy/supervisor.conf' % PROJECT_NAME, use_sudo=True)

    nginx_filename = 'temp/nginx.conf'
    nginx_local_file = '%s/temp/nginx.conf' % curpath
    fp = open(nginx_filename, 'w+')
    nginx = """server {
    listen 80;
    server_name %s www.%s;
    charset utf8;
    autoindex off;
    client_max_body_size 128m;

    access_log /sites/%s/logs/nginx_access.log;
    error_log /sites/%s/logs/nginx_error.log;


    location / {
        proxy_pass http://127.0.0.1:8888;
        include proxy_params;
    }

    location /static {
        alias /sites/%s/static;
        #expires 1d;
    }
    location /media {
        alias /sites/%s/media;
 #expires 1d;
    }
}
            """ % (DOMAIN, DOMAIN, PROJECT_NAME, PROJECT_NAME, PROJECT_NAME, PROJECT_NAME)
    fp.write(nginx)
    fp.close()
    put(nginx_local_file, '/sites/%s/deploy/conf.conf' % PROJECT_NAME, use_sudo=True)

    sudo('ln -s /sites/%s/deploy/nginx.conf /etc/nginx/sites-enabled/%s' % (PROJECT_NAME, PROJECT_NAME))
    sudo('ln -s /sites/%s/deploy/supervisor.conf /etc/supervisor/conf.d/%s.conf' % (PROJECT_NAME, PROJECT_NAME))
    sudo('supervisorctl reread')
    sudo('supervisorctl update')
    sudo('supervisorctl exit')
    restart_nginx()
    restart_project()


def restart_nginx():
    sudo('/etc/init.d/nginx restart')


def restart_project():
    sudo('supervisorctl restart %s' % PROJECT_NAME)


def install_supervisor():
    with settings(prompts={'Do you want to continue [Y/n]? ': 'Y'}):
        sudo('apt-get install supervisor')
        sudo('apt-get install virtualenvwrapper')
        sudo('apt-get install python-virtualenv')
        sudo('apt-get install libjpeg62-dev')
        sudo('apt-get install python-imaging')
        sudo('apt-get install libjpeg8-dev')
        sudo('ln -s /usr/lib/x86_64-linux-gnu/libjpeg.so /usr/li')


def install_nginx():
    sudo('apt-add-repository ppa:nginx/stable')
    sudo('apt-get update')
    sudo('apt-get install nginx')


def install_useful_stuff():
    with settings(prompts={'Do you want to continue [Y/n]? ': 'Y'}):
        sudo('apt-get update')
        sudo('apt-get upgrade')
        sudo('apt-get install mc')
        sudo('apt-get install sendmail')
        sudo('apt-get install python-setuptools python-dev build-essential')
        sudo('easy_install pip')
        sudo('apt-get install python-software-properties')
        sudo('apt-get install gettext')
        sudo("apt-get install -y rabbitmq-server")
        sudo("apt-get install npm")


def pull_from_git():
    with settings(prompts={'Do you want to continue [Y/n]? ': 'Y'}):
        sudo('sudo apt-get install git')
    with cd(PROJECT_ROOT):
        sudo('git init')
        sudo('git remote add origin %s' % GIT_REPO)
        sudo('git fetch origin master')
        sudo('git pull')
        sudo('git checkout develop')


def update():
    with cd(PROJECT_ROOT):
        activate_venv()
        sudo('git pull')
        sudo('python manage.py collectstatic -l')
        sudo('gulp live')


def deploy():
    install_useful_stuff()
    install_nginx()
    install_supervisor()
    add_projects_root()
    add_project()
    create_env()
    pull_from_git()
    install_requirements()
    migrate()
    npm()


def activate_venv():
    with cd(PROJECT_ROOT):
        run('source ../../.virtualenvs/%s/bin/activate' % PROJECT_NAME)


def create_env():
    # with settings(warn_only=False):
        sudo('mkvirtualenv %s' % PROJECT_NAME)


def install_requirements():
    with cd(PROJECT_ROOT), settings(warn_only=False):
        activate_venv()
        sudo('pip install -r requirements.txt')


def migrate():
    with cd(PROJECT_ROOT):
        with settings(warn_only=False):
            activate_venv()
            sudo('python manage.py migrate')
            sudo('python manage.py collectstatic -l')


def status():
    sudo('supervisorctl status %s' % PROJECT_NAME)


def npm():
    with cd(PROJECT_ROOT):
        sudo('npm install')
        sudo('gulp live')

