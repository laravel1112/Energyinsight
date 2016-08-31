# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0006_auto_20151221_1501'),
    ]

    operations = [
        migrations.CreateModel(
            name='UnitLocation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('location', models.ForeignKey(related_name='location', default=None, to='backend.EnergyUnit')),
                ('unit', models.ForeignKey(related_name='unit', default=None, to='backend.EnergyUnit')),
            ],
        ),
    ]
