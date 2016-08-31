from django.contrib.auth.models import User
from django import forms

from crispy_forms.helper import *
from crispy_forms.layout import *
from crispy_forms.bootstrap import *


class UserForm(forms.ModelForm):
    password1 = forms.CharField(widget=forms.PasswordInput, required=False, label="Enter your new password here")
    password2 = forms.CharField(widget=forms.PasswordInput, required=False, label="Enter your new password (again) here")

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email',)


    def __init__(self, *args, **kwargs):
        super(UserForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.form_id = 'user_form'
        self.helper.form_class = 'form-horizontal'
        self.helper.form_method = 'POST'
        self.helper.form_action = ''

        self.helper.form_class  = 'form-horizontal col-lg-12 col-lg-offset-0'
        self.helper.label_class = 'col-lg-5'
        self.helper.field_class = 'col-lg-6'


        self.helper.layout = Layout(

            self.helper.layout,

            ButtonHolder(
                HTML('<div class="form-group right">'
                    '<button type="button" class="btn btn-green-light" data-dismiss="modal">Close</button>'
                    '<button type="submit" class="btn btn-green">Save</a>'
                    '</div>'),
            )

        )


    def clean(self):
        """
        Verifies that the values entered into the password fields match

        NOTE: Errors here will appear in ``non_field_errors()`` because it applies to more than one field.
        """
        cleaned_data = super(UserForm, self).clean()
        if self.cleaned_data['password1'] and self.cleaned_data['password2']:
            if self.cleaned_data['password1'] != self.cleaned_data['password2']:
                raise forms.ValidationError("Passwords don't match. Please enter both fields again.")
        return self.cleaned_data


    def save(self, commit=True):
        if self.cleaned_data['password1']:
            try:
                user = self.user
                # user = User.objects.get(username = self.cleaned_data['username'] )
                if self.cleaned_data['password1']:
                    print(user)
                    print(self.cleaned_data['password1'])
                    user.set_password(self.cleaned_data['password1'])
                    user.save(update_fields=['password',])
            except:
                user = super(UserForm, self).save(commit=False)
                user.set_password(self.cleaned_data['password1'])
                if commit:
                    user.save()


