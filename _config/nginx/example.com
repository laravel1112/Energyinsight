server {
    server_name www.example.com;
    charset utf-8;
    client_max_body_size 75M;

    location /media  {
        alias /var/www/energyinsight/media;
        expires 1d;
    }

    location /static {
        alias /var/www/energyinsight/static;
        expires 1d;
    }

    location /robots.txt {
        alias /var/www/energyinsight/static/robots.txt;
    }

    location /favicon.ico {
        alias /var/www/energyinsight/static/favicon.ico;
    }

    location / {
        uwsgi_pass unix:///var/www/energyinsight/uwsgi.sock;
        include /etc/nginx/uwsgi_params;
    }
}
