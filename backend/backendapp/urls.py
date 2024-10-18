from django.urls import path
from .views import UserRegistrationView, UserLoginView, EnquiryView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('enquiry/', EnquiryView.as_view(), name='enquiry'),
]