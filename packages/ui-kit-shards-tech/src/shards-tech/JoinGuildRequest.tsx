import { Button, Empty, message, Space, Spin, Table, Tabs } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { HomeContext } from '../context';
import { LoadingOutlined } from '@ant-design/icons';
import { GuildSlotType } from '../app-constants/type';
import React from 'react';
import ModalGetSlotPrice from './ModalGetSlotPrice';

const JoinGuildRequest = () => {
	const { shardsTechCore } = useContext(HomeContext);

	const [joinGuildRequestOfGuild, setJoinGuildRequestOfGuild] = useState<any[]>();
	const [listInvitation, setListInvitation] = useState<any[]>([]);
	const [openBuySlotPrice, setOpenBuySlotPrice] = useState<boolean>(false);
	const [buySlotPrice, setBuySlotPrice] = useState<GuildSlotType>();
	const [loading, setLoading] = useState<boolean>(false);
	const [loadingReject, setLoadingReject] = useState<boolean>(false);

	const [messageApi, contextHolder] = message.useMessage();

	const getListRequest = async () => {
		try {
			if (!shardsTechCore?.userGuild) {
				const res = await shardsTechCore?.getJoinGuildOfUser();
				setListInvitation(res?.filter((item: any) => item?.metadata?.type === 'invite'));
				setJoinGuildRequestOfGuild(res?.filter((item: any) => item?.metadata?.type !== 'invite'));
			} else {
				const joinGuildRequestOfGuild = shardsTechCore?.userGuild?._id
					? await shardsTechCore.getJoinGuildRequest(shardsTechCore.userGuild._id)
					: [];
				setJoinGuildRequestOfGuild(joinGuildRequestOfGuild);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const rejectInvite = async (guildId: string) => {
		try {
			setLoadingReject(true);
			const res = await shardsTechCore.rejectInvite(guildId);
			if (!res) {
				throw new Error('Reject invite fail');
			}
			messageApi.open({
				content: 'Reject invite success',
				type: 'success',
				style: {
					color: '#52c41a',
				},
			});
			await getListRequest();
		} catch (error) {
			console.log(error);
			messageApi.open({
				content: 'Reject invite fail',
				type: 'error',
				style: {
					color: '#FF4D4F',
				},
			});
		} finally {
			setLoadingReject(false);
		}
	};

	const getSlotPrice = async (guildId: string) => {
		try {
			setLoading(true);
			const response = await shardsTechCore.getBuySlotPrice(guildId);
			setBuySlotPrice(response);
			setOpenBuySlotPrice(true);
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (shardsTechCore) {
			getListRequest();
		}
	}, [shardsTechCore]);

	const joinGuildRequestColumns = [
		{
			title: 'User',
			dataIndex: 'userId',
			key: 'userId',
		},
		{
			title: 'Guild Name',
			dataIndex: 'guildRecord',
			key: 'guildName',
			render: (guildRecord: any, record: any) => {
				return guildRecord?.name;
			},
		},
		{
			title: 'Guild Owner',
			dataIndex: 'guildRecord',
			key: 'guildOwner',
			render: (guildRecord: any, record: any) => {
				return guildRecord?.owner;
			},
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
		},
		{
			title: 'Actions',
			dataIndex: 'status',
			key: 'action',
			render: (status: any, record: any) => {
				const isAccepted = status === 'accepted';
				const isRejected = status === 'rejected';

				if (
					!shardsTechCore?.userGuild ||
					shardsTechCore?.userGuild?.owner?._id !== shardsTechCore?.userInfo?._id
				) {
					return null;
				}
				if (isAccepted) {
					return <Button disabled>Accepted</Button>;
				}
				if (isRejected) {
					return <Button disabled>Rejected</Button>;
				}
				return (
					<Space>
						<Button onClick={() => shardsTechCore.acceptJoinGuildRequest(record.userId, record.guild)}>
							Accept
						</Button>
						<Button onClick={() => shardsTechCore.rejectJoinGuildRequest(record.userId, record.guild)}>
							Reject
						</Button>
					</Space>
				);
			},
		},
	];

	const listInvitationColumns = [
		{
			title: 'User',
			dataIndex: 'userId',
			key: 'userId',
		},
		{
			title: 'Guild Name',
			dataIndex: 'guildRecord',
			key: 'guildName',
			render: (guildRecord: any, record: any) => {
				return guildRecord?.name;
			},
		},
		{
			title: 'Guild Owner',
			dataIndex: 'guildRecord',
			key: 'guildOwner',
			render: (guildRecord: any, record: any) => {
				return guildRecord?.owner;
			},
		},
		{
			title: 'Actions',
			dataIndex: 'status',
			key: 'action',
			render: (_: any, record: any) => {
				return (
					<div style={{ display: 'flex', gap: 16 }}>
						{loading ? (
							<Button style={{ minWidth: '80px' }} onClick={() => {}}>
								<Spin indicator={<LoadingOutlined spin />} />
							</Button>
						) : (
							<Button
								style={{ minWidth: '80px' }}
								onClick={() => getSlotPrice(record.guild)}
								type="primary"
								ghost
							>
								Accept
							</Button>
						)}
						{loadingReject ? (
							<Button style={{ minWidth: '80px' }} onClick={() => {}}>
								<Spin indicator={<LoadingOutlined spin />} />
							</Button>
						) : (
							<Button
								style={{ minWidth: '80px' }}
								onClick={() => rejectInvite(record.guild)}
								type="primary"
								ghost
								danger
							>
								Reject
							</Button>
						)}
					</div>
				);
			},
		},
	];

	if (shardsTechCore?.userGuild && shardsTechCore.userGuild?.owner?._id === shardsTechCore?.userInfo?._id) {
		if (!joinGuildRequestOfGuild?.length) {
			return <Empty />;
		}
		return (
			<Table
				columns={joinGuildRequestColumns}
				dataSource={joinGuildRequestOfGuild || []}
				rowKey={(record) => record?._id}
				pagination={false}
			/>
		);
	}

	return (
		<>
			{contextHolder}
			<Tabs
				defaultActiveKey="1"
				type="card"
				items={[
					{
						key: '1',
						label: 'Request',
						children: joinGuildRequestOfGuild?.length ? (
							<Table
								columns={joinGuildRequestColumns}
								dataSource={joinGuildRequestOfGuild || []}
								rowKey={(record) => record?._id}
								pagination={false}
							/>
						) : (
							<Empty />
						),
					},
					{
						key: '2',
						label: 'Invited',
						children: listInvitation?.length ? (
							<Table
								columns={listInvitationColumns}
								dataSource={listInvitation || []}
								rowKey={(record) => record?._id}
								pagination={false}
							/>
						) : (
							<Empty />
						),
					},
				]}
			/>
			<ModalGetSlotPrice
				openBuySlotPrice={openBuySlotPrice}
				setOpenBuySlotPrice={setOpenBuySlotPrice}
				shardsTechCore={shardsTechCore}
				buySlotPrice={buySlotPrice}
			/>
		</>
	);
};

export default JoinGuildRequest;
