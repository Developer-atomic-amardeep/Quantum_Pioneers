from django.urls import path
from .views import UserRegistrationView, UserLoginView, EnquiryView, PackerAndMoverListCreateView
from .views import UserUpdateView, EnquiryListView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('enquiry/', EnquiryView.as_view(), name='enquiry'),
    path('packers-movers/', PackerAndMoverListCreateView.as_view(), name='packers-movers'),
    path('enquiry/', EnquiryView.as_view(), name='enquiry'),
    path('enquiries/', EnquiryListView.as_view(), name='enquiry-list'),
]
