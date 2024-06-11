import { Button, Empty, Space, Table } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { HomeContext } from '../context';
import React from 'react';

const JoinGuildRequest = () => {
	const { shardsTechCore } = useContext(HomeContext);

	const [joinGuildRequestOfGuild, setJoinGuildRequestOfGuild] = useState<any[]>();
	const [isOwner, setIsOwner] = useState<any>(false);

	const getListResquest = async () => {
		try {
			const joinGuildRequestOfGuild = shardsTechCore?.userGuild?._id
				? await shardsTechCore.getJoinGuildRequest(shardsTechCore.userGuild._id)
				: [];
			setJoinGuildRequestOfGuild(joinGuildRequestOfGuild);
			const isOwner = shardsTechCore?.userGuild?.owner?._id === shardsTechCore?.userInfo?._id;
			setIsOwner(isOwner);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (shardsTechCore) {
			getListResquest();
		}
	}, [shardsTechCore]);

	const joinGuildRequestColumns = [
		{
			title: 'User',
			dataIndex: 'userId',
			key: 'userId',
			//   render: (user: any) => {
			//     return user && user.userId;
			//   },
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
				const isPending = status === 'pending';
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

	if (!isOwner || !joinGuildRequestOfGuild || !joinGuildRequestOfGuild.length) {
		return <Empty />;
	}

	return (
		<div>
			<Table
				columns={joinGuildRequestColumns}
				dataSource={joinGuildRequestOfGuild || []}
				rowKey={(record) => record?._id}
				pagination={false}
			/>
		</div>
	);
};

export default JoinGuildRequest;
