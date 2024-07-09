'use client';
import { useContext, useEffect, useState } from 'react';
import { Avatar, Badge, Button, Dropdown, Modal, Select, Space, Table, Typography } from 'antd';
import { GuildType, LeaderBoardType, ShardsGuildType } from '../app-constants/type';
import {
	InfoCircleTwoTone,
	MinusCircleTwoTone,
	MoreOutlined,
	PictureFilled,
	PlusCircleTwoTone,
} from '@ant-design/icons';
import { shortAddress } from '../app-utils';
import { HomeContext } from '../context';
import React from 'react';

const LeaderBoards = () => {
	const { shardsTechCore, shardsTechConnection } = useContext(HomeContext);
	const [shardsTechLeaderBoards, setShardsTechLeaderBoards] = useState<LeaderBoardType[]>([]);
	const [selectedShardsLeaderBoard, setSelectedShardsLeaderBoard] = useState<string>();
	const [listShardsGuild, setListShardsGuild] = useState<ShardsGuildType[]>();
	const [myJoinGuildRequest, setMyJoinGuildRequest] = useState<any>(null);
	const [openBuySlotPrice, setOpenBuySlotPrice] = useState<boolean>(false);
	const [buySlotPrice, setBuySlotPrice] = useState<any>(null);

	const handleLeaderBoard = async () => {
		try {
			if (!shardsTechCore) {
				return;
			}
			const leaderBoards = await shardsTechCore.getLeaderBoards();
			if (leaderBoards && leaderBoards.length) {
				setShardsTechLeaderBoards(leaderBoards);
				setSelectedShardsLeaderBoard(leaderBoards[0]?._id);
			}
			const myJoinGuildRequest = await shardsTechCore.getJoinGuildOfUser();
			setMyJoinGuildRequest(myJoinGuildRequest);
		} catch (error) {
			console.log('error >>>', error);
		}
	};

	const buyShardSlot = async () => {
		const response = await shardsTechCore.buySlot(
			buySlotPrice.guild.address,
			buySlotPrice.seller,
			buySlotPrice.price,
			buySlotPrice.guild.chain,
		);
		await shardsTechCore.getGuildOfUser();
		setOpenBuySlotPrice(false);
	};

	const getShardsGuilds = async () => {
		if (!shardsTechConnection) {
			console.log('ShardsTech not connected');
			return;
		}
		const shards = await shardsTechCore.getGuildScores({
			leaderBoardId: selectedShardsLeaderBoard,
			page: 1,
			limit: 100,
			sort: 'desc',
		});
		setListShardsGuild(shards?.data);
	};

	useEffect(() => {
		handleLeaderBoard();
	}, [shardsTechCore]);

	useEffect(() => {
		if (shardsTechLeaderBoards) {
			getShardsGuilds();
		}
	}, [shardsTechLeaderBoards]);

	const getSlotPrice = async (guildId: string) => {
		const response = await shardsTechCore.getBuySlotPrice(guildId);
		setBuySlotPrice(response);
		setOpenBuySlotPrice(true);
	};

	const createJoinGuildRequest = async (guildId: string) => {
		const response = await shardsTechCore.createJoinGuildRequest(guildId);
		const myJoinGuildRequest = await shardsTechCore.getJoinGuildOfUser();
		setMyJoinGuildRequest(myJoinGuildRequest);
	};

	const buyFraction = async (guildAddress: string, amount: number, chain?: string) => {
		const response = await shardsTechCore.buyFraction(guildAddress, amount, chain);
	};

	const sellFraction = async (guildAddress: string, amount: number, chain?: string) => {
		const response = await shardsTechCore.sellFraction(guildAddress, amount, chain);
	};

	const renderBtnBuySlot = (guild: GuildType) => {
		if (shardsTechCore && shardsTechCore.userGuild?._id) {
			return <span>Already Join Guild</span>;
		}

		if (
			(shardsTechCore.gameConfig?.memberGuildConfig?.requireJoinGuildRequest === 'off' &&
				!guild?.hasOwnProperty('requireJoinGuildRequest')) ||
			(guild?.hasOwnProperty('requireJoinGuildRequest') && !guild?.requireJoinGuildRequest)
		) {
			return <span onClick={() => getSlotPrice(guild._id)}>Get Slot Price</span>;
		}

		if (!myJoinGuildRequest || !myJoinGuildRequest.length) {
			return <span onClick={() => createJoinGuildRequest(guild._id)}>Join Guild</span>;
		}

		let status;

		for (let item of myJoinGuildRequest) {
			if (item.guild === guild._id) {
				status = item?.status;
			}
		}

		switch (status) {
			case 'accepted':
				return <span onClick={() => getSlotPrice(guild._id)}>Get Slot Price</span>;
			case 'pending':
				return <span>Join Request Pending</span>;
			case 'rejected':
				return <span onClick={() => createJoinGuildRequest(guild._id)}>Join Guild</span>;
			default:
				return <span onClick={() => createJoinGuildRequest(guild._id)}>Join Guild</span>;
		}
	};

	// const shardsGuildsColumns = [
	//   {
	//     title: "Rank",
	//     dataIndex: "guild",
	//     key: "rank",
	//     render: (guild: GuildType, record: ShardsGuildType, index: number) => {
	//       return guild?.metadata?.rank;
	//     },
	//   },
	//   {
	//     title: "Guild",
	//     dataIndex: "guild",
	//     key: "guild",
	//     render: (guild: GuildType) => {
	//       return guild.name;
	//     },
	//   },
	//   {
	//     title: "Score",
	//     dataIndex: "score",
	//     key: "score",
	//   },
	//   {
	//     title: "Actions",
	//     dataIndex: "guild",
	//     key: "action",
	//     render: (guild: GuildType, record: ShardsGuildType) => {
	//       return (
	//         <Space>
	//           {renderBtnBuySlot(guild)}
	//           <Button onClick={() => buyFraction(guild.address, 1, guild.chain)}>
	//             Buy Fraction
	//           </Button>
	//           <Button onClick={() => sellFraction(guild.address, 1, guild.chain)}>
	//             Sell Fraction
	//           </Button>
	//         </Space>
	//       );
	//     },
	//   },
	// ];

	//TODO: new UI
	const shardsGuildsColumns = [
		{
			title: 'Rank',
			dataIndex: 'guild',
			key: 'rank',
			render: (guild: GuildType) => {
				return guild?.metadata?.rank;
			},
		},
		{
			title: 'Guild',
			dataIndex: 'guild',
			key: 'guild',
			render: (guild: GuildType) => {
				return guild.name;
			},
		},
		{
			title: 'Score',
			dataIndex: 'score',
			key: 'score',
		},
		{
			title: '',
			dataIndex: 'guild',
			key: 'action',
			render: (guild: GuildType, record: ShardsGuildType) => {
				return (
					<Dropdown
						menu={{
							items: [
								{
									key: '1',
									label: renderBtnBuySlot(guild),
									icon: <InfoCircleTwoTone style={{ fontSize: '0.875rem' }} />,
								},
								{
									key: '2',
									label: (
										<span onClick={() => buyFraction(guild.address, 1, guild.chain)}>
											Buy Fraction
										</span>
									),
									icon: <PlusCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: '0.875rem' }} />,
								},
								{
									key: '3',
									label: (
										<span onClick={() => sellFraction(guild.address, 1, guild.chain)}>
											Sell Fraction
										</span>
									),
									icon: (
										<MinusCircleTwoTone twoToneColor="#f81d22" style={{ fontSize: '0.875rem' }} />
									),
								},
							],
						}}
					>
						<div style={{ display: 'flex' }}>
							<div style={{ flex: 1 }} />
							<Button shape="circle" size="small" icon={<MoreOutlined />} />
						</div>
					</Dropdown>
				);
			},
		},
	];

	return (
		<>
			<div>
				<div className="px-4 mb-4">
					<Select placeholder="Select leader board" onChange={(value) => setSelectedShardsLeaderBoard(value)}>
						{shardsTechLeaderBoards?.map((leaderBoard: LeaderBoardType) => {
							return (
								<Select.Option key={leaderBoard._id} value={leaderBoard._id}>
									{leaderBoard.name}
								</Select.Option>
							);
						})}
					</Select>
				</div>
				{listShardsGuild?.length ? (
					<Table
						columns={shardsGuildsColumns}
						dataSource={listShardsGuild}
						rowKey={(record) => record.guild._id}
						pagination={false}
					/>
				) : null}
			</div>
			<Modal
				title="Slot Info"
				open={openBuySlotPrice}
				onOk={() => buyShardSlot()}
				onCancel={() => setOpenBuySlotPrice(false)}
			>
				<Space direction="vertical" size="large" className="mt-4">
					<Space align="center" size={'middle'} className="mb-4">
						{buySlotPrice?.guild?.avatar ? (
							<Avatar src={buySlotPrice?.guild?.avatar} size={48} shape="square" />
						) : (
							<Avatar size={48} shape="square" icon={<PictureFilled />} />
						)}
						<Space direction="vertical" style={{ gap: '0.25rem' }}>
							<Typography.Title className="my-0" level={4}>
								{buySlotPrice?.guild?.name}
							</Typography.Title>
							<Space>
								<Badge count={`Lv: ${buySlotPrice?.guild?.level || '--'}`} color="#1677ff" />
								<Badge count={`Rank: ${buySlotPrice?.guild?.rank || '--'}`} color="#52c41a" />
							</Space>
						</Space>
					</Space>
					<Space size={'small'} direction="vertical">
						<Typography.Text type="secondary">Seller</Typography.Text>
						<Typography.Text className="fw-semibold">{shortAddress(buySlotPrice?.seller)}</Typography.Text>
					</Space>
					<Space size={'small'} direction="vertical">
						<Typography.Text type="secondary">Price</Typography.Text>
						<Typography.Text className="fw-semibold">{buySlotPrice?.price} ETH</Typography.Text>
					</Space>
				</Space>
			</Modal>
		</>
	);
};

export default LeaderBoards;
