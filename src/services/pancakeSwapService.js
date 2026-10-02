/**
 * Service for handling PancakeSwap DEX Routing, Asset Prices, and Dynamic Commission Calculation
 */

export const supportedAssets = [
  { id: 'BNB', name: 'بایننس کوین', symbol: 'BNB', priceUsd: 590.50, isNative: true, icon: '⚡' },
  { id: 'USDT', name: 'تتر (Tether USD)', symbol: 'USDT', priceUsd: 1.00, isNative: false, icon: '💵' },
  { id: 'USDC', name: 'یو اس دی کوین', symbol: 'USDC', priceUsd: 1.00, isNative: false, icon: '🔹' },
  { id: 'CAKE', name: 'توکن پنکیک اسواپ', symbol: 'CAKE', priceUsd: 2.85, isNative: false, icon: '🥞' },
  { id: 'ETH', name: 'اتریوم', symbol: 'ETH', priceUsd: 3450.00, isNative: true, icon: '💎' },
  { id: 'BUSD', name: 'بایننس یو اس دی', symbol: 'BUSD', priceUsd: 1.00, isNative: false, icon: '🟡' }
];

export const privacyDelayOptions = [
  { id: 'instant', label: 'فوری (بدون تاخیر)', delaySeconds: 0, textFa: 'انتقال بلافاصله پس از تبدیل در پنکیک‌اسواپ' },
  { id: '15m', label: '۱۵ دقیقه تاخیر', delaySeconds: 900, textFa: 'ارسال با ۱۵ دقیقه تاخیر تصادفی جهت افزایش حریم خصوصی' },
  { id: '30m', label: '۳۰ دقیقه تاخیر', delaySeconds: 1800, textFa: 'ارسال با ۳۰ دقیقه تاخیر تصادفی جهت شکستن زمانبندی' },
  { id: '1h', label: '۱ ساعت تاخیر', delaySeconds: 3600, textFa: 'ارسال با ۱ ساعت تاخیر برای بیشترین حریم خصوصی' },
  { id: '6h', label: '۶ ساعت تاخیر', delaySeconds: 21600, textFa: 'حداکثر تاخیر حریم خصوصی با توده‌سازی تراکنش' }
];

export const pancakeSwapService = {
  /**
   * Calculates Dynamic Commission Fee Percentage based on USD value of transfer
   * - Tier 1 (< $500): 1.0%
   * - Tier 2 ($500 - $5000): 0.75%
   * - Tier 3 (> $5000): 0.50%
   */
  calculateDynamicFeeTier: (amountInUsd) => {
    if (amountInUsd < 500) {
      return {
        ratePercent: 1.0,
        tierNameFa: 'سطح عادی (زیر ۵۰۰ دلار)',
        tierBadge: '۱.۰٪ کارمزد'
      };
    } else if (amountInUsd <= 5000) {
      return {
        ratePercent: 0.75,
        tierNameFa: 'سطح نقره‌ای (۵۰۰ تا ۵,۰۰۰ دلار)',
        tierBadge: '۰.۷۵٪ کارمزد'
      };
    } else {
      return {
        ratePercent: 0.50,
        tierNameFa: 'سطح طلایی (بیش از ۵,۰۰۰ دلار)',
        tierBadge: '۰.۵۰٪ کارمزد'
      };
    }
  },

  /**
   * Calculates full swap estimate, DEX route, dynamic fee, network gas, and estimated output
   */
  calculateQuote: ({ sourceAssetId, targetAssetId, sourceAmount }) => {
    const srcAsset = supportedAssets.find(a => a.id === sourceAssetId) || supportedAssets[0];
    const tgtAsset = supportedAssets.find(a => a.id === targetAssetId) || supportedAssets[1];
    
    const amountNum = parseFloat(sourceAmount) || 0;
    const sourceUsdValue = amountNum * srcAsset.priceUsd;
    
    // Dynamic Fee Calculation
    const feeTier = pancakeSwapService.calculateDynamicFeeTier(sourceUsdValue);
    const platformFeeUsd = (sourceUsdValue * feeTier.ratePercent) / 100;
    const platformFeeInTargetAsset = platformFeeUsd / tgtAsset.priceUsd;
    
    // Estimated DEX Slippage & Gas Relayer Cost (approx $0.80 USD gas total for X->Z->B on BSC)
    const estimatedGasUsd = 0.80;
    const slippagePercent = 0.25; // 0.25% DEX slippage on PancakeSwap V3
    const slippageDeductionUsd = (sourceUsdValue * slippagePercent) / 100;
    
    const netUsdValue = Math.max(0, sourceUsdValue - platformFeeUsd - estimatedGasUsd - slippageDeductionUsd);
    const estimatedOutputTargetAmount = netUsdValue / tgtAsset.priceUsd;
    
    // Exchange rate (1 Source = X Target)
    const exchangeRate = srcAsset.priceUsd / tgtAsset.priceUsd;

    return {
      sourceAsset: srcAsset,
      targetAsset: tgtAsset,
      sourceAmount: amountNum,
      sourceUsdValue,
      exchangeRate,
      feeTier,
      platformFeeUsd,
      platformFeeInTargetAsset,
      estimatedGasUsd,
      slippagePercent,
      netUsdValue,
      estimatedOutputTargetAmount,
      routeDescription: `کیف پول A ➔ کیف پول موقت X ➔ پنکیک‌اسواپ V3 ➔ کیف پول واسط Z ➔ کیف پول مقصد B`
    };
  }
};
