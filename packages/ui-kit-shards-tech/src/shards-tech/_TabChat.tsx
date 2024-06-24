import { Form, Input, Button, List, Tag, Tooltip, Avatar } from 'antd';
import { Comment } from '@ant-design/compatible';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { shortAddress } from '../app-utils';
import React from 'react';

const Editor = ({ onChange, onSubmit, submitting, value }: any) => (
	<>
		<Form.Item className="mb-2">
			<Input.TextArea
				autoFocus
				rows={4}
				onChange={onChange}
				value={value}
				autoSize={{ minRows: 2, maxRows: 6 }}
				placeholder="Your Message..."
			/>
		</Form.Item>
		<Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary" block>
			Send Message
		</Button>
	</>
);

export default function TabChat(props: any) {
	const { shardsTechCore } = props;
	const [list, setList] = useState<any>([]);

	const [submitting, setSubmitting] = useState(false);
	const [value, setValue] = useState('');

	const handleSubmit = async () => {
		if (!value) return;

		setSubmitting(true);
		await shardsTechCore.sendMessage({ message: value });
		await getGuildChatHistory();

		setSubmitting(false);
		setValue('');
	};

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setValue(e.target.value);
	};

	const getGuildChatHistory = async () => {
		if (shardsTechCore) {
			const res = await shardsTechCore.getGuildChatHistory({
				page: 1,
				limit: 100,
			});
			setList(res);
		}
	};

	useEffect(() => {
		if (shardsTechCore.userGuild?.address) {
			getGuildChatHistory();
		}
	}, [shardsTechCore]);

	useEffect(() => {
		if (shardsTechCore) {
			const miraiConnection = shardsTechCore.getConnection();
			miraiConnection.on('newMessage', (message: any) => {
				console.log('newMessage1', message);
			});
		}
	}, [shardsTechCore]);

	return (
		<List
			className="comment-list"
			itemLayout="horizontal"
			dataSource={list?.data
				?.map((item: any) => {
					return {
						author: <>{shortAddress(item?.user?.address)}</>,
						content: <p>{item?.message}</p>,
						datetime: (
							<Tooltip title={moment(item.createdAt).format('HH:mm DD/MM/YYYY')}>
								<span>{moment(item.createdAt).fromNow()}</span>
							</Tooltip>
						),
					};
				})
				.reverse()}
			renderItem={(item: any) => (
				<li>
					<Comment
						avatar={<Avatar size={32} />}
						author={item?.author}
						content={item.content}
						datetime={item.datetime}
					/>
				</li>
			)}
			footer={
				<Comment
					content={
						<Editor onChange={handleChange} onSubmit={handleSubmit} submitting={submitting} value={value} />
					}
				/>
			}
		/>
	);
}
