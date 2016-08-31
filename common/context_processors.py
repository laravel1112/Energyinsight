from common.forms import *
from common.models import FAQ_question, Question_category

def user(request):
    try:
        user = request.user
        userForm = UserForm(request.POST or None, instance=user)
        if request.method == 'POST' and userForm.is_valid():
            userForm = UserForm(request.POST or None, instance=user)
            newForm = userForm.save(commit=False)
            newForm = userForm.save()
    except:
        pass
    return locals()


def faq(request):
    faq_questions = FAQ_question.objects.filter(is_active=True).order_by('-priority')
    faq_categories = Question_category.objects.filter(is_active=True).order_by('-priority')
    return locals()

