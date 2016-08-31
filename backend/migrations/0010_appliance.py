# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0009_buildingparam_gpslocation'),
    ]

    operations = [
        migrations.CreateModel(
            name='Appliance',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('outputSegment', models.CharField(default=None, max_length=45)),
                ('name', models.CharField(default=None, max_length=45)),
                ('app_unit', models.ForeignKey(related_name='app_unit', to='backend.EnergyUnit')),
            ],
        ),
    ]
