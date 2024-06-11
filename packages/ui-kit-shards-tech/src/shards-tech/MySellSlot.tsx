import React from 'react';
import { Button, Descriptions, InputNumber, Space } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { HomeContext } from '../context';

const MySellSlot = () => {
	const { shardsTechCore } = useContext(HomeContext);
	const [mySellSlot, setMySellSlot] = useState<any>(null);
	const [updatePrice, setUpdatePrice] = useState<any>(null);

	const getMySellSlot = async () => {
		try {
			const response = await shardsTechCore.getMySellMemberSlot();
			setMySellSlot(response);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (shardsTechCore) {
			getMySellSlot();
		}
	}, [shardsTechCore]);

	const updatePriceSellSlot = async (sellSlotId: string, price: number) => {
		const response = await shardsTechCore.updateSellSlot(sellSlotId, price);
		await shardsTechCore.getGuildOfUser();
		const mySellSlot = await shardsTechCore.getMySellMemberSlot();
		setMySellSlot(mySellSlot);
		setUpdatePrice(null);
	};

	const cancelSellSlot = async (sellSlotId: string) => {
		const response = await shardsTechCore.cancelSellSlot(sellSlotId);
		await shardsTechCore.getGuildOfUser();
		const mySellSlot = await shardsTechCore.getMySellMemberSlot();
		setMySellSlot(mySellSlot);
	};

	return (
		<div className="px-4">
			<Descriptions
				title="Slot"
				items={[
					{
						label: 'Guild',
						children: mySellSlot?.guild?.name,
					},
					{
						label: 'seller',
						children: mySellSlot?.seller,
					},
					{
						label: 'price',
						children: mySellSlot?.price,
					},
				]}
			/>
			<div className="mb-4">
				<Space.Compact style={{ width: '100%' }}>
					<InputNumber
						onChange={(value) => setUpdatePrice(value)}
						value={updatePrice}
						style={{ flexGrow: 1 }}
					/>
					<Button type="primary" onClick={() => updatePriceSellSlot(mySellSlot._id, updatePrice)}>
						Update Price
					</Button>
				</Space.Compact>
			</div>
			<Button onClick={() => cancelSellSlot(mySellSlot._id)} danger block>
				Cancel Sell Slot
			</Button>
		</div>
	);
};

export default MySellSlot;
