from django.contrib import admin
from .models import *


admin.site.register(Question_category)
admin.site.register(FAQ_question)

admin.site.register(BlogCategory)
admin.site.register(BlogTag)

class BlogPostAdmin(admin.ModelAdmin):
	model = BlogPost
	list_display = ['id', 'title', 'author', 'category', 'created']
	list_display_links = ['title']
admin.site.register(BlogPost, BlogPostAdmin)

admin.site.register(Company)
admin.site.register(ClientSettings)


class InfluxdbSettingsAdmin(admin.ModelAdmin):
    list_display = [field.name for field in InfluxdbSettings._meta.fields if field.name != "id"]
    model = InfluxdbSettings

admin.site.register(InfluxdbSettings, InfluxdbSettingsAdmin)
