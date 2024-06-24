import { Form, Input, Modal, message } from 'antd';
import moment from 'moment';
import React from 'react';

interface FormUpdateGuildProps {
	openHandleForm: boolean;
	setOpenHandleForm: (visible: boolean) => void;
	shardsTechCore: any;
}

const ModalInvite = ({ openHandleForm, setOpenHandleForm, shardsTechCore }: FormUpdateGuildProps) => {
	const [form] = Form.useForm();
	const [messageApi, contextHolder] = message.useMessage();
	// const [loading, setLoading] = useState<boolean>(false)

	const onClose = () => {
		form.resetFields();
		setOpenHandleForm(false);
	};

	const onFinish = async (values: any) => {
		try {
			const res = await shardsTechCore?.inviteUser(values.userId, shardsTechCore?.userGuild?._id);
			if (!res) {
				throw new Error('Invite member fail');
			}
			messageApi.open({
				content: 'Invite member success',
				type: 'success',
				style: {
					color: '#52c41a',
				},
			});
			onClose();
		} catch (error) {
			console.log(error);
			messageApi.open({
				content: 'Invite member fail',
				type: 'error',
				style: {
					color: '#FF4D4F',
				},
			});
		}
	};

	return (
		<Form
			form={form}
			onFinish={onFinish}
			labelCol={{ span: 4 }}
			wrapperCol={{ span: 20 }}
			labelWrap
			labelAlign="left"
		>
			{contextHolder}
			<Modal
				open={openHandleForm}
				onCancel={onClose}
				title={'Invite Member'}
				onOk={() => form.submit()}
				width={620}
				okText={'Invite'}
			>
				<Form.Item label="User ID" name="userId" rules={[{ required: true, message: 'Please input user ID!' }]}>
					<Input />
				</Form.Item>
			</Modal>
		</Form>
	);
};

export default ModalInvite;
