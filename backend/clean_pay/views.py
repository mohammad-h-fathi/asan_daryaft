import random
import threading
import time
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404

from .models import CleanOrder, StaticProxyWallet, PlatformRevenue
from .serializers import CleanOrderSerializer, StaticProxyWalletSerializer, PlatformRevenueSerializer
from .services.evm_engine import EVMEngine
from .services.email_validator import EmailValidator
from .services.altcha_service import AltchaService

ASSET_PRICES = {
    'BNB': 590.50,
    'USDT': 1.00,
    'USDC': 1.00,
    'CAKE': 2.85,
    'ETH': 3450.00,
    'BUSD': 1.00
}


class AltchaChallengeView(APIView):
    """
    Returns a Proof-of-Work challenge for ALTCHA captcha
    """
    def get(self, request):
        challenge = AltchaService.generate_challenge()
        return Response(challenge)


class RegisterView(APIView):
    """
    User Registration Endpoint:
    - Rate Limited (3/min)
    - Validates ALTCHA PoW Payload
    - Validates Email (Blocks temp/disposable mails)
    """
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'register'

    def post(self, request):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')
        altcha_payload = request.data.get('altcha_payload', '')

        # 1. ALTCHA PoW Verification
        altcha_ok, altcha_err = AltchaService.verify_solution(altcha_payload)
        if not altcha_ok:
            return Response({'error': altcha_err}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Email Validation & TempMail Blocking
        email_ok, email_err = EmailValidator.validate_email(email)
        if not email_ok:
            return Response({'error': email_err}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'حساب کاربری دیگری با این ایمیل قبلاً ثبت نام کرده است.'}, status=status.HTTP_400_BAD_REQUEST)

        if not password or len(password) < 8:
            return Response({'error': 'رمز عبور باید حداقل ۸ کاراکتر باشد.'}, status=status.HTTP_400_BAD_REQUEST)

        # 3. User Creation
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password
        )

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'message': 'ثبت نام با موفقیت انجام شد.',
            'token': token.key,
            'user': {
                'id': user.id,
                'email': user.email
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    User Login Endpoint:
    - Rate Limited (5/min)
    - Validates ALTCHA PoW Payload
    """
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')
        altcha_payload = request.data.get('altcha_payload', '')

        # 1. ALTCHA Verification
        altcha_ok, altcha_err = AltchaService.verify_solution(altcha_payload)
        if not altcha_ok:
            return Response({'error': altcha_err}, status=status.HTTP_400_BAD_REQUEST)

        if not email or not password:
            return Response({'error': 'لطفاً ایمیل و رمز عبور را وارد کنید.'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Authenticate
        user = authenticate(username=email, password=password)
        if not user:
            return Response({'error': 'ایمیل یا رمز عبور وارد شده نادرست است.'}, status=status.HTTP_401_UNAUTHORIZED)

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'message': 'ورود موفقیت‌آمیز بود.',
            'token': token.key,
            'user': {
                'id': user.id,
                'email': user.email
            }
        })


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'id': request.user.id,
            'email': request.user.email,
            'date_joined': request.user.date_joined
        })


class CreateOrderView(APIView):
    def post(self, request):
        data = request.data
        source_asset = data.get('source_asset', 'BNB')
        target_asset = data.get('target_asset', 'USDT')
        source_amount = float(data.get('source_amount', 1.0))
        destination_wallet_b = data.get('destination_wallet_b', '')
        privacy_delay_seconds = int(data.get('privacy_delay_seconds', 900))
        mode = data.get('mode', 'DYNAMIC')

        if not EVMEngine.is_valid_evm_address(destination_wallet_b):
            return Response({'error': 'آدرس کیف پول مقصد B معتبر نیست.'}, status=status.HTTP_400_BAD_REQUEST)

        wallet_x = EVMEngine.generate_real_evm_keypair()
        wallet_z = EVMEngine.generate_real_evm_keypair()

        price_src = ASSET_PRICES.get(source_asset, 1.0)
        price_tgt = ASSET_PRICES.get(target_asset, 1.0)
        source_usd_value = source_amount * price_src

        fee_info = EVMEngine.calculate_dynamic_fee(source_usd_value)
        platform_fee_usd = fee_info['fee_usd']
        
        gas_usd = 0.80
        net_usd = max(0.0, source_usd_value - platform_fee_usd - gas_usd)
        estimated_output = net_usd / price_tgt

        order_id = f"MLC-{random.randint(100000, 999999)}"

        order = CleanOrder.objects.create(
            order_id=order_id,
            mode=mode,
            wallet_x_address=wallet_x['address'],
            wallet_x_private_key=wallet_x['private_key'],
            wallet_z_address=wallet_z['address'],
            destination_wallet_b=destination_wallet_b,
            source_asset=source_asset,
            target_asset=target_asset,
            source_amount=source_amount,
            source_usd_value=source_usd_value,
            estimated_output=estimated_output,
            fee_tier_name=fee_info['tier_name'],
            fee_percentage=fee_info['rate_percent'],
            platform_fee_usd=platform_fee_usd,
            privacy_delay_seconds=privacy_delay_seconds,
            status='WAITING_DEPOSIT'
        )

        serializer = CleanOrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class GetOrderView(APIView):
    def get(self, request, order_id):
        order = get_object_or_404(CleanOrder, order_id=order_id)
        serializer = CleanOrderSerializer(order)
        return Response(serializer.data)


class SimulateDepositView(APIView):
    def post(self, request, order_id):
        order = get_object_or_404(CleanOrder, order_id=order_id)
        
        def run_pipeline():
            order.status = 'DEPOSIT_CONFIRMED'
            order.tx_hash_deposit = EVMEngine.generate_mock_tx_hash()
            order.save()
            time.sleep(2.5)

            order.status = 'SWAPPING_DEX'
            order.tx_hash_swap = EVMEngine.generate_mock_tx_hash()
            order.save()
            time.sleep(3.0)

            if order.privacy_delay_seconds > 0:
                order.status = 'PRIVACY_DELAY'
                order.save()
                time.sleep(10.0)

            order.status = 'PAYOUT_TRANSFERRING'
            order.save()
            time.sleep(2.5)

            order.status = 'COMPLETED'
            order.tx_hash_payout = EVMEngine.generate_mock_tx_hash()
            order.save()

            revenue, _ = PlatformRevenue.objects.get_or_create(id=1)
            revenue.total_volume_usd = float(revenue.total_volume_usd) + float(order.source_usd_value)
            revenue.total_commission_usd = float(revenue.total_commission_usd) + float(order.platform_fee_usd)
            revenue.total_orders_processed += 1
            revenue.save()

        t = threading.Thread(target=run_pipeline)
        t.start()

        return Response({'message': 'فرآیند واریز و تبادل بلاکچین آغاز شد.', 'order_id': order.order_id})


class StaticWalletView(APIView):
    def get(self, request):
        wallets = StaticProxyWallet.objects.filter(is_active=True)
        serializer = StaticProxyWalletSerializer(wallets, many=True)
        return Response(serializer.data)

    def post(self, request):
        user_identifier = request.data.get('user_identifier', 'User-' + str(random.randint(100, 999)))
        destination_wallet_b = request.data.get('destination_wallet_b', '')
        privacy_delay_seconds = int(request.data.get('privacy_delay_seconds', 1800))

        if not EVMEngine.is_valid_evm_address(destination_wallet_b):
            return Response({'error': 'آدرس کیف پول مقصد B معتبر نیست.'}, status=status.HTTP_400_BAD_REQUEST)

        proxy_keypair = EVMEngine.generate_real_evm_keypair()

        static_wallet = StaticProxyWallet.objects.create(
            user_identifier=user_identifier,
            proxy_address=proxy_keypair['address'],
            proxy_private_key=proxy_keypair['private_key'],
            destination_wallet_b=destination_wallet_b,
            default_privacy_delay_seconds=privacy_delay_seconds
        )

        serializer = StaticProxyWalletSerializer(static_wallet)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PlatformStatsView(APIView):
    def get(self, request):
        revenue, _ = PlatformRevenue.objects.get_or_create(id=1)
        active_count = CleanOrder.objects.exclude(status='COMPLETED').count()
        completed_count = CleanOrder.objects.filter(status='COMPLETED').count()

        return Response({
            'total_volume_usd': float(revenue.total_volume_usd),
            'total_commission_usd': float(revenue.total_commission_usd),
            'total_orders_processed': revenue.total_orders_processed,
            'active_orders_count': active_count,
            'completed_orders_count': completed_count
        })
