import React, { useState, useLayoutEffect, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { ShardsDSPCore } from '..';
import { AdPosition, AdsType } from '../constants/types';
import { ConnectType } from './core';
import { useInView } from 'react-intersection-observer';
import { logFirebaseEvent } from '../lib/firebaseConfig';

export type AdShardTechProps = {
	adsBlockId: string;
	appId: string;
	width?: number;
	borderRadius?: number;
	options?: ConnectType;
	position?: AdPosition;
	env?: string;
};

const shine = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const AdvertisementSection = styled.div<{ position?: string; width?: number; borderRadius?: number }>`
	aspect-ratio: 32/5;
	margin-inline: 8px;
	flex-shrink: 0;

	${({ position, width, borderRadius }) =>
		position === AdPosition.DEFAULT
			? `
				position: relative;
				min-width: 320px;
				max-width: 512px;
				width: ${width ? `${Math.min(Math.max(width, 320), 512)}px` : 'calc(100% - 16px)'};
				border-radius: ${borderRadius ? `${Math.min(borderRadius, 24)}px` : '0'};
				overflow: hidden;
			`
			: `
				position: fixed;
				z-index: 9999;
				border-radius: 8px;
				overflow: hidden;
				${
					position === 'left' || position === 'right'
						? 'width: calc(100px - 16px);'
						: `
						min-width: 320px;
						max-width: 512px;
						width: calc(100% - 16px);
					`
				}
			`}

	${({ position }) => {
		const positions = {
			top: `
				top: 8px;
				left: 50%;
				transform: translateX(-50%);
			`,
			left: `
				left: 0;
				top: 50%;
				transform: translateY(-50%);
			`,
			right: `
				right: 0;
				top: 50%;
				transform: translateY(-50%);
			`,
			bottom: `
				bottom: 8px;
				left: 50%;
				transform: translateX(-50%);
			`,
		};
		return position && position !== AdPosition.DEFAULT ? positions[position as keyof typeof positions] : '';
	}}
`;

const AdvertisementBanner = styled.div`
	width: 100%;
	height: 100%;
	aspect-ratio: 32/5;
	overflow: hidden;
	cursor: pointer;
	position: relative;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
	border-radius: 0;
`;

const ShineEffect = styled.div`
	position: absolute;
	inset: 0;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
	animation: ${shine} 2s infinite;
`;

const AdContent = styled.div`
	width: 100%;
	height: 100%;
	position: relative;
`;

const AdContentImg = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: transform 0.2s ease-in-out;

	&:hover {
		transform: scale(1.01);
	}
`;

const AdContentPlaceholder = styled.div`
	width: 100%;
	height: 100%;
	background-color: #f0f0f0;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const AdContentPlaceholderText = styled.span`
	color: #999;
`;

const CloseButton = styled.button`
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

	&::before,
	&::after {
		content: '';
		position: absolute;
		width: 6px;
		height: 1px;
		background: #000000;
	}

	&::before {
		transform: rotate(45deg);
	}

	&::after {
		transform: rotate(-45deg);
	}
`;

export const AdShardTech = ({
	position = AdPosition.DEFAULT,
	adsBlockId,
	appId,
	width,
	borderRadius,
	options,
	env,
}: AdShardTechProps) => {
	const [shardsTechCore, setShardsTechCore] = useState<ShardsDSPCore | null>(null);
	const [ad, setAd] = useState<AdsType | null>(null);
	const [isAdRendered, setIsAdRendered] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
	const [isValidSize, setIsValidSize] = useState(true);
	const { ref, inView } = useInView({
		threshold: 0.5,
	});

	const banner = ad?.adsCampaign?.[0]?.images?.[0]?.url || ad?.adsCampaign?.[0]?.logo || '';

	const initShardsTechCore = async () => {
		try {
			const shardsTech = await ShardsDSPCore.init({ clientId: appId, env: env || 'development' });
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
				if (ads.length > 0) {
					setAd(ads[0]);
				}
			});
		}
	}, [shardsTechCore, adsBlockId]);

	useEffect(() => {
		if (!ad || !shardsTechCore || isAdRendered || !inView) {
			return;
		}

		console.log('VIEW AD');
		shardsTechCore.viewAd(ad);
		setIsAdRendered(true);

		try {
			window?.gtag('event', `${env || 'development'}-ad_banner_viewed`, {
				ad_id: ad?.adsCampaign?.[0]?.id,
				ad_block_id: ad?.adsBlockId,
				ad_campaign_id: ad?.adsCampaign?.[0]?.campaignId,
			});
		} catch (error) {}

		try {
			logFirebaseEvent(`firebase-${env || 'development'}-ad_banner_viewed`, {
				ad_id: ad?.adsCampaign?.[0]?.id,
				ad_block_id: ad?.adsBlockId,
				ad_campaign_id: ad?.adsCampaign?.[0]?.campaignId,
			});
		} catch (error) {}
	}, [shardsTechCore, ad, isAdRendered, inView, env]);

	const fetchNewAd = async () => {
		if (shardsTechCore) {
			const ads = await shardsTechCore.getAdsByAdsBlock(adsBlockId);
			if (ads.length > 0) {
				setAd(ads[0]);
				setIsAdRendered(false);
			}
		}
	};

	useEffect(() => {
		if (!shardsTechCore) {
			return;
		}

		const intervalId = setInterval(() => {
			fetchNewAd();
		}, 30000);

		return () => clearInterval(intervalId);
	}, [shardsTechCore]);

	const onClickAd = async () => {
		if (ad?.adsCampaign?.[0]?.url) {
			try {
				window?.gtag('event', `${env || 'development'}-ad_banner_clicked`, {
					ad_id: ad?.adsCampaign?.[0]?.id,
					ad_block_id: ad?.adsBlockId,
					ad_campaign_id: ad?.adsCampaign?.[0]?.campaignId,
				});
			} catch (error) {}

			try {
				logFirebaseEvent(`firebase-${env || 'development'}-ad_banner_clicked`, {
					ad_id: ad?.adsCampaign?.[0]?.id,
					ad_block_id: ad?.adsBlockId,
					ad_campaign_id: ad?.adsCampaign?.[0]?.campaignId,
				});
			} catch (error) {}

			window.open(ad.adsCampaign[0].url, '_blank');
			shardsTechCore?.doAd(ad);
			await fetchNewAd();
		}
	};

	const handleClose = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsVisible(false);
		setTimeout(() => {
			setIsVisible(true);
			fetchNewAd();
		}, 30000);
	};

	const validateDefaultSize = () => {
		try {
			if (position !== AdPosition.DEFAULT) {
				return true;
			}

			const adElement = document.getElementById('adx-advertisement');
			if (!adElement) {
				return false;
			}

			const { width, height } = adElement.getBoundingClientRect();
			return width >= 320 && width <= 512 && height >= 50 && height <= 80;
		} catch (error) {
			console.warn('Error validating ad size:', error);
			return false;
		}
	};

	useLayoutEffect(() => {
		if (position === AdPosition.DEFAULT && ad) {
			setIsValidSize(validateDefaultSize());
		}
	}, [position, ad]);

	if (position === AdPosition.DEFAULT && !isValidSize) {
		console.log('position, isValidSize ', position, isValidSize);
		// return null;
	}

	if (!shardsTechCore || !isVisible || !ad) {
		return null;
	}

	return (
		<AdvertisementSection position={position} width={width} borderRadius={borderRadius}>
			<AdvertisementBanner id="adx-advertisement" onClick={onClickAd} ref={ref}>
				<CloseButton onClick={handleClose} />
				<ShineEffect />
				{banner ? (
					<AdContent>
						<AdContentImg src={banner} alt="Advertisement" />
					</AdContent>
				) : (
					<AdContentPlaceholder>
						<AdContentPlaceholderText>Advertisement</AdContentPlaceholderText>
					</AdContentPlaceholder>
				)}
			</AdvertisementBanner>
		</AdvertisementSection>
	);
};
