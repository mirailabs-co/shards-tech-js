import { Form, Input, Modal, Select, message } from 'antd';
import * as React from 'react';
import { calcGuildConfig } from '../app-utils';

interface HandleFormProps {
	openHandleForm: boolean;
	setOpenHandleForm: (visible: boolean) => void;
	shardsTechCore: any;
}

const HandleForm = ({ openHandleForm, setOpenHandleForm, shardsTechCore }: HandleFormProps) => {
	const [form] = Form.useForm();
	const [messageApi, contextHolder] = message.useMessage();

	const onFinish = async (values: any) => {
		try {
			const guildConfig = calcGuildConfig(Number(values.seatOwners / 100), Number(values.guildMaster / 100));
			const data = {
				name: values.guildName,
				slotPrice: values.slotPrice,
				rewardShareForMembers: guildConfig.rewardShareForMember,
				guildOwnerShare: guildConfig.guildOwnerShare,
				txGuildOwnerShare: 0.9,
			};
			const res = await shardsTechCore.createGuild(
				data.name,
				data.slotPrice,
				data.rewardShareForMembers,
				data.guildOwnerShare,
				data.txGuildOwnerShare,
				{},
				values.chain,
			);
			if (!res) {
				throw new Error('Create guild fail');
			}
			messageApi.open({
				content: 'Create guild success',
				type: 'success',
				style: {
					color: '#52c41a',
				},
			});
			setOpenHandleForm(false);
		} catch (error) {
			console.log(error);
			messageApi.open({
				content: 'Create guild fail',
				type: 'error',
				style: {
					color: '#FF4D4F',
				},
			});
		}
	};

	const handleMyFieldChange = () => {
		const guildMaster = form.getFieldValue('guildMaster');
		const seatOwners = form.getFieldValue('seatOwners');
		form.setFieldsValue({
			fractionOwners: 100 - (guildMaster || 0) - (seatOwners || 0),
		});
	};

	return (
		<Form form={form} onFinish={onFinish}>
			{contextHolder}
			<Modal
				open={openHandleForm}
				onCancel={() => {
					form.resetFields();
					setOpenHandleForm(false);
				}}
				title={'Add New Guild'}
				onOk={() => form.submit()}
			>
				<Form.Item label="Chain" name="chain" rules={[{ required: true, message: 'Please select chain!' }]}>
					<Select>
						{shardsTechCore?.gameConfig?.chains.map((chain: any) => (
							<Select.Option value={chain._id} key={chain._id}>
								{chain.name}
							</Select.Option>
						))}
					</Select>
				</Form.Item>
				<Form.Item
					label="Guild Name"
					name="guildName"
					rules={[{ required: true, message: 'Please input Guild Name!' }]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					label="Slot Price"
					name="slotPrice"
					rules={[
						{ required: true, message: 'Please input Slot Price!' },
						{
							pattern: /[+-]?([0-9]*[.])?[0-9]+/,
							message: 'Please input valid number!',
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					label="Guild Master"
					name="guildMaster"
					rules={[
						{
							required: true,
							message: 'Please input guild master!',
						},
						{
							type: 'number',
							max: 100,
							message: 'Guild Master must be less than or equal to 100%',
							transform: (value) => Number(value), // Ensure the value is transformed to a number
						},
						{
							type: 'number',
							min: 0,
							message: 'Guild Master must be greater than or equal to 0',
							transform: (value) => Number(value), // Ensure the value is transformed to a number
						},
					]}
				>
					<Input type="Number" suffix={<div>%</div>} onChange={handleMyFieldChange} />
				</Form.Item>
				<Form.Item
					label="Seat Owners"
					name="seatOwners"
					rules={[
						{
							required: true,
							message: 'Please input!',
						},
						{
							type: 'number',
							max: 100,
							message: 'Seat Owners must be less than or equal to 100%',
							transform: (value) => Number(value), // Ensure the value is transformed to a number
						},
						{
							type: 'number',
							min: 0,
							message: 'Seat Owners must be greater than or equal to 0',
							transform: (value) => Number(value), // Ensure the value is transformed to a number
						},
					]}
				>
					<Input type="Number" suffix={<div>%</div>} onChange={handleMyFieldChange} />
				</Form.Item>
				<Form.Item
					name="fractionOwners"
					label="Fraction Owners"
					rules={[
						{
							required: true,
							message: 'Please input!',
						},
						{
							type: 'number',
							max: 100,
							message: 'Fraction Owners must be less than or equal to 100%',
							transform: (value) => Number(value), // Ensure the value is transformed to a number
						},
						{
							type: 'number',
							min: 0,
							message: 'Fraction Owners must be greater than or equal to 0',
							transform: (value) => Number(value), // Ensure the value is transformed to a number
						},
					]}
				>
					<Input type="Number" disabled suffix={<div>%</div>} />
				</Form.Item>
			</Modal>
		</Form>
	);
};

export default HandleForm;
