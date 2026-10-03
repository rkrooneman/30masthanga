/**
 * billing - the ONLY Play-touching code in the app.
 *
 * Wraps the Digital Goods API + Payment Request flow for the single one-time
 * "steer" unlock product, and persists the result through entitlement.ts. It is
 * the one place that references Play / the Digital Goods service, so the rest of
 * the app can stay a pure client-side React app with no billing knowledge.
 *
 * === graceful degradation (the hard constraint) ===
 * The app ships as a TWA on the Play Store AND as a plain PWA / browser build.
 * Only inside the TWA does `window.getDigitalGoodsService` exist and does Play
 * Billing back a PaymentRequest. In a plain browser NONE of these APIs are
 * present, so EVERY function here is fully feature-detected and wrapped in
 * try/catch: on any absence, rejection, or cancellation they resolve `false`
 * and NEVER throw. The caller then simply leaves the unlock unoffered and the
 * app runs as the complete free tier. Nothing here is allowed to break the UI.
 *
 * Price is configured in the Play Console (EUR 5.99, one-time), NOT here; this
 * module only names the product id and reads back ownership.
 */

import { saveEntitlement } from './entitlement';

/**
 * The Play Billing payment method identifier. A PaymentRequest backed by Play
 * Billing uses this fixed method string (the Digital Goods service is obtained
 * for the same billing origin below).
 */
const PLAY_BILLING_METHOD = 'https://play.google.com/billing';

/**
 * The one-time unlock product id, as configured in the Play Console. A single
 * managed (one-time) product that, once owned, grants the steer entitlement.
 */
export const UNLOCK_PRODUCT_ID = 'steer_unlock';

// --- minimal local typings for the Digital Goods API + Play Billing ----------
// These are not in the standard DOM lib. We declare only the small surface we
// use; everything is optional so feature-detection drives the runtime behaviour.

/** A purchase record as returned by DigitalGoodsService.listPurchases(). */
interface DigitalGoodsPurchase {
  itemId: string;
  purchaseToken: string;
}

/** The subset of the Digital Goods service we rely on. */
interface DigitalGoodsService {
  getDetails(itemIds: string[]): Promise<unknown>;
  listPurchases(): Promise<DigitalGoodsPurchase[]>;
  consume?(purchaseToken: string): Promise<void>;
}

/** The shape Play Billing expects in a PaymentRequest's payment method data. */
interface PlayBillingPaymentMethodData {
  supportedMethods: string;
  data: { sku: string };
}

/**
 * The Digital Goods entry point, present on `window` only inside a TWA with the
 * Digital Goods API available. Declared as an optional method so feature
 * detection (`typeof ... === 'function'`) is type-safe.
 */
interface DigitalGoodsWindow {
  getDigitalGoodsService?: (
    serviceProvider: string,
  ) => Promise<DigitalGoodsService>;
}

/** Narrow `window` to the Digital Goods shape without using `any`. */
function digitalGoodsWindow(): DigitalGoodsWindow {
  return window as unknown as DigitalGoodsWindow;
}

/**
 * Resolve the Digital Goods service for Play Billing, or null when it is not
 * available (plain browser / PWA) or the lookup fails. Never throws.
 */
async function getService(): Promise<DigitalGoodsService | null> {
  try {
    const getDigitalGoodsService =
      digitalGoodsWindow().getDigitalGoodsService;
    if (typeof getDigitalGoodsService !== 'function') return null;
    const service = await getDigitalGoodsService(PLAY_BILLING_METHOD);
    return service ?? null;
  } catch {
    return null;
  }
}

/**
 * Feature-detect whether Play Billing is available on this device. True only
 * inside a TWA whose Digital Goods service resolves AND where PaymentRequest
 * exists; false in every plain browser / PWA. Never throws.
 *
 * Callers use this to decide whether to OFFER the unlock at all - when false the
 * unlock is simply not offered and the app stays the complete free tier.
 */
export async function isBillingAvailable(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;
    if (typeof window.PaymentRequest !== 'function') return false;
    const service = await getService();
    return service !== null;
  } catch {
    return false;
  }
}

/**
 * Launch the Play Billing purchase flow for the one-time unlock. On a completed
 * purchase it persists the entitlement (entitlement.ts) and resolves true. On
 * any absence of the APIs, cancellation, or error it resolves false and never
 * throws, so the sheet can close quietly with no nagging.
 */
export async function purchaseUnlock(): Promise<boolean> {
  try {
    const service = await getService();
    if (service === null) return false;
    if (typeof window.PaymentRequest !== 'function') return false;

    const methodData: PlayBillingPaymentMethodData[] = [
      {
        supportedMethods: PLAY_BILLING_METHOD,
        data: { sku: UNLOCK_PRODUCT_ID },
      },
    ];
    // Play Billing ignores the PaymentDetails totals (the real price comes from
    // the Play Console), but PaymentRequest requires a non-empty details object.
    const details: PaymentDetailsInit = {
      total: {
        label: 'Steer unlock',
        amount: { currency: 'EUR', value: '0' },
      },
    };

    const request = new PaymentRequest(
      methodData as unknown as PaymentMethodData[],
      details,
    );
    const response = await request.show();
    // The purchase is complete once Play reports it; acknowledge the response so
    // the browser's payment UI dismisses cleanly.
    await response.complete('success');

    saveEntitlement(true);
    return true;
  } catch {
    // Cancelled, unavailable, or failed - stay locked, surface nothing.
    return false;
  }
}

/**
 * Query Play for existing purchases and, if the unlock product is already owned
 * on this Google account, persist the entitlement and resolve true. Resolves
 * false when billing is unavailable, nothing is owned, or any error occurs.
 * Never throws. Used both from the "Restore purchase" action and once on app
 * mount so a reinstall / new device silently re-grants a prior purchase.
 */
export async function restoreEntitlement(): Promise<boolean> {
  try {
    const service = await getService();
    if (service === null) return false;
    const purchases = await service.listPurchases();
    const owned = purchases.some(
      (purchase) => purchase.itemId === UNLOCK_PRODUCT_ID,
    );
    if (!owned) return false;
    saveEntitlement(true);
    return true;
  } catch {
    return false;
  }
}
