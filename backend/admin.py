from django.contrib import admin
from django.core import urlresolvers

from .models import *
from .filters import SingleTextInputFilter


class UnitTypeAdmin(admin.ModelAdmin):
    model = UnitType
    list_display = ['id', 'name']
    list_display_links = ['name']


admin.site.register(UnitType, UnitTypeAdmin)


class NotNullNameFilter(admin.SimpleListFilter):
    title = 'name'
    parameter_name = 'name'

    def lookups(self, request, model_admin):
        return (
            ('0', 'null'),
            ('1', 'not null'),
        )

    def queryset(self, request, queryset):
        if self.value() == '0':
            return queryset.filter(name__isnull=True)

        if self.value() == '1':
            return queryset.filter(name__isnull=False)


class EnergyUnitNameFilter(SingleTextInputFilter):
    title = 'Name'
    parameter_name = 'q'

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(name__iexact=self.value())


class EnergyUnitIdFilter(SingleTextInputFilter):
    title = 'ID'
    parameter_name = 'id'

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(id=self.value())


class EnergyUnitAdmin(admin.ModelAdmin):
    model = EnergyUnit
    fields = [field.name for field in EnergyUnit._meta.fields if field.name != "id"]
    # readonly_fields = ['meterparam']
    list_display = ['id', 'type', '__str__', 'influxKey', 'campus', 'parameter_instance', ]
    list_filter = (NotNullNameFilter, 'type', 'campus', 'parent', EnergyUnitNameFilter, EnergyUnitIdFilter)
    list_display_links = ['__str__']
    search_fields = ['name', 'influxKey']

    # temporary here ids are shown, afterwards they can be replaced with some values.
    def parameter_instance(self, obj):
        try:
            if obj.type.name == "Building":
                link = urlresolvers.reverse("admin:backend_buildingparam_change", args=[obj.buildingparam.id])
                return u'<a href="%s">BuildingParam %s</a>' % (link, obj.buildingparam.id)
            elif obj.type.name == "Campus":
                link = urlresolvers.reverse("admin:backend_campusparam_change", args=[obj.campusparam.id])
                return u'<a href="%s">CampusParam %s</a>' % (link, obj.campusparam.id)
            elif obj.type.name == "Meter":
                link = urlresolvers.reverse("admin:backend_meterparam_change", args=[obj.meterparam.id])
                return u'<a href="%s">MeterParam %s</a>' % (link, obj.meterparam.id)
        except:
            pass

    parameter_instance.allow_tags = True


admin.site.register(EnergyUnit, EnergyUnitAdmin)


class ApplianceAdmin(admin.ModelAdmin):
    model = Appliance
    list_display = ['id', 'name', 'app_unit', 'outputSegment', 'subSegment']

admin.site.register(Appliance, ApplianceAdmin)


class GroupHasCampusAdmin(admin.ModelAdmin):
    model = GroupHasCampus
    filter_horizontal = ('campus',)


admin.site.register(GroupHasCampus, GroupHasCampusAdmin)

admin.site.register(WeatherStation)

admin.site.register(Category)

admin.site.register(CampusParam)
admin.site.register(BuildingParam)
admin.site.register(MeterParam)
admin.site.register(SmsLog)
admin.site.register(Segmentation)
