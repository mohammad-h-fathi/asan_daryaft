from django.urls import path
from .views import (
    AltchaChallengeView, RegisterView, LoginView, UserProfileView,
    CreateOrderView, GetOrderView, SimulateDepositView,
    StaticWalletView, PlatformStatsView
)

urlpatterns = [
    # Auth & Captcha
    path('auth/altcha-challenge/', AltchaChallengeView.as_view(), name='altcha-challenge'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/me/', UserProfileView.as_view(), name='user-profile'),

    # Orders & Clean Pay
    path('orders/create/', CreateOrderView.as_view(), name='create-order'),
    path('orders/<str:order_id>/', GetOrderView.as_view(), name='get-order'),
    path('orders/<str:order_id>/simulate-deposit/', SimulateDepositView.as_view(), name='simulate-deposit'),
    
    # Static Proxy Wallets & Stats
    path('static-wallets/', StaticWalletView.as_view(), name='static-wallets'),
    path('admin/stats/', PlatformStatsView.as_view(), name='platform-stats'),
]
