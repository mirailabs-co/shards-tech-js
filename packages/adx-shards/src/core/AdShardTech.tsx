import React, { useState, useLayoutEffect, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { ShardsDSPCore } from '..';
import { AdPosition, AdsType } from '../constants/types';
import { ConnectType } from './core';

export type AdShardTechProps = {
	adsBlockId: string;
	appId: string;
	options?: ConnectType;
	position?: AdPosition;
	env?: string;
};

const float = keyframes`
0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const shine = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const AdvertisementSection = styled.div<{ position?: string }>`
	position: fixed;
	z-index: 9999;
	border-radius: 8px;
	overflow: hidden;
	${({ position }) => (position === 'top' ? 'margin-top: 8px;' : position === 'bottom' ? 'margin-bottom: 8px;' : '')}
	${({ position }) => (position === 'left' || position === 'right' ? 'width: 100px;' : 'height: 150px;')}

	${({ position }) => {
		switch (position) {
			case 'top':
				return `
					top: 0;
					left: 50%;
					transform: translateX(-50%);
				`;
			case 'left':
				return `
					left: 0;
					top: 50%;
					transform: translateY(-50%);
				`;
			case 'right':
				return `
					right: 0;
					top: 50%;
					transform: translateY(-50%);
				`;
			default: // bottom
				return `
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
				`;
		}
	}}

	@media (max-width: 768px) {
		${({ position }) => (position === 'left' || position === 'right' ? 'width: 80px;' : 'height: 100px;')}
	}
`;

const AdvertisementBanner = styled.div<{ position?: string }>`
	width: 100%;
	height: 100%;
	aspect-ratio: ${({ position }) => (position === 'left' || position === 'right' ? '1/2' : '32/10')};
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

const AdContentMask = styled.div`
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 12px 16px;
	background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #262626 80.9%);
	z-index: 1;
`;

const AdTitle = styled.h3`
	color: white;
	margin: 0;
	font-size: 14px;
	font-weight: 700;
	margin-bottom: 4px;
`;

const AdDescription = styled.p`
	color: white;
	margin: 0;
	font-size: 12px;
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

export const AdShardTech = (props: AdShardTechProps) => {
	const [shardsTechCore, setShardsTechCore] = useState<ShardsDSPCore | null>(null);
	const [ad, setAd] = useState<AdsType | null>(null);
	const [isAdRendered, setIsAdRendered] = useState(false);
	const [isVisible, setIsVisible] = useState(true);

	const title = ad?.adsCampaign?.[0]?.title || '';
	const description = ad?.adsCampaign?.[0]?.desc || '';
	const banner = ad?.adsCampaign?.[0]?.images?.[0]?.url || ad?.adsCampaign?.[0]?.logo || '';

	const initShardsTechCore = async () => {
		try {
			const shardsTech = await ShardsDSPCore.init({ clientId: props.appId, env: props.env || 'development' });
			const [shardsTechCore] = await shardsTech.connect(props.options);
			setShardsTechCore(shardsTechCore);
		} catch (error) {
			console.log(error);
		}
	};

	useLayoutEffect(() => {
		initShardsTechCore();
	}, [props.appId]);

	useEffect(() => {
		if (shardsTechCore) {
			shardsTechCore.getAdsByAdsBlock(props.adsBlockId).then((ads: AdsType[]) => {
				if (ads.length > 0) {
					setAd(ads[0]);
				}
			});
		}
	}, [shardsTechCore, props.adsBlockId]);

	useEffect(() => {
		if (!ad || !shardsTechCore || isAdRendered) {
			return;
		}

		const checkAdRendered = () => {
			const adElement = document.getElementById('adx-advertisement');
			if (adElement?.innerHTML.trim().length > 0) {
				shardsTechCore.viewAd(ad);
				setIsAdRendered(true);

				try {
					window?.gtag('event', `${props.env || 'development'}-ad_banner_viewed`, {
						ad_id: ad?.adsCampaign?.[0]?.id,
						ad_block_id: ad?.adsBlockId,
						ad_campaign_id: ad?.adsCampaign?.[0]?.campaignId,
					});
				} catch (error) {}
			}
		};

		const intervalId = setInterval(checkAdRendered, 1000);
		return () => clearInterval(intervalId);
	}, [shardsTechCore, ad, isAdRendered]);

	const fetchNewAd = async () => {
		if (shardsTechCore) {
			const ads = await shardsTechCore.getAdsByAdsBlock(props.adsBlockId);
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
				window?.gtag('event', `${props.env || 'development'}-ad_banner_clicked`, {
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

	if (!shardsTechCore || !isVisible || !ad) {
		return null;
	}

	return (
		<AdvertisementSection position={props.position}>
			<AdvertisementBanner id="adx-advertisement" onClick={onClickAd} position={props.position}>
				{props.position && <CloseButton onClick={handleClose} />}
				<ShineEffect />
				{banner ? (
					<AdContent>
						<AdContentImg src={banner} alt="Advertisement" />
						{(title || description) && (
							<AdContentMask>
								{title && <AdTitle>{title}</AdTitle>}
								{description && <AdDescription>{description}</AdDescription>}
							</AdContentMask>
						)}
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
