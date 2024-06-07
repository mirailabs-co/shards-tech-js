import { Button, Form, Input, Modal, Select, message } from 'antd';
import * as React from 'react';

interface HandleFormProps {
  openHandleForm: boolean;
  setOpenHandleForm: (visible: boolean) => void;
  shardsTechCore: any;
}

const HandleForm = ({
  openHandleForm,
  setOpenHandleForm,
  shardsTechCore,
}: HandleFormProps) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: any) => {
    console.log('Received values of form: ', values);
    const data = {
      name: values.guildName,
      slotPrice: values.slotPrice,
      rewardShareForMembers: Number(values.rewardShareForMembers),
      guildOwnerShare: Number(values.guildOwnerShare),
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
    messageApi.success('Create guild success');
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
        <Form.Item
          label="Chain"
          name="chain"
          rules={[{ required: true, message: 'Please select chain!' }]}
        >
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
          label="Reward Share For Members"
          name="rewardShareForMembers"
          rules={[
            {
              required: true,
              message: 'Please input Reward Share For Members!',
            },
            {
              pattern: /[+-]?([0-9]*[.])?[0-9]+/,
              message: 'Please input valid number!',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Guild Owner Share"
          name="guildOwnerShare"
          rules={[
            {
              required: true,
              message: 'Please input!',
            },
            {
              pattern: /[+-]?([0-9]*[.])?[0-9]+/,
              message: 'Please input valid number!',
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Modal>
    </Form>
  );
};

export default HandleForm;
