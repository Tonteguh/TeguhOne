/**
 * Centralized Monetization Service
 * Ensures all affiliate links, donation QRIS, and sponsor banners are configured in one place.
 * If monetization is toggled OFF, the app runs completely ad-free and without interruption.
 */

export interface MonetizationConfig {
  isEnabled: boolean;
  allowAffiliates: boolean;
  allowDonations: boolean;
  allowSponsoredBanners: boolean;
  qris: {
    receiverName: string;
    nmdId: string;
    note: string;
  };
  supportedPlatforms: Array<'shopee' | 'tiktok'>;
}

class MonetizationManager {
  private config: MonetizationConfig = {
    isEnabled: true,
    allowAffiliates: true,
    allowDonations: true,
    allowSponsoredBanners: false, // Default off to prevent visual clutters
    qris: {
      receiverName: 'TeguhOne Peduli Santri & Mandiri',
      nmdId: 'ID1020030040050',
      note: 'Infaq & Pengembangan Aplikasi Mandiri P2P',
    },
    supportedPlatforms: ['shopee', 'tiktok'],
  };

  getConfig(): MonetizationConfig {
    return { ...this.config };
  }

  isAffiliateActive(): boolean {
    return this.config.isEnabled && this.config.allowAffiliates;
  }

  isDonationActive(): boolean {
    return this.config.isEnabled && this.config.allowDonations;
  }

  toggleMonetization(enabled: boolean): void {
    this.config.isEnabled = enabled;
  }
}

export const monetizationService = new MonetizationManager();
