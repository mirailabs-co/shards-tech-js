import React, { createContext, FC, PropsWithChildren, useContext, useEffect, useLayoutEffect, useState } from 'react';
import styled from 'styled-components';
import { ShardsDSPCore } from '../..';
import { AdPosition, AdsMediaType, AdsType } from '../../constants/types';
import { ConnectType } from '../core';
import { logFirebaseEvent } from '../../lib/firebaseConfig';

declare global {
	interface Window {
		dataLayer: any[];
		gtag: (...args: any[]) => void;
	}
}

const AD_TIME = 20;

// Styled Components
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

interface AdContextType {
	showAd: () => void;
	isAdCompleted: boolean;
}
const AdContext = createContext<AdContextType | undefined>(undefined);

export type AdRewardsProps = {
	adsBlockId: string;
	appId: string;
	options?: ConnectType;
	env?: string;
};

export const AdRewards: FC<AdRewardsProps & PropsWithChildren> = ({
	adsBlockId,
	appId,
	options,
	env = 'development',
	children,
}) => {
	const [showAd, setShowAd] = useState(false);
	const [timeLeft, setTimeLeft] = useState(AD_TIME);
	const [canClose, setCanClose] = useState(false);
	const [nextTimestamp, setNextTimestamp] = useState<number | null>(null);
	const [isTracking, setIsTracking] = useState(false);
	const [isAdCompleted, setIsAdCompleted] = useState(false);

	const [shardsTechCore, setShardsTechCore] = useState<ShardsDSPCore | null>(null);
	const [ad, setAd] = useState<AdsType | null>(null);
	const adsCampaign = ad?.adsCampaign?.[0];

	const initShardsTechCore = async () => {
		try {
			const shardsTech = await ShardsDSPCore.init({ clientId: appId, env });
			const [shardsTechCore] = await shardsTech.connect(options);
			setShardsTechCore(shardsTechCore);
		} catch (error) {
			console.log(error);
		}
	};

	useLayoutEffect(() => {
		initShardsTechCore();
	}, [appId]);

	useEffect(() => {
		if (shardsTechCore) {
			shardsTechCore.getAdsByAdsBlock(adsBlockId).then((ads: AdsType[]) => {
				setAd(ads[0]);
			});
		}
	}, [shardsTechCore, adsBlockId]);

	useEffect(() => {
		let trackingInterval: NodeJS.Timeout;

		const trackViewAd = async () => {
			if (!shardsTechCore || !ad || !nextTimestamp) {
				return;
			}

			if (Date.now() >= nextTimestamp * 1000) {
				const response = await shardsTechCore.trackViewAd(ad);

				if (response?.isEnd) {
					setIsTracking(false);
					setIsAdCompleted(true);
					clearInterval(trackingInterval);
					shardsTechCore.endViewAd(ad);

					try {
						window?.gtag('event', `${env}-ad_video_completed`, {
							ad_id: ad?.adsCampaign?.[0]?.id,
							ad_block_id: ad?.adsBlockId,
							ad_campaign_id: ad?.adsCampaign?.[0]?.campaignId,
						});
					} catch (error) {}

					try {
						logFirebaseEvent(`firebase-${env}-ad_video_completed`, {
							ad_id: ad?.adsCampaign?.[0]?.id,
							ad_block_id: ad?.adsBlockId,
							ad_campaign_id: ad?.adsCampaign?.[0]?.campaignId,
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
	}, [isTracking, nextTimestamp, shardsTechCore, ad]);

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

	const showAdFunction = async () => {
		if (!shardsTechCore || !ad) {
			return;
		}

		setIsAdCompleted(false);
		const response = await shardsTechCore.startViewAd(ad);

		try {
			window?.gtag('event', `${env}-ad_video_started`, {
				ad_id: ad?.adsCampaign?.[0]?.id,
				ad_block_id: ad?.adsBlockId,
				ad_campaign_id: ad?.adsCampaign?.[0]?.campaignId,
			});
		} catch (error) {}

		try {
			logFirebaseEvent(`firebase-${env}-ad_video_started`, {
				ad_id: ad?.adsCampaign?.[0]?.id,
				ad_block_id: ad?.adsBlockId,
				ad_campaign_id: ad?.adsCampaign?.[0]?.campaignId,
			});
		} catch (error) {}

		if (response?.nextTimestamp) {
			setNextTimestamp(response.nextTimestamp);
			setIsTracking(true);
		}

		setShowAd(true);
		setTimeLeft(AD_TIME);
		setCanClose(false);
	};

	const handleCloseAd = async () => {
		if (canClose) {
			setIsTracking(false);
			setShowAd(false);
		}
	};

	return (
		<AdContext.Provider value={{ showAd: showAdFunction, isAdCompleted }}>
			{children}
			{showAd && (
				<Overlay>
					<CloseButtonWrapper>
						<CloseButton onClick={handleCloseAd} disabled={!canClose}>
							{canClose ? 'Skip Ad' : `Skip Ad in ${timeLeft}s`}
						</CloseButton>
					</CloseButtonWrapper>

					<AdMedia>
						{adsCampaign ? (
							adsCampaign?.contentType === AdsMediaType.VIDEO ? (
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
									<source src={adsCampaign?.videos?.[0]?.url} type="video/mp4" />
								</video>
							) : (
								<img src={adsCampaign?.images?.[0]?.url || adsCampaign?.logo} alt="Advertisement" />
							)
						) : (
							<Placeholder>Advertisement</Placeholder>
						)}
					</AdMedia>
				</Overlay>
			)}
		</AdContext.Provider>
	);
};

export const useAdRewards = () => {
	const context = useContext(AdContext);
	if (!context) {
		throw new Error('useAdRewards must be used within AdRewards');
	}
	return context;
};
