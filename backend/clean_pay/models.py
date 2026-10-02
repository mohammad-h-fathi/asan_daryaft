from django.db import models

class CleanOrder(models.Model):
    MODE_CHOICES = [
        ('DYNAMIC', 'پویا / تک تراکنشی (Dynamic Single Use)'),
        ('STATIC', 'ثابت / دائمی (Static Dedicated Proxy)'),
    ]

    STATUS_CHOICES = [
        ('CREATED', 'سفارش ایجاد شد'),
        ('WAITING_DEPOSIT', 'منتظر واریز به کیف پول X'),
        ('DEPOSIT_CONFIRMED', 'واریز به کیف پول X تایید شد'),
        ('SWAPPING_DEX', 'تبدیل در پنکیک‌اسواپ به کیف پول Z'),
        ('PRIVACY_DELAY', 'در صف تاخیر حریم خصوصی'),
        ('PAYOUT_TRANSFERRING', 'در حال انتقال از Z به کیف پول B'),
        ('COMPLETED', 'تکمیل گردید'),
    ]

    order_id = models.CharField(max_length=32, unique=True, db_index=True)
    mode = models.CharField(max_length=16, choices=MODE_CHOICES, default='DYNAMIC')
    
    # Wallets
    wallet_x_address = models.CharField(max_length=64, db_index=True)
    wallet_x_private_key = models.TextField(help_text="Encrypted in backend memory/DB")
    wallet_z_address = models.CharField(max_length=64)
    destination_wallet_b = models.CharField(max_length=64)
    
    # Amounts & Assets
    source_asset = models.CharField(max_length=16, default='BNB')
    target_asset = models.CharField(max_length=16, default='USDT')
    source_amount = models.DecimalField(max_digits=20, decimal_places=8)
    source_usd_value = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    estimated_output = models.DecimalField(max_digits=20, decimal_places=8, default=0)
    
    # Fee Structure
    fee_tier_name = models.CharField(max_length=64, default='سطح عادی (۱٪)')
    fee_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)
    platform_fee_usd = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    
    # Privacy Delay
    privacy_delay_seconds = models.IntegerField(default=900)
    
    # Status & Hashes
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='WAITING_DEPOSIT')
    tx_hash_deposit = models.CharField(max_length=128, blank=True, null=True)
    tx_hash_swap = models.CharField(max_length=128, blank=True, null=True)
    tx_hash_payout = models.CharField(max_length=128, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.order_id} [{self.mode}] - {self.status}"


class StaticProxyWallet(models.Model):
    user_identifier = models.CharField(max_length=64, db_index=True, help_text="User ID or Email")
    proxy_address = models.CharField(max_length=64, unique=True, db_index=True, help_text="Permanent Fixed Wallet X")
    proxy_private_key = models.TextField(help_text="Encrypted key")
    destination_wallet_b = models.CharField(max_length=64, help_text="Clean target wallet B")
    default_privacy_delay_seconds = models.IntegerField(default=1800)
    is_active = models.BooleanField(default=True)
    total_volume_processed = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"StaticProxy: {self.proxy_address} -> {self.destination_wallet_b}"


class PlatformRevenue(models.Model):
    total_volume_usd = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    total_commission_usd = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    total_orders_processed = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)
