# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0006_require_contenttypes_0002'),
    ]

    operations = [
        migrations.CreateModel(
            name='BuildingParam',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('yearbuild', models.CharField(max_length=64, null=True, blank=True)),
                ('address', models.CharField(max_length=512, null=True, blank=True)),
                ('buildingarea', models.CharField(max_length=64, null=True, blank=True)),
                ('employeenumber', models.CharField(max_length=64, null=True, blank=True)),
                ('refrigerationunits', models.CharField(max_length=64, null=True, blank=True)),
                ('cookingfacility', models.CharField(max_length=64, null=True, blank=True)),
                ('numberofrooms', models.CharField(max_length=64, null=True, blank=True)),
                ('description', models.TextField(null=True, blank=True)),
                ('energysystemintro', models.TextField(null=True, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='CampusParam',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('description', models.TextField(null=True, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=512, null=True, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='EnergyUnit',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(default=None, max_length=45)),
                ('value', models.CharField(max_length=45, null=True, blank=True)),
                ('influxKey', models.CharField(max_length=1024, null=True, blank=True)),
                ('eventseries', models.CharField(max_length=1024, null=True, blank=True)),
                ('GPSlocation', models.CharField(max_length=45, null=True, blank=True)),
                ('buildingparam', models.OneToOneField(null=True, blank=True, to='backend.BuildingParam')),
                ('campus', models.ForeignKey(related_name='camp', blank=True, to='backend.EnergyUnit', null=True)),
                ('campusparam', models.OneToOneField(null=True, blank=True, to='backend.CampusParam')),
                ('category', models.ForeignKey(blank=True, to='backend.Category', null=True)),
            ],
        ),
        migrations.CreateModel(
            name='GroupHasCampus',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('campus', models.ManyToManyField(default=None, related_name='energyUnit', to='backend.EnergyUnit')),
                ('userGroup', models.ForeignKey(related_name='energyUnit', to='auth.Group')),
            ],
            options={
                'verbose_name_plural': 'GroupHasCampuses',
            },
        ),
        migrations.CreateModel(
            name='MeterParam',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('manufacturer', models.CharField(max_length=512, null=True, blank=True)),
                ('modelname', models.CharField(max_length=512, null=True, blank=True)),
                ('samplerate', models.CharField(max_length=64, null=True, blank=True)),
                ('description', models.TextField(null=True, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='UnitType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=45)),
            ],
        ),
        migrations.AddField(
            model_name='energyunit',
            name='meterparam',
            field=models.OneToOneField(null=True, blank=True, to='backend.MeterParam'),
        ),
        migrations.AddField(
            model_name='energyunit',
            name='parent',
            field=models.ForeignKey(blank=True, to='backend.EnergyUnit', null=True),
        ),
        migrations.AddField(
            model_name='energyunit',
            name='type',
            field=models.ForeignKey(default=None, to='backend.UnitType'),
        ),
    ]
