from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .models import CustomUser 
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserUpdateSerializer
from django.db import IntegrityError
from rest_framework.permissions import IsAuthenticated

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                self.perform_create(serializer)
                return Response({
                    "status": "success",
                    "message": "User registered successfully",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)
            except IntegrityError as e:
                error_message = str(e)
                if "username" in error_message:
                    return Response({
                        "status": "error",
                        "message": "A user with that username already exists.",
                        "field": "username"
                    }, status=status.HTTP_400_BAD_REQUEST)
                elif "email" in error_message:
                    return Response({
                        "status": "error",
                        "message": "A user with that email address already exists.",
                        "field": "email"
                    }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({
                        "status": "error",
                        "message": "An error occurred while registering the user.",
                    }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                "status": "error",
                "message": "Invalid data provided",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

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

from .models import Enquiry
from django.utils import timezone

class EnquiryView(APIView):
    def post(self, request):
        serializer = EnquirySerializer(data=request.data)
        if serializer.is_valid():
            # Extract all data from the serializer
            name = serializer.validated_data['name']
            mobile_number = serializer.validated_data['mobile_number']
            address = serializer.validated_data['address']
            message = serializer.validated_data['message']
            packer_and_mover_name = serializer.validated_data['packer_and_mover_name']

            # Save data to the database with current time
            current_time = timezone.now()
            enquiry = Enquiry.objects.create(
                packer_and_mover_name=packer_and_mover_name,
                message=message,
                created_at=current_time
            )

            # Compose email with all details
            subject = 'New Enquiry'
            email_message = f"""
            Name: {name}
            Mobile Number: {mobile_number}
            Address: {address}
            Packer and Mover: {packer_and_mover_name}
            Message: {message}
            Created at: {current_time}
            """
            from_email = 'Amardeepyadav5156@gmail.com'
            recipient_list = ['chaudharyvikrant456@gmail.com']

            # Send email
            try:
                send_mail(subject, email_message, from_email, recipient_list)
                return Response({
                    'message': 'Enquiry sent successfully and saved to database',
                    'data': {
                        'packer_and_mover_name': enquiry.packer_and_mover_name,
                        'message': enquiry.message,
                        'created_at': enquiry.created_at
                    }
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                # If email sending fails, the enquiry is still saved in the database
                return Response({
                    'message': 'Enquiry saved to database but email sending failed',
                    'error': str(e),
                    'data': {
                        'packer_and_mover_name': enquiry.packer_and_mover_name,
                        'message': enquiry.message,
                        'created_at': enquiry.created_at
                    }
                }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EnquiryListView(generics.ListAPIView):
    queryset = Enquiry.objects.all().order_by('-created_at')
    serializer_class = EnquirySerializer

from .models import PackerAndMover
from .serializers import PackerAndMoverSerializer

class PackerAndMoverListCreateView(generics.ListCreateAPIView):
    queryset = PackerAndMover.objects.all()
    serializer_class = PackerAndMoverSerializer

    def get_queryset(self):
        queryset = PackerAndMover.objects.all()
        city = self.request.query_params.get('city', None)
        if city is not None:
            queryset = queryset.filter(city__iexact=city)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, many=isinstance(request.data, list))
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserUpdateSerializer
from django.contrib.auth import get_user_model


User = get_user_model()

class UserUpdateView(generics.UpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = []  # Remove IsAuthenticated

    def get_object(self):
        email = self.request.data.get('email')
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:
            return None

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response({
                "status": "error",
                "message": "User with this email does not exist."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        
        if not serializer.is_valid():
            errors = serializer.errors
            error_messages = []
            if 'username' in errors and 'email' in errors:
                error_messages.append("Both username and email are already in use.")
            elif 'username' in errors:
                error_messages.append("The provided username is already in use.")
            elif 'email' in errors:
                error_messages.append("The provided email is already in use.")
            
            for field, field_errors in errors.items():
                for error in field_errors:
                    if error not in error_messages:
                        error_messages.append(f"{field.capitalize()}: {error}")

            return Response({
                "status": "error",
                "message": "Unable to update user information.",
                "errors": error_messages
            }, status=status.HTTP_400_BAD_REQUEST)

        self.perform_update(serializer)
        return Response({
            "status": "success",
            "message": "User information updated successfully",
            "data": serializer.data
        })