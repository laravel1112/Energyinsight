from django.db import models


class SmsTemplate(models.Model):
	aliid=models.CharField(max_length=45, blank=True)
	short_text=models.CharField(max_length=45, blank=True, null=True)
	def __unicode__(self):
		return "%s" % (self.short_text)
class SmsSigniture(models.Model):
	aliid=models.CharField(max_length=45,blank=True)
	sign=models.CharField(max_length=45)
	def __unicode__(self):
		return  "%s" % (self.sign)