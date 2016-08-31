# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0014_auto_20160312_0744'),
    ]

    operations = [
        migrations.CreateModel(
            name='subSegment',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(default=None, max_length=45, blank=True)),
                ('parent', models.ForeignKey(related_name='parent', to='backend.Segmentation')),
            ],
        ),
        migrations.AddField(
            model_name='appliance',
            name='location',
            field=models.CharField(default=None, max_length=65, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='appliance',
            name='subSegment',
            field=models.ForeignKey(related_name='subSegment', default=None, to='backend.subSegment', null=True),
        ),
    ]
