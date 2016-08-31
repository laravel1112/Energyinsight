from django.contrib import admin
from .models import *


admin.site.register(Interval)
admin.site.register(OptimizerType)
admin.site.register(OptimizerTask)

admin.site.register(Value)
admin.site.register(TimePeriod)

admin.site.register(RecommendationCategory)
admin.site.register(RecommendationComplexity)
admin.site.register(RecommendationPayback)
admin.site.register(RecommendationStatus)

class RecommendationAdmin(admin.ModelAdmin):
	list_display = ('id', 'title', 'status', 'energy_unit', 'date_of_creation')
	list_display_links = ['title']

admin.site.register(Recommendation, RecommendationAdmin)

admin.site.register(Priority)

class  RecommendationStatusLogAdmin(admin.ModelAdmin):
    list_display = ('recommendation', 'old_status', 'new_status', 'date_of_change','comment')
    # fields = ['recommendation', 'old_status', 'new_status', 'date_of_change','comment']

    readonly_fields = ('date_of_change',)

    class Meta:
        model =  RecommendationStatusLog
admin.site.register(RecommendationStatusLog, RecommendationStatusLogAdmin)


admin.site.register(DailyOptimizerTask)
admin.site.register(HourlyOptimizerTask)
admin.site.register(TaskType);
admin.site.register(MonitoringConfig)