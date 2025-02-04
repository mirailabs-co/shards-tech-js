import React, { useState, useLayoutEffect, useEffect, CSSProperties } from 'react';
import { ShardsDSPCore } from '..';
import { AdsType } from '../constants/types';
import { ConnectType } from './core';

export type AdShardTechProps = {
	adsBlockId: string;
	clientId: string;
	options?: ConnectType;
};

export const AdShardTech = (props: AdShardTechProps) => {
	const [shardsTechCore, setShardsTechCore] = useState<any | null>(null);
	const [ad, setAd] = useState<AdsType | null>(null);
	const [isAdRendered, setIsAdRendered] = useState(false);

	const initShardsTechCore = async () => {
		try {
			const shardsTech = await ShardsDSPCore.init({
				clientId: props.clientId,
			});
			const [shardsTechCore, shardsTechConnection] = await shardsTech.connect(props.options);
			setShardsTechCore(shardsTechCore);
		} catch (error) {
			console.log(error);
		}
	};

	useLayoutEffect(() => {
		initShardsTechCore();
	}, [props.clientId]);

	useEffect(() => {
		if (shardsTechCore) {
			shardsTechCore.getAdsByAdsBlock(props.adsBlockId).then((ads: React.SetStateAction<AdsType>[]) => {
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
			if (adElement) {
				const adContent = adElement.innerHTML.trim().length > 0;
				if (adContent && ad && shardsTechCore && !isAdRendered) {
					shardsTechCore.viewAd(ad);
					setIsAdRendered(true);
				}
			}
		};

		const intervalId = setInterval(checkAdRendered, 1000);

		return () => clearInterval(intervalId);
	}, [shardsTechCore, ad, isAdRendered]);

	useEffect(() => {
		const styleSheet = document.styleSheets[0];
		styleSheet.insertRule(floatAnimation, styleSheet.cssRules.length);
		styleSheet.insertRule(shineAnimation, styleSheet.cssRules.length);
	}, []);

	const onClickAd = () => {
		if (ad?.adsCampaign?.[0]?.url) {
			window.open(ad?.adsCampaign?.[0]?.url, '_blank');
		}
		shardsTechCore.doAd(ad);
	};

	if (!shardsTechCore) {
		return null;
	}

	return (
		<div style={styles.advertisementSection}>
			{shardsTechCore && (
				<div
					id="adx-advertisement"
					style={styles.advertisementBanner}
					onClick={onClickAd}
					onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.01)')}
					onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
				>
					<div style={styles.shineEffect} />

					{ad?.adsCampaign?.[0]?.logo ? (
						<div style={styles.adContent}>
							<img src={ad?.adsCampaign?.[0]?.logo} alt="Advertisement" style={styles.adContentImg} />
						</div>
					) : (
						<div style={styles.adContentPlaceholder}>
							<span style={styles.adContentPlaceholderText}>Advertisement</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

const styles: Record<string, CSSProperties> = {
	advertisementSection: {
		marginBottom: '3rem',
		paddingLeft: '1.5rem',
		paddingRight: '1.5rem',
	},
	advertisementBanner: {
		width: '100%',
		aspectRatio: '3.2',
		transition: 'transform 0.2s ease-in-out',
		borderRadius: '1rem',
		overflow: 'hidden',
		cursor: 'pointer',
		position: 'relative',
	},
	advertisementBannerHover: {
		transform: 'scale(1.01)',
	},
	decorationStar: {
		position: 'absolute',
		top: 0,
		right: 0,
		margin: '0.5rem',
		animation: 'float 3s ease-in-out infinite',
	},
	decorationSparkle: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		margin: '0.5rem',
		animation: 'float 3s ease-in-out infinite',
		animationDelay: '1.5s',
	},
	decorationImg: {
		width: '20px',
		height: '20px',
		opacity: 0.75,
	},
	shineEffect: {
		position: 'absolute',
		inset: 0,
		background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
		animation: 'shine 2s infinite',
	},
	adContent: {
		width: '100%',
		height: '100%',
	},
	adContentImg: {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
	},
	adContentPlaceholder: {
		width: '100%',
		height: '100%',
		backgroundColor: '#f0f0f0',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	adContentPlaceholderText: {
		color: '#999',
	},
};

const floatAnimation = `
  @keyframes float {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0);
    }
  }
`;

const shineAnimation = `
  @keyframes shine {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;
