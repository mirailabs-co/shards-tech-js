import React from 'react';
import { PictureFilled } from '@ant-design/icons';
import { Avatar, Space, Typography } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { HomeContext } from '../context';

const MyHistory = () => {
	const { shardsTechCore } = useContext(HomeContext);
	const [transactionHistoryOfUser, setTransactionHistoryOfUser] = useState<any[]>([]);

	const getTransactionHistory = async () => {
		try {
			const transactionHistoryOfUser = await shardsTechCore.getTransactionHistoryOfUser({
				page: 1,
				limit: 10,
			});

			setTransactionHistoryOfUser(transactionHistoryOfUser?.data);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (shardsTechCore) {
			getTransactionHistory();
		}
	}, [shardsTechCore]);

	if (!transactionHistoryOfUser || !transactionHistoryOfUser.length) {
		return null;
	}

	return (
		<div>
			<Typography.Title level={5} className="mt-0 mb-4 px-4">
				{transactionHistoryOfUser?.length} Activities
			</Typography.Title>
			<Space size={'large'} direction="vertical">
				{transactionHistoryOfUser?.map((item: any, i: number) => (
					<Space size={'middle'} key={i} className="px-4" align="start">
						<Avatar size={40} shape="square" icon={<PictureFilled />} />
						<Space direction="vertical" style={{ gap: '0' }}>
							<Typography.Text className="fw-semibold">
								You{' '}
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
		</div>
	);
};

export default MyHistory;
