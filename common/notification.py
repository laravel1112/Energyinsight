#!/usr/bin/env python
# -*- coding: utf-8 -*-
from django.core.mail import send_mail
from energyinsight.settings import NOTIFICATION_EMAILS
from common.models import ClientSettings
import top.api
import json

def sending_email(subject, message):
    print ('entered to sending emails')
    target_emails = NOTIFICATION_EMAILS
    send_mail(subject, message, 'noreply@equotaenergy.com', target_emails)

def notify_user(subject,message,user):
	target_emails=[];
	if user is None:
		print "User is None";
		return;
	if user.email=="":
		print "User does not have email";
		return;
	target_emails+=[user.email];
	print "sending email",subject,message,target_emails
	#send_mail(subject,message,'noreply@equotaenergy.com',target_emails);

def notify_user_sms(signiture,param,users,template):
	phone=[];	
	if users is not None :
		print "User is ",users;
		for u in users:
			cs=ClientSettings.objects.filter(user=u);
			print "u is ",u;
			if cs:
				cs=cs[0];
				if cs.phone:
					phone+=[cs.phone];
	template_code=None;
	if template is not None:
		template_code=template.aliid;
	signiture_code=None;
	if signiture is not None:
		signiture_code=signiture.sign;
	param=json.dumps(param);
	sendSMS(param,phone,template_code,signiture_code);

def sendSMS(param,phone,template_code,signiture):
	print "send message",param,phone,template_code,signiture;
	if signiture is None:
		signiture="大鱼测试"
	if phone is None:
		print "No phone number";
		return;
	if template_code is None:
		print "No template";
		return;
	#return;
	req=top.api.AlibabaAliqinFcSmsNumSendRequest("gw.api.taobao.com",80)
	req.set_app_info(top.appinfo("23305899","1b8059e291ce87222567845a85378b1d"))
	req.extend="123456"
	req.sms_type="normal"
	req.sms_free_sign_name=signiture
	req.sms_param=param;
	req.rec_num=','.join(map(str,phone));
	req.sms_template_code=template_code
	try:
		print req.rec_num;
		if len(req.rec_num)==11:
			print "get response"
			#esp= req.getResponse()
			#print resp
	except Exception, e:
		print (e);