# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('backend', '0010_appliance'),
    ]

    operations = [
        migrations.CreateModel(
            name='SmsLog',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('msg', models.CharField(default=None, max_length=256)),
                ('user', models.ForeignKey(related_name='user', default=None, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
