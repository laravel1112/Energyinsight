# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('alert', '0005_alertlog'),
    ]

    operations = [
        migrations.CreateModel(
            name='AlertStatus',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=45, null=True, blank=True)),
            ],
        ),
        migrations.RenameField(
            model_name='alert',
            old_name='type',
            new_name='alert_type',
        ),
        migrations.RenameField(
            model_name='alertlog',
            old_name='logInformation',
            new_name='title',
        ),
        migrations.RemoveField(
            model_name='alert',
            name='last_email_time',
        ),
        migrations.RemoveField(
            model_name='alert',
            name='last_sms_time',
        ),
        migrations.AddField(
            model_name='alert',
            name='alertconfig_json',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='alert',
            name='alertstate_json',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='alert',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='alert',
            name='notification_count',
            field=models.IntegerField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='alertlog',
            name='alert',
            field=models.ForeignKey(default=0, to='alert.Alert'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='alertlog',
            name='description',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='alertlog',
            name='energy_saved',
            field=models.CharField(default=None, max_length=254, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='alertlog',
            name='highchart_plot',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='alertlog',
            name='saving_potential',
            field=models.CharField(default=None, max_length=254, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='alertlog',
            name='alertstatus',
            field=models.ForeignKey(default=0, blank=True, to='alert.AlertStatus'),
            preserve_default=False,
        ),
    ]
