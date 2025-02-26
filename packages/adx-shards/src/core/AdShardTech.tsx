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
	z-index: 999;
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
	aspect-ratio: ${({ position }) => (position === 'left' || position === 'right' ? '1/2' : '3/1')};
	transition: transform 0.2s ease-in-out;
	overflow: hidden;
	cursor: pointer;
	position: relative;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
	border-radius: 0;

	&:hover {
		transform: scale(1.01);
	}
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
`;

const AdContentImg = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
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
	top: 5px;
	right: 5px;
	width: 20px;
	height: 20px;
	border-radius: 50%;
	background: rgba(0, 0, 0, 0.5);
	border: none;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	padding: 0;
	transition: background 0.2s ease;

	&:hover {
		background: rgba(0, 0, 0, 0.7);
	}

	&::before,
	&::after {
		content: '';
		position: absolute;
		width: 12px;
		height: 2px;
		background: white;
	}

	&::before {
		transform: rotate(45deg);
	}

	&::after {
		transform: rotate(-45deg);
	}
`;

export const AdShardTech = (props: AdShardTechProps) => {
	const [shardsTechCore, setShardsTechCore] = useState<any | null>(null);
	const [ad, setAd] = useState<AdsType | null>(null);
	const [isAdRendered, setIsAdRendered] = useState(false);
	const [isVisible, setIsVisible] = useState(true);

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
				setAd(ads[0]);
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

				window?.gtag('event', `${props.env || 'development'}-ad_banner_viewed`, {
					ad_id: ad?.adsCampaign?.[0]?.id,
					ad_block_id: ad?.adsBlockId,
					ad_campaign_id: ad?.adsCampaign?.[0]?.campaignId,
				});
			}
		};

		const intervalId = setInterval(checkAdRendered, 1000);
		return () => clearInterval(intervalId);
	}, [shardsTechCore, ad, isAdRendered]);

	const onClickAd = () => {
		if (ad?.adsCampaign?.[0]?.url) {
			window?.gtag('event', `${props.env || 'development'}-ad_banner_clicked`, {
				ad_id: ad?.adsCampaign?.[0]?.id,
				ad_block_id: ad?.adsBlockId,
				ad_campaign_id: ad?.adsCampaign?.[0]?.campaignId,
			});

			window.open(ad.adsCampaign[0].url, '_blank');
		}
		shardsTechCore?.doAd(ad);
	};

	const handleClose = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsVisible(false);
	};

	if (!shardsTechCore || !isVisible) {
		return null;
	}

	return (
		<AdvertisementSection position={props.position}>
			<AdvertisementBanner id="adx-advertisement" onClick={onClickAd} position={props.position}>
				{props.position && <CloseButton onClick={handleClose} />}
				<ShineEffect />
				{ad?.adsCampaign?.[0]?.logo ? (
					<AdContent>
						<AdContentImg src={ad.adsCampaign[0].logo} alt="Advertisement" />
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
