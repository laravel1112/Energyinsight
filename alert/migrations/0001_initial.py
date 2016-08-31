# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0014_auto_20160312_0744'),
    ]

    operations = [
        migrations.CreateModel(
            name='Alert',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('last_sms_time', models.DateTimeField(blank=True)),
                ('last_email_time', models.DateTimeField(blank=True)),
                ('energyunit', models.ForeignKey(to='backend.EnergyUnit')),
            ],
        ),
        migrations.CreateModel(
            name='AlertType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=45)),
                ('waitingtime', models.IntegerField()),
                ('AlertScript', models.CharField(max_length=128)),
            ],
        ),
        migrations.AddField(
            model_name='alert',
            name='type',
            field=models.ForeignKey(to='alert.AlertType'),
        ),
    ]
