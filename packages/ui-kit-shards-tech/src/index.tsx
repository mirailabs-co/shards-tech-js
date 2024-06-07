import { ShardsTechCore } from '@mirailabs-co/shards-tech';
import {
    Button,
    Descriptions,
    Input,
    InputNumber,
    Modal,
    Select,
    Space,
    Table,
    Tabs,
} from 'antd';
import * as React from 'react';
import { useEffect, useState } from 'react';
import HandleForm from './shards-tech/_Form';
import ShardsTabChat from './shards-tech/_TabChat';

interface UIKitProps {
    accessToken: string;
    clientId: string;
    env?: string;
}
export default function Home(props: UIKitProps) {
  const { accessToken, clientId, env } = props;

  const [shardsTechCore, setShardsTechCore] = useState<any>(null);

  const [shardsTechConnected, setShardsTechConnected] = useState<any>(null);
  const [shardsTechLeaderBoards, setShardsTechLeaderBoards] =
    useState<any>(null);
  const [selectedShardsLeaderBoard, setSelectedShardsLeaderBoard] =
    useState<any>(null);
  const [listShards, setListShards] = useState<any>(null);
  const [myShards, setMyShards] = useState<any>(null);
  const [buySlotPrice, setBuySlotPrice] = useState<any>(null);
  const [openBuySlotPrice, setOpenBuySlotPrice] = useState<any>(null);
  const [mySellSlot, setMySellSlot] = useState<any>(null);

  const [price, setPrice] = useState<any>(null);
  const [updatePrice, setUpdatePrice] = useState<any>(null);

  const [newOwner, setNewOwner] = useState<any>(null);
  const [userOnlinesShards, setUserOnlinesShards] = useState<any>(null);

  const [handleFormVisible, setHandleFormVisible] = useState(false);
  const initShardsTechCore = async () => {
    const shardsTech = await ShardsTechCore.init({
      clientId,
      env: env || 'development',
    });
    setShardsTechCore(shardsTech);
  };

  useEffect(() => {
    initShardsTechCore();
  }, []);

  const connectShardsTech = async () => {
    const [core, shardsTechConnection] = await shardsTechCore.connect({
      accessToken,
    });
    setShardsTechConnected(shardsTechConnection);
    await shardsTechCore.getGuildOfUser();
    const data = await shardsTechCore.getMyFractions();
    setMyShards(data);

    const leaderBoards = await shardsTechCore.getLeaderBoards();
    setShardsTechLeaderBoards(leaderBoards);
    setSelectedShardsLeaderBoard(leaderBoards[0]._id);

    const mySellSlot = await shardsTechCore.getMySellMemberSlot();
    setMySellSlot(mySellSlot);

    const userOnlines = await shardsTechCore.getUserOnlineInGuild();
    setUserOnlinesShards(userOnlines);
  };

  useEffect(() => {
    if (shardsTechCore) {
      connectShardsTech();
    }
  }, [shardsTechCore]);

  const getShardsGuilds = async () => {
    if (!shardsTechConnected) {
      console.log('ShardsTech not connected');
      return;
    }
    const shards = await shardsTechCore.getGuildScores({
      leaderBoardId: selectedShardsLeaderBoard,
      page: 1,
      limit: 100,
      sort: 'desc',
    });
    setListShards(shards.data);
  };

  useEffect(() => {
    if (shardsTechLeaderBoards) {
      getShardsGuilds();
    }
  }, [shardsTechLeaderBoards]);

  const buyShardSlot = async () => {
    const response = await shardsTechCore.buySlot(
      buySlotPrice.guild.address,
      buySlotPrice.seller,
      buySlotPrice.price,
      buySlotPrice.guild.chain,
    );
    await shardsTechCore.getGuildOfUser();
    setOpenBuySlotPrice(false);
  };

  const getSlotPrice = async (guildId: string) => {
    const response = await shardsTechCore.getBuySlotPrice(guildId);
    setBuySlotPrice(response);
    setOpenBuySlotPrice(true);
  };

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

  const burnSlotShard = async (guildId: string) => {
    const response = await shardsTechCore.burnSlot(guildId);
    await shardsTechCore.getGuildOfUser();
  };

  const sellSlot = async (guildId: string, price: number) => {
    const response = await shardsTechCore.sellSlot(guildId, price);
    await shardsTechCore.getGuildOfUser();
    const mySellSlot = await shardsTechCore.getMySellMemberSlot();
    setMySellSlot(mySellSlot);
  };

  const buyFraction = async (
    guildAddress: string,
    amount: number,
    chain?: string,
  ) => {
    const response = await shardsTechCore.buyFraction(
      guildAddress,
      amount,
      chain,
    );
  };

  const sellFraction = async (
    guildAddress: string,
    amount: number,
    chain?: string,
  ) => {
    const response = await shardsTechCore.sellFraction(
      guildAddress,
      amount,
      chain,
    );
  };

  const changeOwner = async (newOwner: string) => {
    const response = await shardsTechCore.changeGuildOwner(
      shardsTechCore.userGuild.address,
      newOwner,
      shardsTechCore.userInfo.userId,
    );
  };

  const usersColumns = [
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'UserId',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: 'Shards Tech Id',
      dataIndex: '_id',
      key: '_id',
    },
  ];

  const shardsGuildsColumns = [
    {
      title: 'Rank',
      dataIndex: 'guild',
      key: 'rank',
      render: (guild: any, record: any, index: number) => {
        return guild?.metadata?.rank;
      },
    },
    {
      title: 'Guild',
      dataIndex: 'guild',
      key: 'guild',
      render: (guild: any) => {
        return guild.name;
      },
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
    },
    {
      title: 'Actions',
      dataIndex: 'guild',
      key: 'action',
      render: (guild: any) => {
        return (
          <Space>
            <Button onClick={() => getSlotPrice(guild._id)}>
              Get Slot Price
            </Button>
            <Button onClick={() => buyFraction(guild.address, 1, guild.chain)}>
              Buy Fraction
            </Button>
            <Button onClick={() => sellFraction(guild.address, 1, guild.chain)}>
              Sell Fraction
            </Button>
          </Space>
        );
      },
    },
  ];

  const shardItems = [
    {
      key: '1',
      label: 'LeaderBoards',
      children: (
        <div>
          <Select
            style={{ width: '60%' }}
            placeholder="Select leader board"
            onChange={(value) => setSelectedShardsLeaderBoard(value)}
          >
            {shardsTechLeaderBoards?.map((leaderBoard: any) => {
              return (
                <Select.Option key={leaderBoard._id} value={leaderBoard._id}>
                  {leaderBoard.name}
                </Select.Option>
              );
            })}
          </Select>
          {listShards && (
            <Table
              columns={shardsGuildsColumns}
              dataSource={listShards}
              rowKey={(record) => record.guild._id}
              pagination={false}
            />
          )}
        </div>
      ),
    },
    {
      key: '2',
      label: 'My Guild',
      children: shardsTechCore?.userGuild && (
        <div>
          {shardsTechCore.userGuild.name}
          <Descriptions
            title="Metadata"
            items={[
              {
                label: 'avatar',
                children: shardsTechCore.userGuild.metadata?.avatar,
              },
              {
                label: 'description',
                children: shardsTechCore.userGuild.metadata?.description,
              },
              {
                label: 'level',
                children: shardsTechCore.userGuild.metadata?.level,
              },
              {
                label: 'rank',
                children: shardsTechCore.userGuild.metadata?.rank,
              },
            ]}
          />
          <Table
            columns={usersColumns}
            dataSource={shardsTechCore.userGuild?.users || []}
            rowKey={(record) => record._id}
            pagination={false}
          />
          <Space>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                onChange={(e) => setNewOwner(e.target.value)}
                value={newOwner}
                // newOwner is Shards Tech Id of member who will be new owner
              />
              <Button type="primary" onClick={() => changeOwner(newOwner)}>
                Change Owner
              </Button>
            </Space.Compact>
            <Space.Compact style={{ width: '100%' }}>
              <InputNumber
                onChange={(value) => setPrice(value)}
                value={price}
              />
              <Button
                type="primary"
                onClick={() => sellSlot(shardsTechCore.userGuild._id, price)}
              >
                Sell Slot
              </Button>
            </Space.Compact>
            <Button
              onClick={() => burnSlotShard(shardsTechCore.userGuild._id)}
              danger
            >
              Burn Slot
            </Button>
          </Space>
        </div>
      ),
    },
    {
      key: '3',
      label: 'My Sell Slot',
      children: (
        <>
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
          <Space>
            <Space.Compact style={{ width: '100%' }}>
              <InputNumber
                onChange={(value) => setUpdatePrice(value)}
                value={updatePrice}
              />
              <Button
                type="primary"
                onClick={() => updatePriceSellSlot(mySellSlot._id, updatePrice)}
              >
                Update Price
              </Button>
            </Space.Compact>
            <Button onClick={() => cancelSellSlot(mySellSlot._id)} danger>
              Cancel Sell Slot
            </Button>
          </Space>
        </>
      ),
    },
    {
      key: '4',
      label: 'Chats',
      children: (
        <div>
          {userOnlinesShards?.length} user online
          <ShardsTabChat shardsTechCore={shardsTechCore} />
        </div>
      ),
    },
  ];

  return (
    <main>
      <Button
        type="primary"
        onClick={() => setHandleFormVisible(true)}
        style={{ marginBottom: 20 }}
      >
        Add New Guild
      </Button>
      {/* <Tabs defaultActiveKey="1" items={items} /> */}
      <Tabs defaultActiveKey="1" items={shardItems} />
      <HandleForm
        openHandleForm={handleFormVisible}
        setOpenHandleForm={setHandleFormVisible}
        shardsTechCore={shardsTechCore}
      />
      <Modal
        title="Buy Slot"
        open={openBuySlotPrice}
        onOk={() => buyShardSlot()}
        onCancel={() => setOpenBuySlotPrice(false)}
      >
        <Descriptions
          title="Slot"
          items={[
            {
              label: 'Guild',
              children: buySlotPrice?.guild?.name,
            },
            {
              label: 'seller',
              children: buySlotPrice?.seller,
            },
            {
              label: 'price',
              children: buySlotPrice?.price,
            },
          ]}
        />
      </Modal>
    </main>
  );
}
