from rest_framework import serializers
from .models import CleanOrder, StaticProxyWallet, PlatformRevenue

class CleanOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = CleanOrder
        fields = '__all__'
        extra_kwargs = {
            'wallet_x_private_key': {'write_only': True} # Private key never exposed to API responses
        }


class StaticProxyWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaticProxyWallet
        fields = '__all__'
        extra_kwargs = {
            'proxy_private_key': {'write_only': True}
        }


class PlatformRevenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformRevenue
        fields = '__all__'
