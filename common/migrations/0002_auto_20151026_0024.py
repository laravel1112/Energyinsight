# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='FAQ_question',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('question', models.CharField(default=None, max_length=255, null=True, blank=True)),
                ('answer', models.TextField(default=None, null=True, blank=True)),
                ('priority', models.IntegerField(default=0, null=True, blank=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'FAQ_record',
                'verbose_name_plural': 'FAQ_records',
            },
        ),
        migrations.CreateModel(
            name='Question_category',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(default=None, max_length=255, null=True, blank=True)),
                ('priority', models.IntegerField(default=0, null=True, blank=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'QuestionCategory',
                'verbose_name_plural': 'QuestionCategories',
            },
        ),
        migrations.AddField(
            model_name='faq_question',
            name='category',
            field=models.ForeignKey(default=None, blank=True, to='common.Question_category', null=True),
        ),
    ]
