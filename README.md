EnergyInsight v0.1
===================

EnergyInsight Web Application Repository

## Node JS ##

* Download nodejs from https://nodejs.org/en/ and install it. Also setup PATH variable so that you can execute node in command line. The nodejs will also install npm,(nodejs package management) in the same directory. so you should also be able to invoke npm in command line.
* At project root folder, and use command: 

    `$ npm install`
    
    It should install all necessary packages. If you get error message like "module xxx does not exist", just do "npm install xxx" where xxx is the module name.

    To compile JS files, use command:
    `$ gulp live`

## Python/Django ##
* Install python 2.7 and pip package manager 
* Set up a virtual environment is strongly suggested. A good reference is at: http://docs.python-guide.org/en/latest/dev/virtualenvs/
* Install required Python packages listed in the `requirements.txt` file. An easy way to do is `pip install -r
requirements.txt`. If you are using Windows, it may be necessary to install some packages (like psycopg2) downloaded
pre-built from http://www.lfd.uci.edu/~gohlke/pythonlibs/#psycopg instead of using `pip`.

* [Optional] Create a `local_settings.py` file in the `energyinsight/energyinsight` directory by copying `local_settings.py.SAMPLE`
and modify it:

    - You can set `ALLOWED_HOSTS = ['*']` for development purposes, but for production set it to the actual domain name,
    e.g. `['example.com', 'www.example.com']`
    - For SQLite you don't need to do modify the database settings. For another database (like PostgreSQL) change the
    database name, username and password if necessary.
    - Change the email server information if necessary

* [Optional] Run `python manage.py collectstatic`, `python manage.py makemigrations` and `python manage.py migrate` commands

* [Optional] Run `python manage.py createsuperuser` to create (super)user

* Run the Django Development Web Server by issuing the command `python manage.py runserver 0.0.0.0:8000`.
Please make sure that you have no other web servers listening TCP port 8000, otherwise it will fail to start.
Test the application thoroughly to see if it works before installing the production web server by browsing to
http://localhost:8000/. The login info:
 
    - Demouser: demouser/demouser
    - Admin:  equotaadmin/equotaadmin



## Celery ##

* Prerequisit:  celery, djcelery & flower python packages should be installed from requirementtxt

* Message Router setup: Download and install Rabbitmq from:   http://www.rabbitmq.com/install-homebrew.html. Follow the instructions to some additional setup: http://www.rabbitmq.com/download.html

    Run manually rabbitmq-server.bat file to start rabbitmq server.
    `$ rabbitmq-server -detached`
    
* Start beat in a new terminal as following

    `$ python manage.py celery -A energyinsight beat -l info`
    
* Start worker threads in a new terminal as following:

    `$ python manage.py celery worker -n worker1 -f celery_log --loglevel=info -Q low,high`
    
    The command can specify the name of queue a worker thread is listening. The above command uses both queues `low,high`
    
    You can monitor the worker threads by running the flower command will start a web-server that you can visit:

   `$ python manage.py  celery -A energyinsight flower`
   
    The default port is http://localhost:5555, but you can change this using the –port argument:


## Set Up Web Server (unfinished) ##

* `pip install uwsgi`

* `apt-get install nginx`

Configuration

* Create a configuration file for your web site (e.g. example.com) in
`/etc/nginx/sites-available` directory. An example configuration file is included in the `_config/nginx` directory.

* Create a symbolic link of your configuration file in `/etc/nginx/sites-enabled`:

    `ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled`

* Create a directory called `/etc/uwsgi` and create a file named `energyinsight.ini` in it.
An example ini file is included in the `_config/uwsgi` directory.

* Make uwsgi auto-start on boot by putting a `uwsgi.conf` file in `/etc/init`.
An example `uwsgi.conf` file is included in the `_config/uwsgi` directory:

Reboot the system to check if everything works ok.


### Deploy a new project: ###
#### To Do: ####
* Add to settings:
    `INSTALLED_APPS += ('gunicorn', )`
    
* Install new requirements:
    fabric==1.12.0
    gunicorn==19.6.0
    
* Add to `~/.bashrc`
    export WORKON_HOME=/sites/.virtualenvs
    source /usr/local/bin/virtualenvwrapper.sh

    `$ source ~/.bashrc`    
     
#### Settings before deploy ####
 Change settings in `fabfile.py`

* PROJECT_NAME
* DOMAIN
* env.hosts
* env.password
* env.user
* GIT_REPO 

#### Run command locally: #### 
`$ fab deploy`

 - It will install pip, virtualenv, sendmail, nginx, supervisor
 - Create `sites` folder for projects
 - Supervisor, nginx and gunicorn configs will be in `/sites/project_name/deploy/` folder and
    will be symlinked
 - Logs in `/sites/project_name/logs/`
 - Media in /sites/`project_name`/media/, same with static `/sites/project_name/static/`
 - Git will be initialized in `/sites/project_name/src/`
 - Creating env
 - Installing requirements.txt
 - Migrating db based on `local_settings.py`
 - Collecting staticfiles
 - Installing nmp and running gulp

#### To update existing project: ####
`$ fab update`

#### Restart supervisor: ####
`$ fab restart_project` 

#### Restart nginx: ####
`$ fab restart_nginx`

#### Improvements: #### 
- Remove `/temp/` folder after fab deploy
- Remove `local_settings.py` from repo and add it to `.gitignore`
- Create fab command to modify `~/.bashrc` file
- Catch all exceptions
- Remove `deploy` folder
