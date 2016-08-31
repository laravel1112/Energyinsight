# -*- coding: utf-8 -*-
from django.core.exceptions import ObjectDoesNotExist
from tastypie.resources import ModelResource
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from tastypie.authorization import DjangoAuthorization
from tastypie import fields
from tastypie.authentication import BasicAuthentication, ApiKeyAuthentication, Authentication, SessionAuthentication
from tastypie.authorization import Authorization
from tastypie.exceptions import Unauthorized, NotFound
from tastypie.cache import SimpleCache, NoCache

from optimizer.models import *
from common.models import BlogPost, FAQ_question, Question_category, BlogCategory, BlogTag, Company, ClientSettings
from djcelery.models import CrontabSchedule
from alert.models import *

from django.conf import settings

import logging

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from tastypie.http import HttpUnauthorized, HttpForbidden
from django.conf.urls import url
from tastypie.utils import trailing_slash

from django.contrib.auth.hashers import make_password, is_password_usable
from jwt_auth.mixins import JSONWebTokenAuthMixin
from jwt_auth.exceptions import AuthenticationFailed

# set up logging to file - see previous section for more details
logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s',
                    datefmt='%m-%d %H:%M',
                    filename='logfile.log',
                    filemode='w')
# define a Handler which writes INFO messages or higher to the sys.stderr
console = logging.StreamHandler()
console.setLevel(logging.INFO)
# set a format which is simpler for console use
# formatter = logging.Formatter('%(name)-12s: %(levelname)-8s %(message)s')
formatter = logging.Formatter('%(levelname)-8s %(message)s')
# tell the handler to use this format
console.setFormatter(formatter)
# add the handler to the root logger
logging.getLogger('').addHandler(console)

"""
# Now, we can log to the root logger, or any other logger. First the root...
logging.info('Jackdaws love my big sphinx of quartz.')

# Now, define a couple of other loggers which might represent areas in your
# application:

logger1 = logging.getLogger('myapp.area1')
logger2 = logging.getLogger('myapp.area2')

logger1.debug('Quick zephyrs blow, vexing daft Jim.')
logger1.info('How quickly daft jumping zebras vex.')
logger2.warning('Jail zesty vixen who grabbed pay from quack.')
logger2.error('The five boxing wizards jump quickly.')
"""


class BearAuthentication(Authentication):
    def __init__(self, *args, **kwargs):
        self.auth_type = 'bearer'
        super(BearAuthentication, self).__init__(*args, **kwargs)

    def get_authorization_data(self, request):

        authorization = request.META.get('HTTP_AUTHORIZATION', '')

        if not authorization:
            raise ValueError('Authorization header missing or empty.')

        try:
            auth_type, data = authorization.split(' ', 1)
        except:
            raise ValueError('Authorization header must have a space separating auth_type and data.')

        if auth_type.lower() != self.auth_type:
            raise ValueError('auth_type is not "%s".' % self.auth_type)

        return data

    def is_authenticated(self, request, **kwargs):
        try:
            data = self.get_authorization_data(request)
        except ValueError as e:
            logging.error(e)
            return False
        try:
            auth_result = JSONWebTokenAuthMixin().authenticate(request)
        except AuthenticationFailed as e:
            logging.error(e)
            return False
        if auth_result is not None:
            return True
        return False

    def get_identifier(self, request):
        try:
            auth_result = JSONWebTokenAuthMixin().authenticate(request)
        except AuthenticationFailed as e:
            logging.error(e)
            return "None"
        return auth_result[0]


class DjangoCookieBasicAuthentication(BasicAuthentication):
    """
     If the user is already authenticated by a django session it will
     allow the request (useful for ajax calls) . If it is not, defaults
     to basic authentication, which other clients could use.
    """

    def __init__(self, *args, **kwargs):
        super(DjangoCookieBasicAuthentication, self).__init__(*args, **kwargs)

    def is_authenticated(self, request, **kwargs):
        # print ("is auth")

        # from django.contrib.sessions.models import Session
        # if 'sessionid' in request.COOKIES:
        #     try:
        #         s = Session.objects.get(pk=request.COOKIES['sessionid'])
        #         if '_auth_user_id' in s.get_decoded():
        #             u = User.objects.get(id=s.get_decoded()['_auth_user_id'])
        #             request.user = u
        #             print "user logged in using session"
        #             return True
        #     except:
        #         print "session not exist",request.COOKIES['sessionid']
        # if 'HTTP_token' in request.META:
        #     s = Session.objects.get(pk=request.META['HTTP_token'])
        #     if '_auth_user_id' in s.get_decoded():
        #         u = User.objects.get(id=s.get_decoded()['_auth_user_id'])
        #         request.user = u
        #         return True

        # result=super(DjangoCookieBasicAuthentication, self).is_authenticated(request, **kwargs)
        result = request.user.is_authenticated()
        return result

    def get_identifier(self, request):
        return request.user


def addingEnergyUnitsObjectsToAccess(object_list, bundle):
    allGroupsPermissions = GroupHasCampusResource()
    allGroupsPermissionsList = allGroupsPermissions.obj_get_list(bundle)

    # filter all groups for this user and apply it to groups in GroupHasCampus
    userGroupsPermissionsList = allGroupsPermissionsList.filter(userGroup__in=bundle.request.user.groups.all())

    objects_with_access = []
    for item in userGroupsPermissionsList:
        campuses = item.campus.all()
        units = object_list.filter(campus__in=campuses)

        for unit in units:
            objects_with_access.append(unit)

    return objects_with_access


def addingRecommendationsObjectsToAccess(object_list, bundle):
    allRecommendationsList = object_list

    # this line pushes TastyPie to check with api of all available energy units for this user
    allEnergyUnits = EnergyUnitResource()
    allowedEnergyUnitsList = allEnergyUnits.obj_get_list(bundle)

    # filter all groups for this user and apply it to groups in GroupHasCampus
    allowedRecommendationList = allRecommendationsList.filter(energy_unit__in=allowedEnergyUnitsList)
    objects_with_access = []
    for item in allowedRecommendationList:
        objects_with_access.append(item)
    return objects_with_access


def adding_alert_logs_objects_to_access(object_list, bundle):

    all_energy_units = EnergyUnitResource()
    alert_logs_results_list = all_energy_units.obj_get_list(bundle)

    allowed_alert_logs_list = object_list.filter(energyunit__in=alert_logs_results_list)
    objects_with_access = []
    for item in allowed_alert_logs_list:
        objects_with_access.append(item)
    return objects_with_access


def addingUserObjectsToAccess(object_list, bundle):
    objects_with_access = object_list.filter(id=bundle.request.user.id)
    return objects_with_access


def addingCompanyObjectsToAccess(object_list, bundle):
    all_clients = ClientSettingsResource()
    all_clients_list = all_clients.obj_get_list(bundle)
    all_clients_allowed = all_clients_list.filter(user=bundle.request.user.id)

    objects_with_access = []
    for item in all_clients_allowed:
        objects_with_access.append(item.company)
    return objects_with_access


def addingClientSettingsObjectsToAccess(object_list, bundle):
    objects_with_access = object_list.filter(user=bundle.request.user)
    return objects_with_access


def checking_PUT(object_list, bundle, resourceName):
    # this line pushes TastyPie to check with api of all available energy units for this user
    allEnergyUnits = EnergyUnitResource()
    allowedEnergyUnitsList = allEnergyUnits.obj_get_list(bundle)

    variable = "%s__id" % resourceName
    kwargs = {}
    kwargs[variable] = bundle.data.get('pk')

    # filter all eu to check if they have a foreign key to the variable, if not returns empty list of available objects
    try:
        allowedEnergyUnitsList.filter(**kwargs)
        return True
    except:
        try:
            """
            Trying to check if there is an object in energy units queryset with the needed id for the needed field.
            This is done because for some reason allowedEnergyUnitsList appears as a list of objects, but not as a
            queryset.
            """
            for eu in allowedEnergyUnitsList:
                if str(getattr(eu, resourceName)) == bundle.data.get('pk'):
                    return True
            return False

        except:
            return False


def checkingPermissions(self, object_list, bundle, request_type):
    resourceName = self.resource_meta.resource_name.replace("_", "")
    if resourceName == "user":
        allowed_objects = addingUserObjectsToAccess(object_list, bundle)
        if request_type == "list" and allowed_objects:
            return allowed_objects
        elif request_type == "detail" and allowed_objects:  # Edited to allow updating user resource via PUT or POST
            return True
        else:
            return False

    elif resourceName == "company":
        allowed_objects = addingCompanyObjectsToAccess(object_list, bundle)

        if request_type == "list" and allowed_objects:
            return allowed_objects
        # e lif request_type == "detail" and object_list.count() == 1 and allowed_objects:
        # TODO: The previous condition is still wrong. My guess is count() was supposed
        # to check whether allowed_objects contains the requested company id
        # ie. allowed_objects.count(bundle.request.company.id) == 1
        # count() takes 1 argument, so I'm not sure why we were calling count()
        # with no argument.
        elif request_type == "detail" and allowed_objects:
            return True
        else:
            return False

    elif resourceName == "clientsettings":
        allowed_objects = addingClientSettingsObjectsToAccess(object_list, bundle)
        if request_type == "list" and allowed_objects:
            return allowed_objects
        elif request_type == "detail" and allowed_objects:
            return True
        elif bundle.request.method == "PUT" and allowed_objects:
            return True
        else:
            return []

    elif resourceName == "energyunit" or resourceName == "energyunit2":
        allowed_objects = addingEnergyUnitsObjectsToAccess(object_list, bundle)
        if request_type == "list" and allowed_objects:
            return allowed_objects
        elif request_type == "detail" and object_list.count() == 1 and allowed_objects:
            return True
        elif request_type == "detail" and bundle.request.method == "DELETE" and allowed_objects:
            return True
        elif bundle.request.method == "PUT" and allowed_objects:
            return True
        else:
            return []

    elif resourceName == "recommendation":
        allowed_objects = addingRecommendationsObjectsToAccess(object_list, bundle)
        if request_type == "list" and allowed_objects:
            return allowed_objects
        elif request_type == "detail" and object_list.count() == 1 and allowed_objects:
            return True
        elif bundle.request.method == "PUT" and allowed_objects:
            return True
        else:
            return []

    elif resourceName == "alertlog":
        allowed_objects = adding_alert_logs_objects_to_access(object_list, bundle)
        if request_type == "list" and allowed_objects:
            return allowed_objects
        elif request_type == "detail" and object_list.count() == 1 and allowed_objects:
            return True
        elif bundle.request.method == "PUT" and allowed_objects:
            return True
        else:
            return []

    # GENERAL AUTHORIZATION PART
    if bundle.request.method == 'GET':
        if request_type == "list":
            return object_list  # currently we have only authorization logic to read from energy unit
        elif request_type == "detail" and object_list.count() == 1:
            return True
        else:
            return False

    elif bundle.request.method == 'POST':
        checkPermissionItem = 'backend.' + 'add_' + resourceName
        if bundle.request.user.has_perm(checkPermissionItem):
            return True
        else:
            return False

    elif bundle.request.method == 'PUT':
        allowed_objects = checking_PUT(object_list, bundle, resourceName)

        if allowed_objects:
            return True
        else:
            """If there are any resources wich should not be available to be PUT updated globally and they don't have
            a foreign key from energy unit to them
            """
            excluded_resources_from_PUT_update = []
            apps_list = ['backend.', 'optimizer.']
            for app in apps_list:
                if resourceName not in excluded_resources_from_PUT_update:
                    try:
                        checkPermissionItem = app + 'change_' + resourceName
                        if bundle.request.user.has_perm(checkPermissionItem):
                            return True
                        else:
                            return False
                    except:
                        pass

    elif bundle.request.method == 'DELETE':
        checkPermissionItem = 'backend.' + 'delete_' + resourceName
        if bundle.request.user.has_perm(checkPermissionItem):
            return True
        else:
            return False


class CustomAuthorization(Authorization):
    def create_list(self, object_list, bundle):  # according to the documentation bulk creation does not work now
        return True

    def create_detail(self, object_list, bundle):
        return True

    def read_list(self, object_list, bundle):
        """
        Returns a list of all the objects a user is allowed to read.
        Should return an empty list if none are allowed.
        Returns the entire list by default.
        """
        result = checkingPermissions(self, object_list, bundle, "list")
        return result

    def read_detail(self, object_list, bundle):
        checkingPermissions(self, object_list, bundle, "detail")
        return True

    def update_list(self, object_list, bundle):
        return checkingPermissions(self, object_list, bundle, "list")

    def update_detail(self, object_list, bundle):
        return checkingPermissions(self, object_list, bundle, "detail")

    def delete_list(self, object_list, bundle):
        return checkingPermissions(self, object_list, bundle, "list")

    def delete_detail(self, object_list, bundle):
        return checkingPermissions(self, object_list, bundle, "detail")

    def put_detail(self, object_list, bundle):
        return True


class GroupHasCampusResource(ModelResource):
    class Meta:
        queryset = GroupHasCampus.objects.all()
        resource_name = 'groups'
        allowed_methods = ['']
        authentication = DjangoCookieBasicAuthentication()
        authorization = DjangoAuthorization()

        filtering = {
            'userGroup': ALL,
            'campus': ALL_WITH_RELATIONS
        }


class UnitTypeResource(ModelResource):
    class Meta:
        queryset = UnitType.objects.all()
        resource_name = 'unittype'
        allowed_methods = ['get', 'post', 'put', 'delete']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'name': ALL
        }

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/(?P<name>[\w\d_.-]+)/$" % self._meta.resource_name,
                self.wrap_view('dispatch_detail'), name="api_dispatch_detail"),
        ]


class CampusParamResource(ModelResource):
    class Meta:
        queryset = CampusParam.objects.all()
        resource_name = 'campusparam'
        allowed_methods = ['get', 'post', 'put']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()
        cache = NoCache()

        filtering = {
            'id': ALL,
        }


class BuildingParamResource(ModelResource):
    class Meta:
        queryset = BuildingParam.objects.all()
        resource_name = 'buildingparam'
        allowed_methods = ['get', 'post', 'put']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()
        # authorization = Authorization()
        cache = NoCache()

        filtering = {
            'id': ALL,
        }


class MeterParamResource(ModelResource):
    class Meta:
        queryset = MeterParam.objects.all()
        resource_name = 'meterparam'
        allowed_methods = ['get', 'post', 'put']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()
        cache = NoCache()

        filtering = {
            'id': ALL,
        }


class SegmentationResource(ModelResource):
    class Meta:
        queryset = Segmentation.objects.all()
        resource_name = 'segmentation'
        allowed_methods = ['get', 'put', 'post']
        authentication = DjangoCookieBasicAuthentication()

        filtering = {
            'id': ALL,
            'name': ALL
        }


class CategoryResource(ModelResource):
    class Meta:
        queryset = Category.objects.all()
        resource_name = 'category'
        allowed_methods = ['get']
        authentication = DjangoCookieBasicAuthentication()
        # authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'name': ALL
        }


class MonitoringConfigResource(ModelResource):
    class Meta:
        queryset = MonitoringConfig.objects.all()
        resource_name = 'monitoring_config'
        allowed_methods = ['get', 'put']
        authentication = DjangoCookieBasicAuthentication()
        authorization = Authorization()


class EnergyUnitResource(ModelResource):
    type = fields.ForeignKey(UnitTypeResource, 'type', full=True)
    parent = fields.ForeignKey('self', 'parent', null=True, blank=True)
    campus = fields.ForeignKey('self', 'campus', null=True, blank=True)
    campusparam = fields.ForeignKey(CampusParamResource, 'campusparam', blank=True, null=True, full=True)
    buildingparam = fields.ForeignKey(BuildingParamResource, 'buildingparam', blank=True, null=True, full=True)
    meterparam = fields.ForeignKey(MeterParamResource, 'meterparam', blank=True, null=True, full=True)
    category = fields.ForeignKey(CategoryResource, 'category', blank=True, null=True)
    monitor_config = fields.ForeignKey(MonitoringConfigResource, 'monitor_config', blank=True, null=True)

    class Meta:
        queryset = EnergyUnit.objects.all()
        resource_name = 'energyunit'
        allowed_methods = ['get', 'post', 'put', 'delete']
        authentication = DjangoCookieBasicAuthentication()
        # authentication = SessionAuthentication()
        authorization = CustomAuthorization()
        # authorization=Authorization()
        cache = NoCache()
        always_return_data = True

        filtering = {
            'id': ALL,
            'parent': ALL_WITH_RELATIONS,
            'name': ALL,
            'value': ALL,
            'influxKey': ALL,
            'type': ALL_WITH_RELATIONS,
            'GPSlocation': ALL,
            'campus': ALL_WITH_RELATIONS,
            'category': ALL_WITH_RELATIONS
        }

    def dehydrate(self, bundle):
        try:
            bundle.data['parent'] = bundle.obj.parent.id
        except:
            pass
        # They may not be necessary, because type and campus cannot be null;
        try:
            # bundle.data['campus'] = bundle.obj.campus.id
            bundle.data['campus'] = bundle.obj.campus.name
        except:
            pass
        try:
            if bundle.request.GET.get('populate') == "true":
                bundle.data['type'] = bundle.obj.type.name
            else:
                bundle.data['type'] = bundle.obj.type.id
        except:
            pass
        try:
            bundle.data['monitor_config'] = bundle.obj.monitor_config.id
        except:
            pass
        # try:
        #     bundle.data['campusparam'] = bundle.obj.campusparam.id
        # except:
        #     pass

        # try:
        #     bundle.data['buildingparam'] = bundle.obj.buildingparam.id
        # except:
        #     pass

        # try:
        #     bundle.data['meterparam'] = bundle.obj.meterparam.id
        # except:
        #     pass

        try:
            if bundle.request.GET.get('populate') == "true":
                bundle.data['category'] = bundle.obj.category.name
            else:
                bundle.data['category'] = bundle.obj.category.id
        except:
            pass

        return bundle


class OptimizerTypeResource(ModelResource):
    class Meta:
        queryset = OptimizerType.objects.all()
        resource_name = 'optimizer_type'
        allowed_methods = ['get', 'post', 'put', 'delete']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'name': ALL
        }


# TODO: add a class for alert


class ValueResource(ModelResource):
    class Meta:
        queryset = Value.objects.all()
        resource_name = 'time_value'
        allowed_methods = ['get', 'post', 'put', 'delete']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'time_value': ALL
        }


class TimePeriodResource(ModelResource):
    class Meta:
        queryset = TimePeriod.objects.all()
        resource_name = 'time_period'
        allowed_methods = ['get', 'post', 'put', 'delete']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'time_period': ALL
        }


class IntervalResource(ModelResource):
    class Meta:
        queryset = Interval.objects.all()
        resource_name = 'interval'
        allowed_methods = ['get', 'post', 'put', 'delete']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'time_value': ALL,
            'time_period': ALL
        }


class OptimizerTaskResource(ModelResource):
    optimizer_type = fields.ForeignKey(OptimizerTypeResource, 'optimizertype', blank=True, null=True)
    energy_unit = fields.ForeignKey(EnergyUnitResource, 'eu_id', blank=True, null=True)
    interval = fields.ForeignKey(IntervalResource, 'interval', blank=True, null=True)

    # task = fields.ForeignKey(PeriodicTaskResource, 'task_scheduler', blank=True, null=True)

    class Meta:
        queryset = OptimizerTask.objects.all()
        resource_name = 'optimizer_task'
        allowed_methods = ['get', 'post', 'put', 'delete']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'is_Active': ALL,
            'optimizertype': ALL,
            'eu_id': ALL,
            'config_json': ALL,
            'context_json': ALL,
            'interval': ALL,
            'created': ALL,
            'last_scheduled_on': ALL,
            'task': ALL
        }


class CrontabScheduleResource(ModelResource):
    class Meta:
        queryset = CrontabSchedule.objects.all()
        resource_name = 'crontab'
        allowed_methods = ['get', 'post', 'put', 'delete']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'minute': ALL,
            'hour': ALL,
            'day_of_week': ALL,
            'day_of_month': ALL,
            'month_of_year': ALL,
        }


class RecommendationCategoryResource(ModelResource):
    class Meta:
        queryset = RecommendationCategory.objects.all()
        resource_name = 'recommendation_category'
        allowed_methods = ['get', 'post', 'put', 'delete']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'name': ALL
        }


class RecommendationComplexityResource(ModelResource):
    class Meta:
        queryset = RecommendationComplexity.objects.all()
        resource_name = 'recommendation_complexity'
        allowed_methods = ['get', 'post', 'put', 'delete']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'name': ALL
        }


class RecommendationStatusResource(ModelResource):
    class Meta:
        queryset = RecommendationStatus.objects.all()
        resource_name = 'recommendation_status'
        allowed_methods = ['get', 'post', 'put', 'delete']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'name': ALL
        }


class RecommendationPaybackTimeResource(ModelResource):
    class Meta:
        queryset = RecommendationStatus.objects.all()
        resource_name = 'recommendation_paybacktime'
        allowed_methods = ['get', 'post', 'put', 'delete']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'name': ALL
        }


class RecommendationResource(ModelResource):
    category = fields.ForeignKey(RecommendationCategoryResource, 'category', blank=True, null=True)
    complexity = fields.ForeignKey(RecommendationComplexityResource, 'complexity', blank=True, null=True)
    paybacktime = fields.ForeignKey(RecommendationPaybackTimeResource, 'paybacktime', blank=True, null=True)
    status = fields.ForeignKey(RecommendationStatusResource, 'status', blank=True, null=True)
    energy_unit = fields.ForeignKey(EnergyUnitResource, 'energy_unit', blank=True, null=True)

    class Meta:
        queryset = Recommendation.objects.all()
        resource_name = 'recommendation'
        allowed_methods = ['get', 'post', 'put', 'delete']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()
        cache = NoCache()

        filtering = {
            'id': ALL,
            'saving_potential': ALL,
            'recommendation_category': ALL_WITH_RELATIONS,
            'sub_category': ALL,
            'complexity': ALL_WITH_RELATIONS,
            'paybacktime': ALL_WITH_RELATIONS,
            'status': ALL_WITH_RELATIONS,
            'energy_unit': ALL_WITH_RELATIONS,
            'date_of_creation': ALL,
            'date_of_complete': ALL,
            'date_of_completion': ALL,
        }

    def obj_update(self, bundle, skip_errors=False, **kwargs):
        """
        A ORM-specific implementation of ``obj_update``.
        """

        bundle_detail_data = self.get_bundle_detail_data(bundle) if bundle.obj else None
        arg_detail_data = kwargs.get(self._meta.detail_uri_name, None)

        if not bundle_detail_data or (arg_detail_data and bundle_detail_data != arg_detail_data):
            try:
                lookup_kwargs = self.lookup_kwargs_with_identifiers(bundle, kwargs)
            except:
                # if there is trouble hydrating the data, fall back to just
                # using kwargs by itself (usually it only contains a "pk" key
                # and this will work fine.
                lookup_kwargs = kwargs
            try:
                bundle.obj = self.obj_get(bundle=bundle, **lookup_kwargs)
            except ObjectDoesNotExist:
                raise NotFound("A model instance matching the provided arguments could not be found.")
        bundle = self.full_hydrate(bundle)
        return self.save(bundle, skip_errors=skip_errors)

    def dehydrate(self, bundle):
        try:
            bundle.data['status'] = bundle.obj.status.id
        except:
            pass
        try:
            bundle.data['energy_unit'] = bundle.obj.energy_unit.name
        except:
            pass
        try:
            bundle.data['category'] = bundle.obj.category.id
        except:
            pass
        try:
            bundle.data['complexity'] = bundle.obj.complexity.id
        except:
            pass
        try:
            bundle.data['paybacktime'] = bundle.obj.paybacktime.id
        except:
            pass
        return bundle


class RecommendationStatusLogResource(ModelResource):
    recommendation = fields.ForeignKey(RecommendationResource, 'recommendation', blank=True, null=True)
    old_status = fields.ForeignKey(RecommendationStatusResource, 'old_status', blank=True, null=True)
    new_status = fields.ForeignKey(RecommendationStatusResource, 'new_status', blank=True, null=True)

    class Meta:
        queryset = RecommendationStatusLog.objects.all()
        resource_name = 'recommendation_status_log'
        allowed_methods = ['get']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'recommendation': ALL_WITH_RELATIONS,
            'old_status': ALL_WITH_RELATIONS,
            'new_status': ALL_WITH_RELATIONS,
            'changed_by': ALL,
            'date_of_change': ALL
        }

    def dehydrate(self, bundle):
        try:
            bundle.data['old_status'] = bundle.obj.old_status.name
        except:
            pass
        try:
            bundle.data['new_status'] = bundle.obj.new_status.name
        except:
            pass
        return bundle


class BlogCategoryResource(ModelResource):
    class Meta:
        queryset = BlogCategory.objects.filter(is_active=True)
        resource_name = 'blog_category'
        allowed_methods = ['get']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'name': ALL,
        }


class BlogTagResource(ModelResource):
    class Meta:
        queryset = BlogTag.objects.filter(is_active=True)
        resource_name = 'blog_tag'
        allowed_methods = ['get']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'name': ALL,
        }


class BlogPostResource(ModelResource):
    category = fields.ForeignKey(BlogCategoryResource, 'category', blank=True, null=True)
    tag = fields.ToManyField(BlogTagResource, 'tag', blank=True, null=True)

    class Meta:
        queryset = BlogPost.objects.filter(is_active=True)
        resource_name = 'blog_post'
        allowed_methods = ['get']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()
        cache = NoCache()

        filtering = {
            'id': ALL,
            'title': ALL,
            'author': ALL,
            'created': ALL,
            'category': ALL_WITH_RELATIONS,
            'tag': ALL_WITH_RELATIONS
        }

    def dehydrate(self, bundle):
        try:
            bundle.data['category'] = bundle.obj.category.name
        except:
            pass
        return bundle


class Question_categoryResource(ModelResource):
    class Meta:
        queryset = Question_category.objects.filter(is_active=True)
        resource_name = 'question_category'
        allowed_methods = ['get']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'name': ALL,
            'priority': ALL
        }


class FAQ_questionResource(ModelResource):
    category = fields.ForeignKey(Question_categoryResource, 'category', blank=True, null=True)

    class Meta:
        queryset = FAQ_question.objects.filter(is_active=True)
        resource_name = 'faq_question'
        allowed_methods = ['get']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'question': ALL,
            'category': ALL_WITH_RELATIONS,
            'priority': ALL
        }


class UserResource(ModelResource):
    class Meta:
        queryset = User.objects.filter(is_active=True)
        resource_name = 'user'
        allowed_methods = ['get', 'post', 'put', 'delete']
        fields = ['id', 'pk', 'username', 'first_name', 'last_name', 'password',
                  'email']  # fix not to allow to set up a superuser status
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL
        }

    def hydrate(self, bundle):
        if bundle.data.has_key('password'):
            password = bundle.data['password']
            """
            It checks if the password has been already hashed (is_password_usable==True)
            It can be hashed before, because hydrate functions is being called twice:
                first time - to get an item,
                second time - to update it.
            """
            if is_password_usable(password):
                pass
            else:
                bundle.data['password'] = make_password(password)
        return bundle


class SmsLogResource(ModelResource):
    class Meta:
        queryset = SmsLog.objects.all()
        resource_name = 'smslog'
        allowed_methods = ['get']


class MultipartResource(object):
    def deserialize(self, request, data, format=None):
        if not format:
            format = request.META.get('CONTENT_TYPE', 'application/json')

        if format == 'application/x-www-form-urlencoded':
            return request.POST

        if format.startswith('multipart'):
            data = request.POST.copy()
            data.update(request.FILES)
            return data

        return super(MultipartResource, self).deserialize(request, data, format)

    def put_detail(self, request, **kwargs):
        if request.META.get('CONTENT_TYPE').startswith('multipart') and \
                not hasattr(request, '_body'):
            request._body = ''

        return super(MultipartResource, self).put_detail(request, **kwargs)


import os


class CompanyResource(MultipartResource, ModelResource):
    logo = fields.FileField(attribute='logo')

    class Meta:
        queryset = Company.objects.all()
        resource_name = 'company'
        allowed_methods = ['get', 'post', 'put', 'delete']
        authentication = DjangoCookieBasicAuthentication()
        # authentication = Authentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL
        }

    # saving images
    def deserialize(self, request, data, format=None):
        if not format:
            format = request.META.get('CONTENT_TYPE', 'application/json')

        if format.startswith('multipart'):
            try:
                data = request.POST.copy()
                img = request.FILES['logo']
                data.update(request.FILES)
            except Exception, e:
                logging.exception(e)

            return data
        return super(CompanyResource, self).deserialize(request, data, format)

        # def put_detail(self, request, **kwargs):
        #     if request.META.get('CONTENT_TYPE').startswith('multipart') and \
        #             not hasattr(request, '_body'):
        #         request._body = ''

        # # overriding the save method to prevent the object getting saved twice
        # def obj_create(self, bundle, request=None, **kwargs):
        #     pass


class ClientSettingsResource(MultipartResource, ModelResource):
    user = fields.ForeignKey(UserResource, 'user', blank=True, null=True)
    company = fields.ForeignKey(CompanyResource, 'company', blank=True, null=True)
    avatar = fields.FileField(attribute='avatar')

    class Meta:
        queryset = ClientSettings.objects.all()
        resource_name = 'client_settings'

        allowed_methods = ['get', 'post', 'put', 'delete']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'user': ALL
        }

    # saving images
    def deserialize(self, request, data, format=None):
        if not format:
            format = request.META.get('CONTENT_TYPE', 'application/json')

        if format.startswith('multipart'):
            try:
                data = request.POST.copy()
                img = request.FILES['avatar']
                data.update(request.FILES)
            except Exception, e:
                logging.exception(e)

            return data
        return super(ClientSettingsResource, self).deserialize(request, data, format)

    def dehydrate(self, bundle):
        try:
            bundle.data['company'] = bundle.obj.company.id
            bundle.data['company_logo'] = settings.MEDIA_URL + str(bundle.obj.company.logo)
        except:
            pass
        try:
            bundle.data['user'] = bundle.obj.user.id
        except:
            pass
        return bundle


class PriorityResource(ModelResource):
    class Meta:
        queryset = Priority.objects.all()
        resource_name = 'task_priority'
        allowed_methods = ['get', 'post', 'put', 'delete']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL
        }


class DailyOptimizerTaskResource(ModelResource):
    priority = fields.ForeignKey(PriorityResource, 'priority', blank=True, null=True)
    eu_target = fields.ForeignKey(EnergyUnitResource, 'eu_target', blank=True, null=True)

    class Meta:
        queryset = DailyOptimizerTask.objects.all()
        resource_name = 'daily_optimizer_task'
        allowed_methods = ['get', 'post', 'put', 'delete']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'priority': ALL_WITH_RELATIONS,
            'eu_target': ALL_WITH_RELATIONS
        }


class TaskTypeResource(ModelResource):
    class Meta:
        queryset = TaskType.objects.all()
        resource_name = 'task_type'
        allowed_methods = ['get']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()


class HourlyOptimizerTaskResource(ModelResource):
    priority = fields.ForeignKey(PriorityResource, 'priority', blank=True, null=True)
    eu_target = fields.ForeignKey(EnergyUnitResource, 'eu_target', blank=True, null=True)
    task_type = fields.ForeignKey(TaskTypeResource, 'task_type', blank=True, null=True, default=None)

    class Meta:
        queryset = HourlyOptimizerTask.objects.all()
        resource_name = 'hourly_optimizer_task'
        allowed_methods = ['get', 'post', 'put', 'delete']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'priority': ALL_WITH_RELATIONS,
            'eu_target': ALL_WITH_RELATIONS
        }


class UserAccountResource(ModelResource):
    class Meta:
        queryset = User.objects.all()
        allowed_methods = ['get', 'post']
        resource_name = 'user_account'

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/login%s$" %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('login'), name="api_login"),
            url(r'^(?P<resource_name>%s)/logout%s$' %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('logout'), name='api_logout'),
        ]

    def login(self, request, **kwargs):
        self.method_check(request, allowed=['post'])

        data = self.deserialize(request, request.body, format=request.META.get('CONTENT_TYPE', 'application/json'))

        username = data.get('username', '')
        password = data.get('password', '')

        user = authenticate(username=username, password=password)
        if user:
            if user.is_active:
                login(request, user)
                return self.create_response(request, {
                    'success': True
                })
            else:
                return self.create_response(request, {
                    'success': False,
                    'reason': 'disabled',
                }, HttpForbidden)
        else:
            return self.create_response(request, {
                'success': False,
                'reason': 'incorrect',
            }, HttpUnauthorized)

    def logout(self, request, **kwargs):
        self.method_check(request, allowed=['post'])
        if request.user and request.user.is_authenticated():
            logout(request)
            return self.create_response(request, {'success': True})
        else:
            return self.create_response(request, {'success': False}, HttpUnauthorized)



class AlertStatusResource(ModelResource):
    class Meta:
        queryset = AlertStatus.objects.all()
        resource_name = 'alertstatus'
        allowed_methods = ['get']
        authentication = DjangoCookieBasicAuthentication()
        authorization = DjangoAuthorization()

        filtering = {
            'id': ALL,
        }

class AlertTypeResource(ModelResource):
    class Meta:
        queryset = AlertType.objects.all()
        resource_name = 'alerttype'
        allowed_methods = ['get']
        authentication = DjangoCookieBasicAuthentication()
        authorization = DjangoAuthorization()

        filtering = {
            'id': ALL,
        }


class AlertResource(ModelResource):
    class Meta:
        queryset = Alert.objects.all()
        resource_name = 'alert'
        allowed_methods = ['get']
        authentication = DjangoCookieBasicAuthentication()
        authorization = DjangoAuthorization()

        filtering = {
            'id': ALL,
        }


class AlertLogResource(ModelResource):
    alerttype = fields.ForeignKey(AlertTypeResource, 'alerttype', blank = True, null=True)
    alert = fields.ForeignKey(AlertResource, 'alert', blank = True, null=True)
    energyunit = fields.ForeignKey(EnergyUnitResource, 'energyunit', blank=True, null=True)
    alertstatus = fields.ForeignKey(AlertStatusResource, 'alertstatus', blank=True, null=True)


    class Meta:
        queryset = AlertLog.objects.all()
        resource_name = 'alert_log'
        allowed_methods = ['get', 'post', 'put']
        authentication = DjangoCookieBasicAuthentication()
        authorization = CustomAuthorization()

        filtering = {
            'id': ALL,
            'energyunit': ALL_WITH_RELATIONS
        }


    def dehydrate(self, bundle):
        try:
            bundle.data['alerttype'] = bundle.obj.alerttype.id
            bundle.data['alert']     = bundle.obj.alert.id
            bundle.data['energyunit'] = bundle.obj.energyunit.id
            bundle.data['alertstatus'] = bundle.obj.alertstatus.id
        except:
            pass
        return bundle