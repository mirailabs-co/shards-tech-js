'use client';
// import './globals.scss';
import { useLayoutEffect, useState } from 'react';
import { ShardsTechCore } from '@mirailabs-co/shards-tech';
import { HomeContext } from './context';
import Main from './shards-tech';
import React from 'react';

interface UIKitProps {
	accessToken: string;
	clientId: string;
	env?: string;
}

export default function Home(props: UIKitProps) {
	const { accessToken, clientId, env } = props;

	const [shardsTechCore, setShardsTechCore] = useState<any | null>(null);
	const [shardsTechConnected, setShardsTechConnected] = useState<any>(null);

	const initShardsTechCore = async () => {
		try {
			const shardsTech = await ShardsTechCore.init({
				clientId,
				env: env || 'development',
			});
			const [shardsTechCore, shardsTechConnection] = await shardsTech.connect({
				accessToken,
			});
			await shardsTechCore.getGuildOfUser();
			setShardsTechCore(shardsTechCore);
			setShardsTechConnected(shardsTechConnection);
		} catch (error) {
			console.log(error);
		}
	};

	useLayoutEffect(() => {
		initShardsTechCore();
	}, []);

	return (
		<HomeContext.Provider
			value={{
				shardsTechCore: shardsTechCore,
				shardsTechConnection: shardsTechConnected,
			}}
		>
			<Main />
		</HomeContext.Provider>
	);
}
