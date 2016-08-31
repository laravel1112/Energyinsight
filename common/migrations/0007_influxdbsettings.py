# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0006_auto_20151211_1002'),
    ]

    operations = [
        migrations.CreateModel(
            name='InfluxdbSettings',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(default=None, max_length=255, null=True, blank=True)),
                ('is_active', models.BooleanField(default=False)),
                ('host_name', models.CharField(default=None, max_length=255, null=True, blank=True)),
                ('host_port', models.CharField(default=None, max_length=255, null=True, blank=True)),
                ('username', models.CharField(default=None, max_length=255, null=True, blank=True)),
                ('password', models.CharField(default=None, max_length=255, null=True, blank=True)),
                ('database', models.CharField(default=None, max_length=255, null=True, blank=True)),
            ],
        ),
    ]
