from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PackerAndMover

User  = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])  # Encrypt password
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class EnquirySerializer(serializers.Serializer):
    name = serializers.CharField()
    mobile_number = serializers.CharField()
    address = serializers.CharField()
    message = serializers.CharField()

class PackerAndMoverSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackerAndMover
        fields = '__all__'

User = get_user_model()

class UserUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['email', 'username', 'password']

    def validate(self, data):
        user = self.instance
        errors = {}

        if 'username' in data and data['username'] != user.username:
            if User.objects.exclude(pk=user.pk).filter(username=data['username']).exists():
                errors['username'] = "A user with that username already exists."

        if errors:
            raise serializers.ValidationError(errors)

        return data

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        
        instance.save()
        return instance

