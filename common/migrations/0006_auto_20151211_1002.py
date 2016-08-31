# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('common', '0005_auto_20151201_0459'),
    ]

    operations = [
        migrations.CreateModel(
            name='ClientSettings',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('logo', models.ImageField(default=None, null=True, upload_to=b'user_avatars/', blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Company',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(default=None, max_length=255, null=True, blank=True)),
                ('logo', models.ImageField(default=None, null=True, upload_to=b'company_avatars/', blank=True)),
            ],
        ),
        migrations.AddField(
            model_name='clientsettings',
            name='company',
            field=models.ForeignKey(default=None, blank=True, to='common.Company', null=True),
        ),
        migrations.AddField(
            model_name='clientsettings',
            name='user',
            field=models.ForeignKey(default=None, blank=True, to=settings.AUTH_USER_MODEL, null=True),
        ),
    ]
