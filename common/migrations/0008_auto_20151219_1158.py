# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0007_influxdbsettings'),
    ]

    operations = [
        migrations.RenameField(
            model_name='clientsettings',
            old_name='logo',
            new_name='avatar',
        ),
        migrations.AlterField(
            model_name='company',
            name='logo',
            field=models.ImageField(default=None, null=True, upload_to=b'company_logs/', blank=True),
        ),
    ]
