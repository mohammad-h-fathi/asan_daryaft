import { evmService } from './evmService.js';
import { pancakeSwapService, privacyDelayOptions } from './pancakeSwapService.js';

const API_BASE = 'http://localhost:8000/api';
const STORAGE_KEY = 'miloosh_clean_orders_v1';

export const ORDER_STATES = {
  CREATED: { id: 'CREATED', labelFa: 'سفارش ایجاد شد', stepNum: 1, badgeColor: 'cyan' },
  WAITING_DEPOSIT: { id: 'WAITING_DEPOSIT', labelFa: 'منتظر واریز به کیف پول X', stepNum: 2, badgeColor: 'amber' },
  DEPOSIT_CONFIRMED: { id: 'DEPOSIT_CONFIRMED', labelFa: 'واریز به کیف پول X تایید شد', stepNum: 3, badgeColor: 'emerald' },
  SWAPPING_DEX: { id: 'SWAPPING_DEX', labelFa: 'تبدیل در پنکیک‌اسواپ به کیف پول Z', stepNum: 4, badgeColor: 'purple' },
  PRIVACY_DELAY: { id: 'PRIVACY_DELAY', labelFa: 'در صف تاخیر حریم خصوصی', stepNum: 5, badgeColor: 'amber' },
  PAYOUT_TRANSFERRING: { id: 'PAYOUT_TRANSFERRING', labelFa: 'انتقال نهایی از Z به کیف پول مقصد B', stepNum: 6, badgeColor: 'cyan' },
  COMPLETED: { id: 'COMPLETED', labelFa: 'تکمیل گردید (انتقال پاک‌شده)', stepNum: 7, badgeColor: 'emerald' }
};

export const orderEngine = {
  getOrders: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveOrders: (orders) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (err) {
      console.error('Failed to save orders to storage', err);
    }
  },

  /**
   * Creates order via Python Django API
   */
  createOrder: async ({ sourceAssetId, targetAssetId, sourceAmount, destinationWalletB, privacyDelayId, mode = 'DYNAMIC' }) => {
    const privacyOption = privacyDelayOptions.find(p => p.id === privacyDelayId) || privacyDelayOptions[0];

    try {
      const response = await fetch(`${API_BASE}/orders/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_asset: sourceAssetId,
          target_asset: targetAssetId,
          source_amount: parseFloat(sourceAmount),
          destination_wallet_b: destinationWalletB,
          privacy_delay_seconds: privacyOption.delaySeconds,
          mode
        })
      });

      if (response.ok) {
        const djangoOrder = await response.json();
        
        // Format for UI state
        const formattedOrder = {
          orderId: djangoOrder.order_id,
          createdAt: djangoOrder.created_at,
          status: djangoOrder.status,
          mode: djangoOrder.mode,
          walletX: djangoOrder.wallet_x_address,
          walletZ: djangoOrder.wallet_z_address,
          destinationWalletB: djangoOrder.destination_wallet_b,
          sourceAssetId: djangoOrder.source_asset,
          targetAssetId: djangoOrder.target_asset,
          sourceAmount: parseFloat(djangoOrder.source_amount),
          sourceUsdValue: parseFloat(djangoOrder.source_usd_value),
          estimatedOutput: parseFloat(djangoOrder.estimated_output),
          platformFeeUsd: parseFloat(djangoOrder.platform_fee_usd),
          feeTier: {
            ratePercent: parseFloat(djangoOrder.fee_percentage),
            tierBadge: `${djangoOrder.fee_percentage}٪ کارمزد`,
            tierNameFa: djangoOrder.fee_tier_name
          },
          privacyDelay: privacyOption,
          txHashDeposit: djangoOrder.tx_hash_deposit,
          txHashSwap: djangoOrder.tx_hash_swap,
          txHashPayout: djangoOrder.tx_hash_payout
        };

        const currentOrders = orderEngine.getOrders();
        orderEngine.saveOrders([formattedOrder, ...currentOrders]);
        return formattedOrder;
      }
    } catch (err) {
      console.warn('Django API unavailable, using client-side fallback:', err);
    }

    // Fallback Client-side order creation if backend offline
    const walletX = evmService.generateEphemeralWalletX();
    const walletZ = evmService.generateEphemeralWalletX();
    const quote = pancakeSwapService.calculateQuote({ sourceAssetId, targetAssetId, sourceAmount });

    const fallbackOrder = {
      orderId: 'MLC-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      status: ORDER_STATES.WAITING_DEPOSIT.id,
      mode,
      walletX: walletX.address,
      walletZ: walletZ.address,
      destinationWalletB: destinationWalletB.trim(),
      sourceAssetId,
      targetAssetId,
      sourceAmount: quote.sourceAmount,
      sourceUsdValue: quote.sourceUsdValue,
      estimatedOutput: quote.estimatedOutputTargetAmount,
      platformFeeUsd: quote.platformFeeUsd,
      feeTier: quote.feeTier,
      privacyDelay: privacyOption,
      txHashDeposit: null,
      txHashSwap: null,
      txHashPayout: null
    };

    const currentOrders = orderEngine.getOrders();
    orderEngine.saveOrders([fallbackOrder, ...currentOrders]);
    return fallbackOrder;
  },

  /**
   * Triggers deposit simulation on Django Backend & local UI progress
   */
  simulateDepositReceived: (orderId, callbackProgress) => {
    fetch(`${API_BASE}/orders/${orderId}/simulate-deposit/`, { method: 'POST' })
      .catch(() => {});

    // Run UI visual progress steps
    let orders = orderEngine.getOrders();
    let orderIndex = orders.findIndex(o => o.orderId === orderId);
    if (orderIndex === -1) return;

    let order = orders[orderIndex];

    // Step 1: Deposit Confirmed
    order.status = ORDER_STATES.DEPOSIT_CONFIRMED.id;
    order.txHashDeposit = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    orders[orderIndex] = order;
    orderEngine.saveOrders(orders);
    if (callbackProgress) callbackProgress({ ...order });

    // Step 2: Swap DEX
    setTimeout(() => {
      orders = orderEngine.getOrders();
      orderIndex = orders.findIndex(o => o.orderId === orderId);
      if (orderIndex === -1) return;
      
      order = orders[orderIndex];
      order.status = ORDER_STATES.SWAPPING_DEX.id;
      order.txHashSwap = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      orders[orderIndex] = order;
      orderEngine.saveOrders(orders);
      if (callbackProgress) callbackProgress({ ...order });

      // Step 3: Privacy Delay or Immediate Payout
      setTimeout(() => {
        orders = orderEngine.getOrders();
        orderIndex = orders.findIndex(o => o.orderId === orderId);
        if (orderIndex === -1) return;

        order = orders[orderIndex];

        if (order.privacyDelay?.delaySeconds > 0) {
          order.status = ORDER_STATES.PRIVACY_DELAY.id;
          orders[orderIndex] = order;
          orderEngine.saveOrders(orders);
          if (callbackProgress) callbackProgress({ ...order });

          setTimeout(() => {
            orderEngine.executeFinalPayout(orderId, callbackProgress);
          }, 12000);
        } else {
          orderEngine.executeFinalPayout(orderId, callbackProgress);
        }
      }, 3000);

    }, 2500);
  },

  executeFinalPayout: (orderId, callbackProgress) => {
    let orders = orderEngine.getOrders();
    let orderIndex = orders.findIndex(o => o.orderId === orderId);
    if (orderIndex === -1) return;

    let order = orders[orderIndex];
    order.status = ORDER_STATES.PAYOUT_TRANSFERRING.id;
    orders[orderIndex] = order;
    orderEngine.saveOrders(orders);
    if (callbackProgress) callbackProgress({ ...order });

    setTimeout(() => {
      orders = orderEngine.getOrders();
      orderIndex = orders.findIndex(o => o.orderId === orderId);
      if (orderIndex === -1) return;

      order = orders[orderIndex];
      order.status = ORDER_STATES.COMPLETED.id;
      order.txHashPayout = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      orders[orderIndex] = order;
      orderEngine.saveOrders(orders);
      if (callbackProgress) callbackProgress({ ...order });
    }, 2500);
  }
};
