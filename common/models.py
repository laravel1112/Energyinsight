from django.db import models
from tinymce import models as tinymce_models
import uuid
import unidecode
from django.utils.text import slugify
from django.contrib.auth.models import User, Group


class Question_category(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True, default=None)
    priority = models.IntegerField(blank=True, null=True, default=0)
    is_active = models.BooleanField(default=True)

    def __unicode__(self):
        return "%s" % (self.name)

    class Meta:
        verbose_name = "QuestionCategory"
        verbose_name_plural = "QuestionCategories"


class FAQ_question(models.Model):
    question = models.CharField(max_length=255, blank=True, null=True, default=None)
    answer = models.TextField(blank=True, null=True, default=None)
    category = models.ForeignKey(Question_category, blank=True, null=True, default=None)
    priority = models.IntegerField(blank=True, null=True, default=0)
    is_active = models.BooleanField(default=True)

    def __unicode__(self):
        return "%s" % (self.question)

    class Meta:
        verbose_name = "FAQ_record"
        verbose_name_plural = "FAQ_records"


#Blog functionality
def image_upload_to(instance, filename):
    filename = "%s-%s" %(instance.slug, filename)
    return "posts/%s" % (filename)


def randomString():
    um = str(uuid.uuid4())
    return um


class BlogCategory(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True, default=None)
    is_active = models.BooleanField(default=True)

    def __unicode__(self):
        return "%s" % (self.name)


class BlogTag(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True, default=None)
    is_active = models.BooleanField(default=True)

    def __unicode__(self):
        return "%s" % (self.name)


class BlogPost(models.Model):
    title = models.CharField(max_length=254, blank=True, null=True, default=None)
    short_description = tinymce_models.HTMLField(blank=True, null=True, default=None)
    content = tinymce_models.HTMLField(blank=True, null=True, default=None)
    # small_image = models.ImageField(upload_to=image_upload_to, blank=True, null=True, default=None)
    # big_image = models.ImageField(upload_to=image_upload_to, blank=True, null=True, default=None)
    author = models.ForeignKey(User, blank=True, null=True, default=None, related_name="author")
    created_by = models.ForeignKey(User, blank=True, null=True, default=None)
    created = models.DateField(auto_now_add=True, auto_now=False, null=True)
    updated = models.DateField(auto_now_add=False, auto_now=True, null=True)
    category = models.ForeignKey(BlogCategory, blank=True, null=True, default=None)
    tag =  models.ManyToManyField(BlogTag, blank=True, null=True, default=None)
    is_active = models.BooleanField(default=True)
    is_sticky = models.BooleanField(default=False)
    slug = models.SlugField(max_length=200, default=randomString)


    def __unicode__(self):
        return '%s' %(self.title)

    def save(self, *args, **kwargs):
        self.slug = slugify(unidecode.unidecode(self.title))
        super(BlogPost, self).save(*args, **kwargs)


class Company(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True, default=None)
    logo = models.ImageField(upload_to="company_logs/", blank=True, null=True, default=None)

    def __unicode__(self):
        return "%s" % (self.name)


class ClientSettings(models.Model):
    user = models.ForeignKey(User, blank=True, null=True, default=None)
    company = models.ForeignKey(Company, blank=True, null=True, default=None)
    avatar = models.ImageField(upload_to="user_avatars/", blank=True, null=True, default=None)
    phone =models.CharField(max_length=45,blank=True, null=True, default=None);
    def __unicode__(self):
        return "%s" % (self.user)


class InfluxdbSettings(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True, default=None)
    is_active = models.BooleanField(default=False)
    host_name = models.CharField(max_length=255, blank=True, null=True, default=None)
    host_port = models.CharField(max_length=255, blank=True, null=True, default=None)
    username = models.CharField(max_length=255, blank=True, null=True, default=None)
    password = models.CharField(max_length=255, blank=True, null=True, default=None)
    database = models.CharField(max_length=255, blank=True, null=True, default=None)

    def __unicode__(self):
        return "%s" % (self.name)