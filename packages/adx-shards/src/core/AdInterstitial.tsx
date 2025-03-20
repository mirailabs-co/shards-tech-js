import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { ShardsDSPCore } from '..';
import { AdsType, AdsMediaType } from '../constants/types';
import { ConnectType } from './core';
import { logFirebaseEvent } from '../lib/firebaseConfig';
import { sleep } from '../utils/auth-util';

declare global {
	interface Window {
		navigation?: {
			addEventListener: (type: string, listener: (event: any) => void) => void;
			removeEventListener: (type: string, listener: (event: any) => void) => void;
		};
		lastProcessedUrl?: string;
		dataLayer: any[];
		gtag: (...args: any[]) => void;
	}
}

const ROUTE_DETECTION = {
	adInterval: 5 * 1000,
	lastAdShownTime: 0,
	adSkippedInCurrentCycle: false,
};

const AD_TIME = 20;

// Styled components for ad modal
const Overlay = styled.div`
	position: fixed;
	inset: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: black;
	color: white;
	z-index: 9999;
`;

const CloseButtonWrapper = styled.div`
	position: absolute;
	right: 16px;
	top: 16px;
	z-index: 10000;
`;

const CloseButton = styled.button<{ disabled: boolean }>`
	min-width: 120px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 4px;
	background-color: rgba(0, 0, 0, 0.7);
	color: white;
	cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
	padding: 0 12px;
	font-size: 14px;
	border: none;
	transition: background-color 0.2s;
	pointer-events: auto;

	&:hover {
		background-color: ${(props) => (!props.disabled ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.7)')};
	}
`;

const AdMedia = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: black;

	img,
	video {
		width: 100%;
		height: 100%;
		max-width: 100%;
		max-height: 100vh;
		object-fit: contain;
	}
`;

const Placeholder = styled.div`
	width: 100%;
	height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #2c2c2c;
	color: white;
	font-size: 24px;
`;

export interface AdInterstitialProps {
	adsBlockId: string;
	appId: string;
	options?: ConnectType;
	env?: string;
}

export const AdInterstitial: React.FC<AdInterstitialProps> = ({ adsBlockId, appId, options, env = 'development' }) => {
	const [showAd, setShowAd] = useState(false);
	const [ad, setAd] = useState<AdsType | null>(null);
	const shardsTechCoreRef = useRef<any | null>(null);
	const [timeLeft, setTimeLeft] = useState(AD_TIME);
	const [canClose, setCanClose] = useState(false);
	const [nextTimestamp, setNextTimestamp] = useState<number | null>(null);
	const [isTracking, setIsTracking] = useState(false);

	const adsCampaign = ad?.adsCampaign?.[0];

	const initShardsTechCore = async () => {
		try {
			const shardsTech = await ShardsDSPCore.init({ clientId: appId, env });
			const [shardsTechCore] = await shardsTech.connect(options);
			shardsTechCoreRef.current = shardsTechCore;
		} catch (error) {
			console.error('Failed to initialize ShardsTechCore:', error);
		}
	};

	const fetchAd = async () => {
		if (!shardsTechCoreRef.current) {
			return null;
		}

		try {
			const ads = await shardsTechCoreRef.current.getAdsByAdsBlock(adsBlockId);
			if (ads.length > 0) {
				return ads[0];
			}
		} catch (error) {
			console.error('Error fetching ad:', error);
		}
		return null;
	};

	useEffect(() => {
		let timer: NodeJS.Timeout;

		if (showAd && timeLeft > 0) {
			timer = setInterval(() => {
				setTimeLeft((prev) => prev - 1);
			}, 1000);
		}

		return () => {
			if (timer) {
				clearInterval(timer);
			}
		};
	}, [showAd, timeLeft]);

	useEffect(() => {
		if (timeLeft === 0) {
			setCanClose(true);
		}
	}, [timeLeft]);

	useEffect(() => {
		let trackingInterval: NodeJS.Timeout;

		const trackViewAd = async () => {
			if (!shardsTechCoreRef.current || !ad || !nextTimestamp) {
				return;
			}

			if (Date.now() >= nextTimestamp * 1000) {
				const response = await shardsTechCoreRef.current.trackViewAd(ad);

				if (response?.isEnd) {
					setIsTracking(false);
					clearInterval(trackingInterval);
					shardsTechCoreRef.current.endViewAd(ad);

					try {
						window?.gtag('event', `${env}-ad_interstitial_completed`, {
							ad_id: ad?.adsCampaign?.[0]?.id,
							ad_block_id: ad?.adsBlockId,
							ad_campaign_id: ad?.campaignId,
						});
					} catch (error) {}

					try {
						logFirebaseEvent(`firebase-${env}-ad_interstitial_completed`, {
							ad_id: ad?.adsCampaign?.[0]?.id,
							ad_block_id: ad?.adsBlockId,
							ad_campaign_id: ad?.campaignId,
						});
					} catch (error) {}
				} else if (response?.nextTimestamp) {
					setNextTimestamp(response.nextTimestamp);
				}
			}
		};

		if (isTracking && nextTimestamp) {
			trackingInterval = setInterval(trackViewAd, 1000);
		}

		return () => {
			if (trackingInterval) {
				clearInterval(trackingInterval);
			}
		};
	}, [isTracking, nextTimestamp, ad, env]);

	const handleAdClick = async () => {
		if (!ad?.adsCampaign?.[0]?.url) {
			return;
		}

		try {
			if (window.gtag) {
				window.gtag('event', `${env}-ad_interstitial_clicked`, {
					ad_id: ad?.adsCampaign?.[0]?.id,
					ad_block_id: ad?.adsBlockId,
					ad_campaign_id: ad?.campaignId,
				});
			}
		} catch (error) {}

		try {
			logFirebaseEvent(`firebase-${env}-ad_interstitial_clicked`, {
				ad_id: ad?.adsCampaign?.[0]?.id,
				ad_block_id: ad?.adsBlockId,
				ad_campaign_id: ad?.campaignId,
			});
		} catch (error) {}

		window.open(ad.adsCampaign[0].url, '_blank');
		shardsTechCoreRef.current?.doAd(ad);
		handleCloseAd();
	};

	const handleCloseAd = () => {
		if (!canClose) {
			return;
		}

		setIsTracking(false);
		setShowAd(false);
		setAd(null);
	};

	const startTrackingAd = async (adToTrack: AdsType) => {
		if (!shardsTechCoreRef.current || !adToTrack) {
			return;
		}

		try {
			const response = await shardsTechCoreRef.current.startViewAd(adToTrack);

			if (response?.nextTimestamp) {
				setNextTimestamp(response.nextTimestamp);
				setIsTracking(true);
			}
		} catch (error) {
			console.error('Error tracking ad view:', error);
		}
	};

	const showInterstitialAd = async () => {
		if (ROUTE_DETECTION.adSkippedInCurrentCycle) {
			console.log('Ad display canceled: already skipped in this navigation cycle');
			return;
		}

		const newAd = await fetchAd();
		await sleep(3000);

		if (newAd) {
			setAd(newAd);
			setShowAd(true);
			setTimeLeft(AD_TIME);
			setCanClose(false);
			startTrackingAd(newAd);
		}
	};

	const setupRouteChangeDetection = () => {
		// Store current URL
		let currentUrl = window.location.href;

		// Initialize global tracking variable
		window.lastProcessedUrl = currentUrl;

		// Initialize the last ad shown time to current time
		ROUTE_DETECTION.lastAdShownTime = Date.now();

		const handleRouteChange = async (source: string) => {
			const newUrl = window.location.href;

			// 1. Skip if this exact URL was just processed by another method
			if (newUrl === window.lastProcessedUrl && newUrl === currentUrl) {
				return false;
			}

			// Update the processed URL tracker
			window.lastProcessedUrl = newUrl;

			// 2. Skip if URL hasn't actually changed
			if (newUrl === currentUrl) {
				return false;
			}

			// Check ad timing
			const currentTime = Date.now();
			const timeSinceLastAd = currentTime - ROUTE_DETECTION.lastAdShownTime;
			const shouldShowAd = timeSinceLastAd >= ROUTE_DETECTION.adInterval;

			// Store old URL and update current URL immediately
			const oldUrl = currentUrl;
			currentUrl = newUrl;

			// Skip ad display if not enough time has passed
			if (!shouldShowAd) {
				ROUTE_DETECTION.adSkippedInCurrentCycle = true;
				return false;
			}

			try {
				// Show the ad
				await showInterstitialAd();

				// Update tracking info
				ROUTE_DETECTION.lastAdShownTime = Date.now();
				ROUTE_DETECTION.adSkippedInCurrentCycle = false;
				return true;
			} catch (error) {
				return false;
			}
		};

		// Setup all detection methods
		// METHOD 1: Navigation API (modern browsers)
		if (window.navigation) {
			window.navigation.addEventListener('navigate', async () => {
				await handleRouteChange('Navigation API');
			});
		}

		// METHOD 2: Click + requestAnimationFrame
		document.body.addEventListener(
			'click',
			() => {
				requestAnimationFrame(async () => {
					await handleRouteChange('Click + RAF');
				});
			},
			true,
		);

		// METHOD 3: History API Override
		const originalPushState = window.history.pushState;
		const originalReplaceState = window.history.replaceState;

		window.history.pushState = async function (...args) {
			originalPushState.apply(this, args);
			await handleRouteChange('History pushState');
		};

		window.history.replaceState = async function (...args) {
			originalReplaceState.apply(this, args);
			await handleRouteChange('History replaceState');
		};

		// METHOD 4: Popstate event (back/forward buttons)
		window.addEventListener('popstate', async () => {
			await handleRouteChange('Popstate');
		});

		// METHOD 5: Hashchange event
		window.addEventListener('hashchange', async () => {
			await handleRouteChange('Hashchange');
		});

		// Return cleanup function
		return () => {
			if (window.navigation) {
				window.navigation.removeEventListener('navigate', () => {});
			}
			document.body.removeEventListener('click', () => {}, true);
			window.removeEventListener('popstate', () => {});
			window.removeEventListener('hashchange', () => {});
			window.history.pushState = originalPushState;
			window.history.replaceState = originalReplaceState;

			// Clear global variables
			delete window.lastProcessedUrl;
		};
	};

	useEffect(() => {
		if (typeof window !== 'undefined') {
			initShardsTechCore();
			const cleanup = setupRouteChangeDetection();
			return cleanup;
		}
	}, [appId, adsBlockId, env]);

	return (
		<>
			{showAd && (
				<Overlay>
					<CloseButtonWrapper>
						<CloseButton onClick={handleCloseAd} disabled={!canClose}>
							{canClose ? 'Skip Ad' : `Skip Ad in ${timeLeft}s`}
						</CloseButton>
					</CloseButtonWrapper>

					<AdMedia onClick={adsCampaign?.url ? handleAdClick : undefined}>
						{adsCampaign ? (
							adsCampaign.contentType === AdsMediaType.VIDEO ? (
								<video
									autoPlay
									muted
									playsInline
									loop
									controls={false}
									preload="auto"
									disablePictureInPicture
									controlsList="nodownload noplaybackrate"
									onContextMenu={(e) => e.preventDefault()}
								>
									<source src={adsCampaign.videos?.[0]?.url} type="video/mp4" />
								</video>
							) : (
								<img src={adsCampaign.images?.[0]?.url || adsCampaign.logo} alt="Advertisement" />
							)
						) : (
							<Placeholder>Advertisement</Placeholder>
						)}
					</AdMedia>
				</Overlay>
			)}
		</>
	);
};

export default AdInterstitial;
