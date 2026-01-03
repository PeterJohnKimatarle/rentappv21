export interface ShareData {
  title: string;
  text: string;
  url: string;
  image?: string;
}

export interface ShareOptions {
  property: {
    id: string;
    title: string;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    images: string[];
    description?: string;
    propertyType?: string;
  };
}

export class ShareManager {
  private static isMobile(): boolean {
    if (typeof navigator === 'undefined') return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  private static isIOS(): boolean {
    if (typeof navigator === 'undefined') return false;
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  // Attempt to open native app via deep link; fallback to store or web
  private static openWithApp(appUrl: string, androidStoreUrl: string, iosStoreUrl: string, webFallbackUrl?: string) {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      if (webFallbackUrl) {
        return;
      }
      return;
    }
    const isIOS = this.isIOS();
    const storeUrl = isIOS ? iosStoreUrl : androidStoreUrl;

    let didNavigate = false;
    const onBlur = () => {
      didNavigate = true;
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    const onVisibility = () => {
      if (document.hidden) {
        didNavigate = true;
        window.removeEventListener('blur', onBlur);
        document.removeEventListener('visibilitychange', onVisibility);
      }
    };
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);

    // Try to open the app
    try {
      window.location.href = appUrl;
    } catch {
      // ignore
    }

    // After a short delay, if still on page, fallback
    window.setTimeout(() => {
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      if (!didNavigate) {
        if (this.isMobile()) {
          // Prefer store on mobile
          window.location.href = storeUrl || webFallbackUrl || '';
        } else if (webFallbackUrl) {
          window.open(webFallbackUrl, '_blank');
        }
      }
    }, 1200);
  }
  private static formatPrice(price: number): string {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(price);
  }

  static getShareUrl(propertyId: string): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/property/${propertyId}`;
    }
    return `https://rentapp.co.tz/property/${propertyId}`;
  }

  private static formatPropertyType(propertyType?: string): string {
    if (!propertyType) return 'Property';
    const typeMap: { [key: string]: string } = {
      '1-bdrm-apartment': '1 Bedroom Apartment',
      '2-bdrm-apartment': '2 Bedroom Apartment',
      '3-bdrm-apartment': '3 Bedroom Apartment',
      '4-bdrm-apartment': '4 Bedroom Apartment',
      '5-bdrm-apartment': '5 Bedroom Apartment',
      'commercial-building-frame': 'Commercial Building (Frame)',
    };
    return typeMap[propertyType] || propertyType.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  private static getShareData(options: ShareOptions): ShareData {
    const { property } = options;
    const url = this.getShareUrl(property.id);
    const price = this.formatPrice(property.price);
    const propertyTypeLabel = this.formatPropertyType(property.propertyType);
    
    // Use property title if available, otherwise generate from type
    const title = property.title || `${propertyTypeLabel} in ${property.location}`;
    
    // Build share text in the new format: Hi..! + Check out this amazing property + title (line break) + location
    // URL is not included in text - let each app handle the URL separately
    const text = `Hi..!\n\nCheck out this amazing property\n\n${title}\n${property.location}`;
    
    return {
      title: title,
      text: text,
      url: url,
      image: property.images[0]
    };
  }

  // Web Share API (Native sharing)
  static async shareNative(options: ShareOptions): Promise<boolean> {
    if (!navigator.share) {
      return false;
    }

    try {
      const shareData = this.getShareData(options);
      await navigator.share(shareData);
      return true;
    } catch (error) {
      console.log('Native sharing cancelled or failed:', error);
      return false;
    }
  }

  // Copy to clipboard
  static async copyToClipboard(options: ShareOptions): Promise<boolean> {
    try {
      const shareData = this.getShareData(options);
      // Text already contains title, so just use text + URL
      const shareText = `${shareData.text}\n\n${shareData.url}`;
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareText);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  // WhatsApp sharing
  static shareWhatsApp(options: ShareOptions): void {
    const shareData = this.getShareData(options);
    // Let WhatsApp handle the URL - it will show as link preview
    const message = encodeURIComponent(`${shareData.text}\n\n${shareData.url}`);
    const deepLink = `whatsapp://send?text=${message}`;
    const webUrl = `https://wa.me/?text=${message}`;
    const androidStore = 'https://play.google.com/store/apps/details?id=com.whatsapp';
    const iosStore = 'https://apps.apple.com/app/whatsapp-messenger/id310633997';
    if (this.isMobile()) {
      this.openWithApp(deepLink, androidStore, iosStore, webUrl);
    } else {
      window.open(webUrl, '_blank');
    }
  }

  // WhatsApp sharing with specific phone number (for booking/inquiry)
  static shareWhatsAppToNumber(phoneNumber: string, message: string): void {
    const encodedMessage = encodeURIComponent(message);
    const deepLink = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;
    const webUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    const androidStore = 'https://play.google.com/store/apps/details?id=com.whatsapp';
    const iosStore = 'https://apps.apple.com/app/whatsapp-messenger/id310633997';
    if (this.isMobile()) {
      this.openWithApp(deepLink, androidStore, iosStore, webUrl);
    } else {
      window.open(webUrl, '_blank');
    }
  }

  // Facebook sharing
  static shareFacebook(options: ShareOptions): void {
    const shareData = this.getShareData(options);
    // Facebook app deep link is not officially supported for generic share.
    // Attempt to open app via facewebmodal then fallback to web share dialog.
    const webUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`;
    const androidStore = 'https://play.google.com/store/apps/details?id=com.facebook.katana';
    const iosStore = 'https://apps.apple.com/app/facebook/id284882215';
    const appLink = `fb://facewebmodal/f?href=${encodeURIComponent(webUrl)}`;
    if (this.isMobile()) {
      this.openWithApp(appLink, androidStore, iosStore, webUrl);
    } else {
      window.open(webUrl, '_blank', 'width=600,height=400');
    }
  }

  // Twitter sharing
  static shareTwitter(options: ShareOptions): void {
    const shareData = this.getShareData(options);
    const text = encodeURIComponent(`${shareData.title} - ${shareData.url}`);
    const webUrl = `https://twitter.com/intent/tweet?text=${text}`;
    const appLink = `twitter://post?message=${text}`;
    const androidStore = 'https://play.google.com/store/apps/details?id=com.twitter.android';
    const iosStore = 'https://apps.apple.com/app/twitter/id333903271';
    if (this.isMobile()) {
      this.openWithApp(appLink, androidStore, iosStore, webUrl);
    } else {
      window.open(webUrl, '_blank', 'width=600,height=400');
    }
  }

  // Email sharing
  static shareEmail(options: ShareOptions): void {
    const shareData = this.getShareData(options);
    const subject = encodeURIComponent(shareData.title);
    // Add URL separately for email
    const body = encodeURIComponent(`${shareData.text}\n\nView property: ${shareData.url}`);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = emailUrl;
  }

  // SMS sharing
  static shareSMS(options: ShareOptions): void {
    const shareData = this.getShareData(options);
    // Add URL separately for SMS
    const message = encodeURIComponent(`${shareData.text}\n\n${shareData.url}`);
    const smsUrl = `sms:?body=${message}`;
    window.location.href = smsUrl;
  }

  // Telegram sharing
  static shareTelegram(options: ShareOptions): void {
    const shareData = this.getShareData(options);
    // Telegram API uses URL as separate parameter and text separately - let Telegram handle the URL
    const message = encodeURIComponent(shareData.text);
    const webUrl = `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${message}`;
    const appLink = `tg://msg_url?url=${encodeURIComponent(shareData.url)}&text=${message}`;
    const androidStore = 'https://play.google.com/store/apps/details?id=org.telegram.messenger';
    const iosStore = 'https://apps.apple.com/app/telegram-messenger/id686449807';
    if (this.isMobile()) {
      this.openWithApp(appLink, androidStore, iosStore, webUrl);
    } else {
      window.open(webUrl, '_blank', 'width=600,height=400');
    }
  }

  // Check if native sharing is supported
  static isNativeShareSupported(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.share;
  }

  // Check if clipboard API is supported
  static isClipboardSupported(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.clipboard;
  }
}
