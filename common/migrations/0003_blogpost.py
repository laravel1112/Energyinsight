# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings
import common.models
import tinymce.models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('common', '0002_auto_20151026_0024'),
    ]

    operations = [
        migrations.CreateModel(
            name='BlogPost',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(default=None, max_length=254, null=True, blank=True)),
                ('short_description', tinymce.models.HTMLField(default=None, null=True, blank=True)),
                ('content', tinymce.models.HTMLField(default=None, null=True, blank=True)),
                ('small_image', models.ImageField(default=None, null=True, upload_to=common.models.image_upload_to, blank=True)),
                ('big_image', models.ImageField(default=None, null=True, upload_to=common.models.image_upload_to, blank=True)),
                ('created', models.DateField(auto_now_add=True, null=True)),
                ('updated', models.DateField(auto_now=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('is_sticky', models.BooleanField(default=False)),
                ('slug', models.SlugField(default=common.models.randomString, max_length=200)),
                ('author', models.ForeignKey(related_name='author', default=None, blank=True, to=settings.AUTH_USER_MODEL, null=True)),
                ('created_by', models.ForeignKey(default=None, blank=True, to=settings.AUTH_USER_MODEL, null=True)),
            ],
        ),
    ]
