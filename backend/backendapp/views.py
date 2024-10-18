from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .models import CustomUser 
from .serializers import UserRegistrationSerializer, UserLoginSerializer

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer

class UserLoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        user = authenticate(email=email, password=password)
        if user:
            return Response({'message': 'Login successful'}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from .serializers import EnquirySerializer

class EnquiryView(APIView):
    def post(self, request):
        serializer = EnquirySerializer(data=request.data)
        if serializer.is_valid():
            name = serializer.validated_data['name']
            mobile_number = serializer.validated_data['mobile_number']
            address = serializer.validated_data['address']
            message = serializer.validated_data['message']

            # Compose email
            subject = 'New Enquiry'
            email_message = f"""
            Name: {name}
            Mobile Number: {mobile_number}
            Address: {address}
            Message: {message}
            """
            from_email = 'Amardeepyadav5156@gmail.com'
            recipient_list = ['chaudharyvikrant456@gmail.com']

            # Send email
            try:
                send_mail(subject, email_message, from_email, recipient_list)
                return Response({'message': 'Enquiry sent successfully'}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)