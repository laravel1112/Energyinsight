# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('optimizer', '0011_dailyoptimizertask_disable_datafactory'),
    ]

    operations = [
        migrations.CreateModel(
            name='TaskType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=256, blank=True)),
                ('filename', models.CharField(max_length=256, null=True, blank=True)),
                ('classname', models.CharField(max_length=256, null=True, blank=True)),
            ],
        ),
        migrations.AddField(
            model_name='hourlyoptimizertask',
            name='tasy_type',
            field=models.ForeignKey(default=None, blank=True, to='optimizer.TaskType', null=True),
        ),
    ]
