from django.contrib import admin
from .models import *

class AlertStatusAdmin(admin.ModelAdmin):
    model = AlertStatus
    list_display = ['id', 'name']
    list_display_links = ['name']

admin.site.register(AlertStatus, AlertStatusAdmin)


class AlertTypeAdmin(admin.ModelAdmin):
    model = AlertType
    list_display = ['id', 'name', 'filename', 'classname']
    list_display_links = ['name']

admin.site.register(AlertType, AlertTypeAdmin)


class AlertAdmin(admin.ModelAdmin):
    model = Alert
    list_display = ['id', 'is_active', 'energyunit', 'alert_type', 'last_notification_time', 'notification_count', 'run_count']
    list_display_links = ['alert_type']

admin.site.register(Alert, AlertAdmin)


class AlertLogAdmin(admin.ModelAdmin):
    model = AlertStatus
    list_display = ['id', 'alerttype','energyunit', 'title', 'description', 'alert_time','alertstatus']
    list_display_links = ['title']

admin.site.register(AlertLog, AlertLogAdmin)