# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0017_weatherstation_url'),
        ('alert', '0004_alert_last_notification_time'),
    ]

    operations = [
        migrations.CreateModel(
            name='AlertLog',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('logInformation', models.CharField(max_length=128, null=True, blank=True)),
                ('alerttype', models.ForeignKey(to='alert.AlertType')),
                ('energyunit', models.ForeignKey(to='backend.EnergyUnit')),
            ],
        ),
    ]
