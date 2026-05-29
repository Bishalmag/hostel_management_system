from rest_framework import serializers
from .models import User, Role


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Role
        fields = ['id', 'name']


class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)

    class Meta:
        model  = User
        fields = ['id', 'email', 'full_name', 'phone', 'role', 'is_active']


class RegisterSerializer(serializers.ModelSerializer):
    password         = serializers.CharField(write_only=True)
    first_name       = serializers.CharField(write_only=True)
    last_name        = serializers.CharField(write_only=True)
    phone_number     = serializers.CharField(write_only=True, required=False)
    role             = serializers.CharField(write_only=True, default='Student')
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = [
            'email', 'first_name', 'last_name',
            'phone_number', 'password', 'password_confirm', 'role'
        ]

    def validate(self, data):
        if data['password'] != data.pop('password_confirm'):
            raise serializers.ValidationError({'password': 'Passwords do not match'})
        return data

    def create(self, validated_data):
        first_name   = validated_data.pop('first_name')
        last_name    = validated_data.pop('last_name')
        phone_number = validated_data.pop('phone_number', '')
        role_name    = validated_data.pop('role', 'Student')

        try:
            role_obj = Role.objects.get(name__iexact=role_name)
        except Role.DoesNotExist:
            role_obj = Role.objects.first()

        validated_data['full_name'] = f"{first_name} {last_name}"
        validated_data['phone']     = phone_number
        validated_data['role']      = role_obj

        return User.objects.create_user(**validated_data)