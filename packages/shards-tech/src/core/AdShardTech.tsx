import React, { useState, useLayoutEffect, useEffect } from 'react';
import { ShardsDSPCore } from '..';
import { AdsType } from '../constants/types';

export type AdShardTechProps = {
	adsBlockId: string;
	clientId: string;
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
			const [shardsTechCore, shardsTechConnection] = await shardsTech.connect();
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
				console.log('ads :>> ', ads);
				setAd(ads[0]);
			});
		}
	}, [shardsTechCore, props.adsBlockId]);

	useEffect(() => {
        if (!ad || !shardsTechCore || isAdRendered) return;
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

	const onClickAd = () => {
		if (ad?.adsCampaign[0]?.url) {
			window.open(ad?.adsCampaign[0]?.url, '_blank');
		}
		shardsTechCore.doAd(ad);
	};

    if (!shardsTechCore) return null;

	return (
		<div className="mb-5 px-4">
			{shardsTechCore && (
				<div
					id="adx-advertisement"
					className="advertisement-banner rounded-4 overflow-hidden cursor-pointer position-relative"
					onClick={onClickAd}
					style={{
						width: '100%',
						aspectRatio: '16/5',
						transition: 'transform 0.2s ease-in-out',
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.transform = 'scale(1.01)';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = 'scale(1)';
					}}
				>
					<div
						className="position-absolute top-0 end-0 m-2"
						style={{ animation: 'float 3s ease-in-out infinite' }}
					>
						<img src="/svg/star.svg" alt="" className="opacity-75" style={{ width: 20, height: 20 }} />
					</div>
					<div
						className="position-absolute bottom-0 start-0 m-2"
						style={{ animation: 'float 3s ease-in-out infinite 1.5s' }}
					>
						<img src="/svg/sparkle.svg" alt="" className="opacity-75" style={{ width: 24, height: 24 }} />
					</div>

					<div
						className="position-absolute inset-0"
						style={{
							background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
							animation: 'shine 2s infinite',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
						}}
					/>
					{ad?.adsCampaign[0]?.logo ? (
						<img
							src={ad?.adsCampaign[0]?.logo}
							alt="Advertisement"
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
							}}
						/>
					) : (
						<div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
							<span className="text-muted">Advertisement</span>
						</div>
					)}

					<style>{`
						@keyframes float {
							0%,
							100% {
								transform: translateY(0px);
							}
							50% {
								transform: translateY(-10px);
							}
						}

						@keyframes fadeIn {
							from {
								opacity: 0;
							}
							to {
								opacity: 1;
							}
						}

						@keyframes shine {
							from {
								transform: translateX(-100%);
							}
							to {
								transform: translateX(100%);
							}
						}
					`}</style>
				</div>
			)}
		</div>
	);
};
