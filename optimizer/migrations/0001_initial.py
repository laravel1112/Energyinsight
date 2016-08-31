# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('djcelery', '__first__'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('backend', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='DailyOptimizerTask',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('is_active', models.BooleanField(default=True)),
                ('last_scheduled_on', models.DateTimeField(null=True, blank=True)),
                ('lighting_enabled', models.BooleanField(default=True)),
                ('lighting_series_light', models.CharField(default=None, max_length=1024, null=True, blank=True)),
                ('hvac_enabled', models.BooleanField(default=True)),
                ('hvac_series_compressor', models.CharField(default=None, max_length=1024, null=True, blank=True)),
                ('hvac_series_pump_chiller', models.CharField(default=None, max_length=1024, null=True, blank=True)),
                ('hvac_series_pump_cooling', models.CharField(default=None, max_length=1024, null=True, blank=True)),
                ('hvac_series_temp', models.CharField(default=None, max_length=1024, null=True, blank=True)),
                ('eu_target', models.ForeignKey(blank=True, to='backend.EnergyUnit', null=True)),
            ],
            options={
                'verbose_name_plural': 'Daily Optimizer Tasks',
            },
        ),
        migrations.CreateModel(
            name='Interval',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
            ],
        ),
        migrations.CreateModel(
            name='OptimizerTask',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('is_active', models.BooleanField(default=True)),
                ('config_json', models.TextField(null=True, blank=True)),
                ('context_json', models.TextField(null=True, blank=True)),
                ('created', models.DateTimeField(auto_now_add=True, null=True)),
                ('last_scheduled_on', models.DateTimeField(null=True, blank=True)),
                ('crontab', models.ForeignKey(blank=True, to='djcelery.CrontabSchedule', null=True)),
                ('eu_id', models.ForeignKey(blank=True, to='backend.EnergyUnit', null=True)),
                ('interval', models.ForeignKey(blank=True, to='optimizer.Interval', null=True)),
            ],
        ),
        migrations.CreateModel(
            name='OptimizerType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=45)),
            ],
        ),
        migrations.CreateModel(
            name='Priority',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=45)),
            ],
        ),
        migrations.CreateModel(
            name='Recommendation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.TextField(default=None, max_length=256, null=True, blank=True)),
                ('description', models.TextField(default=None, max_length=5000, null=True, blank=True)),
                ('saving_potential', models.CharField(default=None, max_length=254, null=True, blank=True)),
                ('energy_saved', models.CharField(default=None, max_length=254, null=True, blank=True)),
                ('sub_category', models.IntegerField(default=0, null=True, verbose_name=b'sub-category', blank=True)),
                ('date_of_creation', models.DateField(auto_now_add=True, null=True)),
                ('date_of_complete', models.DateField(default=None, null=True, blank=True)),
                ('date_of_completion', models.DateField(default=None, null=True, blank=True)),
            ],
            options={
                'verbose_name_plural': 'Recommendations',
            },
        ),
        migrations.CreateModel(
            name='RecommendationCategory',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=45)),
            ],
            options={
                'verbose_name_plural': 'Recommendation Categories',
            },
        ),
        migrations.CreateModel(
            name='RecommendationComplexity',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=45)),
            ],
            options={
                'verbose_name_plural': 'Recommendation Complexities',
            },
        ),
        migrations.CreateModel(
            name='RecommendationPayback',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=45)),
            ],
            options={
                'verbose_name_plural': 'Recommendation PaybackTime',
            },
        ),
        migrations.CreateModel(
            name='RecommendationStatus',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=45)),
            ],
            options={
                'verbose_name_plural': 'Recommendation Statuses',
            },
        ),
        migrations.CreateModel(
            name='RecommendationStatusLog',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('date_of_change', models.DateField(auto_now_add=True, null=True)),
                ('changed_by', models.ForeignKey(default=None, blank=True, to=settings.AUTH_USER_MODEL, null=True)),
                ('new_status', models.ForeignKey(related_name='new_status', default=None, blank=True, to='optimizer.RecommendationStatus', null=True)),
                ('old_status', models.ForeignKey(related_name='old_status', default=None, blank=True, to='optimizer.RecommendationStatus', null=True)),
                ('recommendation', models.ForeignKey(default=None, blank=True, to='optimizer.Recommendation', null=True)),
            ],
            options={
                'verbose_name_plural': 'Recommendation Status Log',
            },
        ),
        migrations.CreateModel(
            name='TimePeriod',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('time_period', models.CharField(max_length=45, null=True, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Value',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('time_value', models.IntegerField(null=True, blank=True)),
            ],
        ),
        migrations.AddField(
            model_name='recommendation',
            name='category',
            field=models.ForeignKey(default=None, blank=True, to='optimizer.RecommendationCategory', null=True),
        ),
        migrations.AddField(
            model_name='recommendation',
            name='complexity',
            field=models.ForeignKey(default=None, blank=True, to='optimizer.RecommendationComplexity', null=True),
        ),
        migrations.AddField(
            model_name='recommendation',
            name='energy_unit',
            field=models.ForeignKey(default=None, blank=True, to='backend.EnergyUnit', null=True),
        ),
        migrations.AddField(
            model_name='recommendation',
            name='paybacktime',
            field=models.ForeignKey(default=None, blank=True, to='optimizer.RecommendationPayback', null=True),
        ),
        migrations.AddField(
            model_name='recommendation',
            name='status',
            field=models.ForeignKey(default=None, blank=True, to='optimizer.RecommendationStatus', null=True),
        ),
        migrations.AddField(
            model_name='optimizertask',
            name='optimizertype',
            field=models.ForeignKey(to='optimizer.OptimizerType'),
        ),
        migrations.AddField(
            model_name='optimizertask',
            name='priority',
            field=models.ForeignKey(default=None, blank=True, to='optimizer.Priority', null=True),
        ),
        migrations.AddField(
            model_name='optimizertask',
            name='task',
            field=models.ForeignKey(blank=True, to='djcelery.PeriodicTask', null=True),
        ),
        migrations.AddField(
            model_name='interval',
            name='time_period',
            field=models.ForeignKey(blank=True, to='optimizer.TimePeriod', null=True),
        ),
        migrations.AddField(
            model_name='interval',
            name='time_value',
            field=models.ForeignKey(blank=True, to='optimizer.Value', null=True),
        ),
        migrations.AddField(
            model_name='dailyoptimizertask',
            name='priority',
            field=models.ForeignKey(default=None, blank=True, to='optimizer.Priority', null=True),
        ),
    ]
