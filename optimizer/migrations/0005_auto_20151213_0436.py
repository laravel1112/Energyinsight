# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import tinymce.models


class Migration(migrations.Migration):

    dependencies = [
        ('optimizer', '0004_auto_20151202_2137'),
    ]

    operations = [
        migrations.AlterField(
            model_name='recommendation',
            name='description',
            field=tinymce.models.HTMLField(default=None, max_length=5000, null=True, blank=True),
        ),
    ]
