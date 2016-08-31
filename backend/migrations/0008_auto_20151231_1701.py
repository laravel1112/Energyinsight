# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0007_unitlocation'),
    ]

    operations = [
        migrations.CreateModel(
            name='WeatherStation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(default=None, max_length=45)),
                ('GPSlocation', models.CharField(default=None, max_length=45)),
                ('unit', models.ForeignKey(related_name='unit', default=None, to='backend.EnergyUnit')),
            ],
        ),
        migrations.RemoveField(
            model_name='unitlocation',
            name='location',
        ),
        migrations.RemoveField(
            model_name='unitlocation',
            name='unit',
        ),
        migrations.DeleteModel(
            name='UnitLocation',
        ),
    ]
