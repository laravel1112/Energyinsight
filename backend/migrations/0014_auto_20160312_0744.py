# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0013_auto_20160131_0558'),
    ]

    operations = [
        migrations.CreateModel(
            name='Segmentation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=45, null=True, blank=True)),
            ],
        ),
        migrations.AddField(
            model_name='buildingparam',
            name='billingCycleStart',
            field=models.CharField(default=b'1', max_length=2),
        ),
        migrations.AlterField(
            model_name='appliance',
            name='outputSegment',
            field=models.ForeignKey(related_name='outputSegment', to='backend.Segmentation'),
        ),
    ]
