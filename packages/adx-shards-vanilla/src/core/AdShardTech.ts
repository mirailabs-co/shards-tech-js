import { ShardsDSPCore } from '..';
import { AdPosition, AdsType } from '../constants/types';
import { logFirebaseEvent } from '../lib/firebaseConfig';
import { ConnectType } from './core';

declare global {
	interface Window {
		dataLayer: any[];
		gtag: (...args: any[]) => void;
	}
}

export interface AdShardTechOptions {
	adsBlockId: string;
	appId: string;
	width?: number;
	borderRadius?: number;
	position?: string;
	env?: string;
	options?: ConnectType;
}

export class AdShardTech {
	private options: AdShardTechOptions;
	private adsBlockId: string;
	private appId: string;
	private width?: number;
	private borderRadius: number;
	private position: string;
	private env: string;
	private connectOptions: ConnectType;

	private shardsTechCore: any | null;
	private ad: AdsType | null;
	private isAdRendered: boolean;
	private isVisible: boolean;
	private isValidSize: boolean;

	private element: HTMLDivElement | null;
	private bannerElement: HTMLDivElement | null;
	private contentElement: HTMLDivElement | null;
	private closeButton: HTMLButtonElement | null;
	private shineEffect: HTMLDivElement | null;

	private observer: IntersectionObserver | null;
	private intervalId: number | null;

	constructor(options: AdShardTechOptions) {
		this.options = options;
		this.adsBlockId = options.adsBlockId;
		this.appId = options.appId;
		this.width = options.width;
		this.borderRadius = options.borderRadius || 0;
		this.position = options.position || AdPosition.DEFAULT;
		this.env = options.env || 'development';
		this.connectOptions = options.options;

		this.shardsTechCore = null;
		this.ad = null;
		this.isAdRendered = false;
		this.isVisible = true;
		this.isValidSize = true;
		this.element = null;
		this.bannerElement = null;
		this.contentElement = null;
		this.closeButton = null;
		this.shineEffect = null;
		this.observer = null;
		this.intervalId = null;

		this.init();
	}

	async init(): Promise<void> {
		await this.initShardsTechCore();
		this.createAdElement();
		this.setupIntersectionObserver();
		this.setupAdRefresh();
	}

	async initShardsTechCore(): Promise<void> {
		try {
			const shardsTech = await ShardsDSPCore.init({
				clientId: this.appId,
				env: this.env,
			});

			console.log('this.connectOptions :>> ', this.connectOptions);
			const [shardsTechCore] = await shardsTech.connect(this.connectOptions);
			console.log('shardsTechCore :>> ', shardsTechCore);
			this.shardsTechCore = shardsTechCore;
			this.fetchAd();
		} catch (error) {
			console.log(error);
		}
	}

	async fetchAd(): Promise<void> {
		if (!this.shardsTechCore) {
			return;
		}

		try {
			const ads = await this.shardsTechCore.getAdsByAdsBlock(this.adsBlockId);
			if (ads.length > 0) {
				const FAKE_ADS = [
					{
						'campaignId': '119c59b3-01c1-4b83-b038-9b744b36e9a1',
						'adsCampaign': [
							{
								'id': 'b5f9e1cc-6a13-4d59-b9ab-727bdb83bd72',
								'campaignId': '119c59b3-01c1-4b83-b038-9b744b36e9a1',
								'title': null,
								'desc': null,
								'url': 'https://api-adx-dev.shards.tech/v1/history/5e4dec74-64f7-411c-a7b4-2487d4fe5492',
								'logo': null,
								'contentType': 'image',
								'images': [
									{
										'url': 'https://cdn.guildtech.io/image-adx-dev/e72ace93e52adf3b4c688a3adeddb5dd5bee61cc3a4a246f54cf8d0a99a5f732.gif',
										'position': 'horizontal',
									},
								],
								'videos': null,
								'verifyUrl': null,
								'createdAt': '2025-03-03T08:31:35.554Z',
								'updatedAt': '2025-03-03T08:31:35.554Z',
							},
						],
						'matchScore': 3,
						'adsBlockId': 'ff3df9c9-4a81-4771-8b49-72e2765d9955',
						'bidForCPM': 0.1,
					},
				] as AdsType[];

				// this.ad = ads[0];
				this.ad = FAKE_ADS[0];
				this.isAdRendered = false;
				this.updateAdContent();
				this.validateSize();
			}
		} catch (error) {
			console.error('Error fetching ad:', error);
		}
	}

	createAdElement(): void {
		// Create container
		this.element = document.createElement('div');
		this.element.className = 'adx-advertisement-section';

		// Apply styles based on position
		this.applyContainerStyles();

		// Create banner element
		this.bannerElement = document.createElement('div');
		this.bannerElement.id = 'adx-advertisement';
		this.bannerElement.className = 'adx-advertisement-banner';
		this.bannerElement.addEventListener('click', this.onClickAd.bind(this));

		// Create close button
		this.closeButton = document.createElement('button');
		this.closeButton.className = 'adx-close-button';
		this.closeButton.addEventListener('click', this.handleClose.bind(this));

		// Create shine effect
		this.shineEffect = document.createElement('div');
		this.shineEffect.className = 'adx-shine-effect';

		// Create content container
		this.contentElement = document.createElement('div');
		this.contentElement.className = 'adx-ad-content';

		// Append elements
		this.bannerElement.appendChild(this.closeButton);
		this.bannerElement.appendChild(this.shineEffect);
		this.bannerElement.appendChild(this.contentElement);
		this.element.appendChild(this.bannerElement);

		// Add CSS styles
		this.addStyles();
	}

	applyContainerStyles(): void {
		if (!this.element) {
			return;
		}

		this.element.style.aspectRatio = '32/5';
		this.element.style.marginInline = '8px';
		this.element.style.flexShrink = '0';

		if (this.position === AdPosition.DEFAULT) {
			this.element.style.position = 'relative';
			this.element.style.minWidth = '320px';
			this.element.style.maxWidth = '512px';
			this.element.style.width = this.width
				? `${Math.min(Math.max(this.width, 320), 512)}px`
				: 'calc(100% - 16px)';
			this.element.style.borderRadius = this.borderRadius ? `${Math.min(this.borderRadius, 24)}px` : '0';
			this.element.style.overflow = 'hidden';
		} else {
			this.element.style.position = 'fixed';
			this.element.style.zIndex = '9999';
			this.element.style.borderRadius = '8px';
			this.element.style.overflow = 'hidden';

			if (this.position === AdPosition.TOP) {
				this.element.style.top = '8px';
				this.element.style.left = '50%';
				this.element.style.transform = 'translateX(-50%)';
			} else if (this.position === AdPosition.BOTTOM) {
				this.element.style.bottom = '8px';
				this.element.style.left = '50%';
				this.element.style.transform = 'translateX(-50%)';
			}
		}
	}

	addStyles(): void {
		// Add styles if not already added
		if (!document.getElementById('adx-shards-styles')) {
			const styleSheet = document.createElement('style');
			styleSheet.id = 'adx-shards-styles';
			styleSheet.textContent = `
        @keyframes adx-shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .adx-advertisement-banner {
          width: 100%;
          height: 100%;
          aspect-ratio: 32/5;
          overflow: hidden;
          cursor: pointer;
          position: relative;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
          border-radius: 0;
        }
        
        .adx-shine-effect {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: adx-shine 2s infinite;
        }
        
        .adx-ad-content {
          width: 100%;
          height: 100%;
          position: relative;
        }
        
        .adx-ad-content img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.2s ease-in-out;
        }
        
        .adx-ad-content img:hover {
          transform: scale(1.01);
        }
        
        .adx-ad-placeholder {
          width: 100%;
          height: 100%;
          background-color: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .adx-ad-placeholder-text {
          color: #999;
        }
        
        .adx-close-button {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #dddddd;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 0;
          transition: background 0.2s ease;
        }
        
        .adx-close-button::before,
        .adx-close-button::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 1px;
          background: #000000;
        }
        
        .adx-close-button::before {
          transform: rotate(45deg);
        }
        
        .adx-close-button::after {
          transform: rotate(-45deg);
        }
      `;
			document.head.appendChild(styleSheet);
		}
	}

	updateAdContent(): void {
		if (!this.contentElement || !this.ad) {
			return;
		}

		// Clear previous content
		this.contentElement.innerHTML = '';

		const banner = this.ad?.adsCampaign?.[0]?.images?.[0]?.url || this.ad?.adsCampaign?.[0]?.logo;

		if (banner) {
			const img = document.createElement('img');
			img.src = banner;
			img.alt = 'Advertisement';
			this.contentElement.appendChild(img);
		} else {
			const placeholder = document.createElement('div');
			placeholder.className = 'adx-ad-placeholder';

			const placeholderText = document.createElement('span');
			placeholderText.className = 'adx-ad-placeholder-text';
			placeholderText.textContent = 'Advertisement';

			placeholder.appendChild(placeholderText);
			this.contentElement.appendChild(placeholder);
		}
	}

	setupIntersectionObserver(): void {
		this.observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry.isIntersecting && this.ad && this.shardsTechCore && !this.isAdRendered) {
					console.log('VIEW AD');
					this.shardsTechCore.viewAd(this.ad);
					this.isAdRendered = true;

					try {
						window?.gtag('event', `${this.env}-ad_banner_viewed`, {
							ad_id: this.ad?.adsCampaign?.[0]?.id,
							ad_block_id: this.ad?.adsBlockId,
							ad_campaign_id: this.ad?.adsCampaign?.[0]?.campaignId,
						});
					} catch (error) {}

					try {
						logFirebaseEvent(`firebase-${this.env}-ad_banner_viewed`, {
							ad_id: this.ad?.adsCampaign?.[0]?.id,
							ad_block_id: this.ad?.adsBlockId,
							ad_campaign_id: this.ad?.adsCampaign?.[0]?.campaignId,
						});
					} catch (error) {}
				}
			},
			{ threshold: 0.5 },
		);
	}

	setupAdRefresh(): void {
		this.intervalId = window.setInterval(() => {
			this.fetchAd();
		}, 30000);
	}

	async onClickAd(): Promise<void> {
		if (!this.ad?.adsCampaign?.[0]?.url) {
			return;
		}

		try {
			window?.gtag('event', `${this.env}-ad_banner_clicked`, {
				ad_id: this.ad?.adsCampaign?.[0]?.id,
				ad_block_id: this.ad?.adsBlockId,
				ad_campaign_id: this.ad?.adsCampaign?.[0]?.campaignId,
			});
		} catch (error) {}

		try {
			logFirebaseEvent(`firebase-${this.env}-ad_banner_clicked`, {
				ad_id: this.ad?.adsCampaign?.[0]?.id,
				ad_block_id: this.ad?.adsBlockId,
				ad_campaign_id: this.ad?.adsCampaign?.[0]?.campaignId,
			});
		} catch (error) {}

		window.open(this.ad.adsCampaign[0].url, '_blank');
		this.shardsTechCore?.doAd(this.ad);
		await this.fetchAd();
	}

	handleClose(e: Event): void {
		e.stopPropagation();
		this.isVisible = false;
		if (this.element) {
			this.element.style.display = 'none';
		}

		setTimeout(() => {
			this.isVisible = true;
			if (this.element) {
				this.element.style.display = '';
			}
			this.fetchAd();
		}, 30000);
	}

	validateSize(): void {
		try {
			if (this.position !== AdPosition.DEFAULT) {
				this.isValidSize = true;
				return;
			}

			if (!this.bannerElement) {
				this.isValidSize = false;
				return;
			}

			const { width, height } = this.bannerElement.getBoundingClientRect();
			this.isValidSize = width >= 320 && width <= 512 && height >= 50 && height <= 80;

			if (!this.isValidSize) {
				console.log('Invalid ad size:', width, height);
			}
		} catch (error) {
			console.warn('Error validating ad size:', error);
			this.isValidSize = false;
		}
	}

	mount(container: HTMLElement): void {
		if (!container) {
			console.error('No container provided to mount AdShardTech');
			return;
		}

		if (!this.shardsTechCore || !this.isVisible || !this.ad || !this.element || !this.bannerElement) {
			// Try again later when data is loaded
			setTimeout(() => this.mount(container), 100);
			return;
		}

		container.appendChild(this.element);

		if (this.observer && this.bannerElement) {
			this.observer.observe(this.bannerElement);
		}
	}

	unmount(): void {
		if (this.observer) {
			this.observer.disconnect();
		}

		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}

		if (this.element && this.element.parentNode) {
			this.element.parentNode.removeChild(this.element);
		}
	}
}
