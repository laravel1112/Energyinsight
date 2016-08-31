# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0004_auto_20151201_0445'),
    ]

    operations = [
        migrations.CreateModel(
            name='BlogCategory',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(default=None, max_length=255, null=True, blank=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='BlogTag',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(default=None, max_length=255, null=True, blank=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.AddField(
            model_name='blogpost',
            name='category',
            field=models.ForeignKey(default=None, blank=True, to='common.BlogCategory', null=True),
        ),
        migrations.AddField(
            model_name='blogpost',
            name='tag',
            field=models.ManyToManyField(default=None, to='common.BlogTag', null=True, blank=True),
        ),
    ]
