'use client';
import { Button, Space, Table, Tabs, Typography } from 'antd';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { HomeContext } from '../context';
import React from 'react';
import LeaderBoards from './LeaderBoards';
import MyGuild from './MyGuild';
import JoinGuildRequest from './JoinGuildRequest';
import MySellSlot from './MySellSlot';
import MyHistory from './MyHistory';
import TabChat from './_TabChat';

export default function Main() {
	const { shardsTechCore } = useContext(HomeContext);

	const [deviceId, setDeviceId] = useState<any>('');
	const [myShards, setMyShards] = useState<any>(null);
	const [userOnlinesShards, setUserOnlinesShards] = useState<any>(null);
	const [guildsUserHaveShare, setGuildsUserHaveShare] = useState<any>(null);

	const connectShardsTech = async () => {
		const data = await shardsTechCore.getMyFractions();
		setMyShards(data);

		const userOnlines = await shardsTechCore.getUserOnlineInGuild();
		setUserOnlinesShards(userOnlines);

		const guildsUserHaveShare = await shardsTechCore.getMyFractions();

		setGuildsUserHaveShare(guildsUserHaveShare);
	};

	const userHaveShareColumns = [
		{
			title: 'Guild',
			dataIndex: 'guild',
			key: 'guild',
			render: (guild: any) => {
				return guild?.name;
			},
		},
		{
			title: 'amount',
			dataIndex: 'amount',
			key: 'amount',
		},
		{
			title: 'Actions',
			dataIndex: 'guild',
			key: 'action',
			render: (guild: any) => {
				return (
					<Space>
						<Button onClick={() => buyFraction(guild.address, 1, guild.chain)}>Buy Fraction</Button>
						<Button onClick={() => sellFraction(guild.address, 1, guild.chain)}>Sell Fraction</Button>
					</Space>
				);
			},
		},
	];

	useEffect(() => {
		if (shardsTechCore) {
			connectShardsTech();
		}
	}, [shardsTechCore]);

	const buyFraction = async (guildAddress: string, amount: number, chain?: string) => {
		const response = await shardsTechCore.buyFraction(guildAddress, amount, chain);
	};

	const sellFraction = async (guildAddress: string, amount: number, chain?: string) => {
		const response = await shardsTechCore.sellFraction(guildAddress, amount, chain);
	};

	const shardItems = [
		{
			key: '1',
			label: 'LeaderBoards',
			children: <LeaderBoards />,
		},
		{
			key: '2',
			label: 'My Guild',
			children: <MyGuild />,
		},
		{
			key: 'join-guild-request',
			label: 'Join Guild Request',
			children: <JoinGuildRequest />,
		},
		{
			key: 'user-share',
			label: 'User Fraction',
			children: guildsUserHaveShare && (
				<div>
					<Table
						columns={userHaveShareColumns}
						dataSource={guildsUserHaveShare || []}
						rowKey={(record) => record?.guild?._id}
						pagination={false}
					/>
				</div>
			),
		},
		{
			key: '3',
			label: 'My Sell Slot',
			children: <MySellSlot />,
		},
		{
			key: 'user-history',
			label: 'My History',
			children: <MyHistory />,
		},
		{
			key: '4',
			label: 'Chats',
			children: (
				<div className="px-4">
					<Typography.Title level={5} className="my-0">
						{userOnlinesShards?.length} user online
					</Typography.Title>
					<TabChat shardsTechCore={shardsTechCore} />
				</div>
			),
		},
	];

	return (
		<main>
			<Tabs defaultActiveKey="1" items={shardItems} />
		</main>
	);
}
