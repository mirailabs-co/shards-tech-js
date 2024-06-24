import { useContext, useEffect, useMemo, useState } from 'react';
import { HomeContext } from '../context';
import {
	Avatar,
	Badge,
	Button,
	Descriptions,
	Empty,
	Flex,
	FloatButton,
	Form,
	Input,
	InputNumber,
	Modal,
	Space,
	Table,
	Tabs,
	Typography,
} from 'antd';
import {
	CrownTwoTone,
	FireTwoTone,
	FormOutlined,
	MoreOutlined,
	PictureFilled,
	TagTwoTone,
	UserAddOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { parseGuildConfig, shortAddress } from '../app-utils';
import { TransactionGuild } from '../app-constants/type';
import HandleForm from '../shards-tech/_Form';
import FormUpdateGuild from '../shards-tech/FormUpdateGuild';
import ModalInvite from '../shards-tech/ModalInvite';
import React from 'react';

const { Paragraph } = Typography;

const MyGuild = () => {
	const { shardsTechCore } = useContext(HomeContext);
	console.log('shardsTechCore >>>', shardsTechCore);
	const [transactionHistoryOfGuild, setTransactionHistoryOfGuild] = useState<TransactionGuild[]>();
	const [handleFormVisible, setHandleFormVisible] = useState<boolean>(false);

	const [price, setPrice] = useState<number | null>(null);
	const [openSellSlotModal, setOpenSellSlotModal] = useState<boolean>(false);
	const [mySellSlot, setMySellSlot] = useState<any>(null);
	const [openChangeOwnerModal, setOpenChangeOwnerModal] = useState<boolean>(false);
	const [newOwner, setNewOwner] = useState<any>(null);
	const [openUpdateForm, setOpenUpdateForm] = useState<boolean>(false);
	const [openModalInvite, setOpenModalInvite] = useState<boolean>(false);

	const earningDistribution = useMemo(() => {
		let result = parseGuildConfig(
			shardsTechCore?.userGuild?.rewardShareForMembers,
			shardsTechCore?.userGuild?.guildOwnerShare,
		);

		result = {
			sharePercent: Math.round(result.sharePercent * 100),
			guildOwnerPercent: Math.round(result.guildOwnerPercent * 100),
			memberPercent: Math.round(result.memberPercent * 100),
		};

		return result;
	}, [shardsTechCore?.userGuild]);

	const getTransactionHistoryOfGuild = async () => {
		try {
			const response = await shardsTechCore.getTransactionHistoryOfGuild({
				page: 1,
				limit: 10,
			});
			if (response && response.data) {
				setTransactionHistoryOfGuild(response?.data);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const burnSlotShard = async (guildId: string) => {
		const response = await shardsTechCore.burnSlot(guildId);
		await shardsTechCore.getGuildOfUser();
	};

	const sellSlot = async (guildId: string, price: number | null) => {
		if (typeof price !== 'number') {
			return console.log('price is not a number');
		}
		const response = await shardsTechCore.sellSlot(guildId, price);
		await shardsTechCore.getGuildOfUser();
		//TODO: check when create component My Sell Slot
		const mySellSlot = await shardsTechCore.getMySellMemberSlot();
		setMySellSlot(mySellSlot);
	};

	const changeOwner = async (newOwner: string) => {
		const response = await shardsTechCore.changeGuildOwner(
			shardsTechCore.userGuild.address,
			newOwner,
			shardsTechCore.userInfo.userId,
		);
	};

	useEffect(() => {
		if (shardsTechCore) {
			getTransactionHistoryOfGuild();
		}
	}, [shardsTechCore]);

	const usersColumns = [
		{
			title: 'Address',
			dataIndex: 'address',
			key: 'address',
			render: (address: string) => {
				return (
					<Paragraph style={{ margin: 0 }} copyable={{ text: address }}>
						{shortAddress(address) || '--'}
					</Paragraph>
				);
			},
		},
		{
			title: 'UserId',
			dataIndex: 'userId',
			key: 'userId',
			render: (uId: string) => {
				return (
					<Paragraph style={{ margin: 0 }} copyable={{ text: uId }}>
						{shortAddress(uId) || '--'}
					</Paragraph>
				);
			},
		},
		{
			title: 'Shards Id',
			dataIndex: '_id',
			key: '_id',
			render: (id: string) => {
				return (
					<Paragraph style={{ margin: 0 }} copyable={{ text: id }}>
						{shortAddress(id) || '--'}
					</Paragraph>
				);
			},
		},
	];

	if (!shardsTechCore || !shardsTechCore.userGuild) {
		return (
			<>
				<Empty description="" className="p-4">
					<Flex vertical align="center" className="text-center">
						<Typography.Title className="mt-0" level={4}>
							You haven&apos;t joined any guild.
						</Typography.Title>
						<Typography.Paragraph type="secondary">
							Create a new guild or buy a slot from a guild that already exists on the system.
						</Typography.Paragraph>
						<Button type="primary" onClick={() => setHandleFormVisible(true)} style={{ marginTop: 8 }}>
							Create New Guild
						</Button>
					</Flex>
				</Empty>
				<HandleForm
					openHandleForm={handleFormVisible}
					setOpenHandleForm={setHandleFormVisible}
					shardsTechCore={shardsTechCore}
				/>
			</>
		);
	}

	return (
		<>
			<div className="px-4">
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					<Space align="center" size={'middle'} className="mb-4">
						{shardsTechCore.userGuild.metadata?.avatar ? (
							<Avatar src={shardsTechCore.userGuild.metadata?.avatar} size={64} shape="square" />
						) : (
							<Avatar icon={<PictureFilled />} size={64} shape="square" />
						)}
						<Space direction="vertical" style={{ gap: '0.25rem' }}>
							<Typography.Title className="my-0" level={4}>
								{shardsTechCore.userGuild.name}
							</Typography.Title>
							<Space>
								<Badge
									count={`Lv: ${shardsTechCore.userGuild.metadata?.level || '--'}`}
									color="#1677ff"
								/>
								<Badge
									count={`Rank: ${shardsTechCore.userGuild.metadata?.rank || '--'}`}
									color="#52c41a"
								/>
							</Space>
						</Space>
					</Space>
					{shardsTechCore?.userGuild?.owner?._id === shardsTechCore?.userInfo?._id ? (
						<Button type="default" icon={<UserAddOutlined />} onClick={() => setOpenModalInvite(true)}>
							Invite Member
						</Button>
					) : null}
				</div>
				<div style={{ marginBottom: '12px', fontWeight: 500 }}>
					Owner by{' '}
					<span style={{ fontWeight: 700 }}>{shortAddress(shardsTechCore?.userGuild?.owner?.address)}</span>
				</div>
				<Typography.Paragraph type="secondary">
					{shardsTechCore.userGuild.metadata?.description ? (
						shardsTechCore.userGuild.metadata?.description
					) : (
						<Typography.Text type="secondary">Guild Descriptions...</Typography.Text>
					)}
				</Typography.Paragraph>
				<Descriptions
					className="mb-4"
					title="Earning Distribution"
					items={[
						{
							key: '1',
							label: 'Guild Master',
							children: `${earningDistribution.guildOwnerPercent}%`,
						},
						{
							key: '2',
							label: 'Seat Owners',
							children: `${earningDistribution.memberPercent}%`,
						},
						{
							key: '3',
							label: 'Fraction Owners',
							children: `${earningDistribution.sharePercent}%`,
						},
					]}
				></Descriptions>
			</div>
			<FloatButton.Group trigger="click" type="primary" style={{ right: 24 }} icon={<MoreOutlined />}>
				<FloatButton
					tooltip={<div>Burn Slot</div>}
					icon={<FireTwoTone twoToneColor={'#FF9900'} />}
					onClick={() => burnSlotShard(shardsTechCore.userGuild._id)}
				/>
				<FloatButton
					tooltip={<div>Sell Slot</div>}
					icon={<TagTwoTone twoToneColor={'#f81d22'} />}
					onClick={() => setOpenSellSlotModal(true)}
				/>
				{shardsTechCore?.userGuild?.owner?._id === shardsTechCore?.userInfo?._id ? (
					<>
						<FloatButton
							tooltip={<div>Change Owner</div>}
							icon={<CrownTwoTone />}
							onClick={() => setOpenChangeOwnerModal(true)}
						/>
						<FloatButton
							tooltip={<div>Update Guild</div>}
							icon={<FormOutlined style={{ color: '#52c41a' }} />}
							onClick={() => setOpenUpdateForm(true)}
						/>
					</>
				) : null}
			</FloatButton.Group>
			<Tabs
				defaultActiveKey="1"
				type="card"
				items={[
					{
						key: '1',
						label: `${shardsTechCore.userGuild?.users?.length} Member`,
						children: shardsTechCore.userGuild?.users && (
							<Table
								columns={usersColumns}
								dataSource={shardsTechCore.userGuild?.users || []}
								rowKey={(record) => record._id}
								pagination={false}
								scroll={{ x: 'max-content' }}
								className="mb-4"
							/>
						),
					},
					{
						key: '2',
						label: 'Activity',
						children: transactionHistoryOfGuild && (
							<Space size={'large'} direction="vertical" className="mt-4">
								{transactionHistoryOfGuild?.map((item: any, i: number) => (
									<Space size={'middle'} key={i} className="px-4" align="start">
										<Avatar size={40} icon={<UserOutlined />} />
										<Space direction="vertical" style={{ gap: '0' }}>
											<Typography.Text className="fw-semibold">
												{`${item?.user?.address.slice(0, 6)}...${item?.user?.address.slice(
													-4,
												)}`}{' '}
												{item.type === 'buy_slot' || item.type === 'buy_share' ? (
													<Typography.Text type="success">Buy</Typography.Text>
												) : item.type === 'sell_slot' || item.type === 'sell_share' ? (
													<Typography.Text type="danger">Sell</Typography.Text>
												) : item.type === 'burn_slot' ? (
													<Typography.Text type="warning">Burn</Typography.Text>
												) : item.type === 'cancel_sell_slot' ? (
													'Cancel selling'
												) : (
													''
												)}{' '}
												{item.type == 'buy_share' || item.type == 'sell_share'
													? item.amount + ' Fractions'
													: 'a Slot'}{' '}
												of guild {item?.guild.name} by {item.price} ETH
											</Typography.Text>
											<Typography.Text type="secondary" style={{ fontSize: '11px' }}>
												{item.createdAt}
											</Typography.Text>
										</Space>
									</Space>
								))}
							</Space>
						),
					},
				]}
			/>
			<Modal
				title="Change Owner"
				open={openChangeOwnerModal}
				onOk={() => changeOwner(newOwner)}
				onCancel={() => setOpenChangeOwnerModal(false)}
			>
				<Form layout="vertical" autoComplete="off">
					<Form.Item name="name" label="Shards ID">
						<Input
							size="large"
							placeholder="Enter Shards ID"
							onChange={(e) => setNewOwner(e.target.value)}
							value={newOwner}
						/>
					</Form.Item>
				</Form>
			</Modal>
			<Modal
				title="Sell Slot"
				open={openSellSlotModal}
				onOk={() => sellSlot(shardsTechCore.userGuild._id, price)}
				onCancel={() => setOpenSellSlotModal(false)}
			>
				<Form layout="vertical" autoComplete="off">
					<Form.Item name="sellprice" label="Set price:">
						<InputNumber
							suffix="ETH"
							onChange={(value) => setPrice(value)}
							value={price}
							style={{ width: '100%' }}
							placeholder="0"
							size="large"
						/>
					</Form.Item>
				</Form>
			</Modal>
			<FormUpdateGuild
				openHandleForm={openUpdateForm}
				setOpenHandleForm={setOpenUpdateForm}
				shardsTechCore={shardsTechCore}
				data={{
					guildName: shardsTechCore.userGuild.name,
					slotPrice: shardsTechCore.userGuild?.slotPrice,
					guildMaster: earningDistribution.guildOwnerPercent,
					seatOwners: earningDistribution.memberPercent,
					fractionOwners: earningDistribution.sharePercent,
					requireJoinGuildRequest: shardsTechCore.userGuild?.requireJoinGuildRequest,
				}}
			/>
			<ModalInvite
				openHandleForm={openModalInvite}
				setOpenHandleForm={setOpenModalInvite}
				shardsTechCore={shardsTechCore}
			/>
		</>
	);
};

export default MyGuild;
