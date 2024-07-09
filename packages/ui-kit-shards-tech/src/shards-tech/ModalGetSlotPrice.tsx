import { Avatar, Badge, Form, Modal, Space, Typography, message } from 'antd';
import { shortAddress } from '../app-utils';
import { PictureFilled } from '@ant-design/icons';
import { GuildSlotType } from '../app-constants/type';
import React from 'react';

interface FormUpdateGuildProps {
	openBuySlotPrice: boolean;
	setOpenBuySlotPrice: (visible: boolean) => void;
	shardsTechCore: any;
	buySlotPrice: GuildSlotType | undefined;
}

const ModalGetSlotPrice = ({
	openBuySlotPrice,
	setOpenBuySlotPrice,
	shardsTechCore,
	buySlotPrice,
}: FormUpdateGuildProps) => {
	if (!buySlotPrice) {
		return;
	}

	const onClose = () => {
		setOpenBuySlotPrice(false);
	};

	const buyShardSlot = async () => {
		await shardsTechCore.buySlot(
			buySlotPrice.guild.address,
			buySlotPrice.seller,
			buySlotPrice.price,
			buySlotPrice.guild.chain,
		);
		await shardsTechCore.getGuildOfUser();
		onClose();
	};

	return (
		<Modal
			title="Slot Info"
			open={openBuySlotPrice}
			onOk={() => buyShardSlot()}
			onCancel={onClose}
			okText="Buy Slot"
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
	);
};

export default ModalGetSlotPrice;
