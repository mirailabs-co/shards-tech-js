import { Connection } from '../connection/connection';
import { MiraiConnection } from '../connection/mirai-connection';
import { GameConfig } from '../constants/types';
import { NoAccessToken, SDKError } from '../errors';
import { GetHistoryChatDto, SendMessageDto } from '../transports/dtos/GuildChat.dtos';
import { GetGuildScoreDto } from '../transports/dtos/GuildScore.dtos';
import { Guilds } from '../transports/dtos/Guilds.dtos';
import { GetTransactionHistoryDto } from '../transports/dtos/TransactionHistoty.dto';
import { ShardsTechApi } from '../transports/http/http-shardstech';
import { parseUserInfoFromAccessToken } from '../utils/auth-util';
import { Core, ICore } from './core';
import queryString from 'query-string';

export class MiraiCore extends Core {
	connection: MiraiConnection;
	miraiUser: {
		sub: string;
		aud: string;
		accessToken: string;
	};
	userGuild: Guilds;
	gameConfig: GameConfig;
	userInfo: any;

	constructor(opts?: ICore) {
		super(opts);
	}

	static async init(opts?: ICore) {
		const core = new MiraiCore(opts);

		await core.initialize();

		return core;
	}

	public async reconnect({ accessToken }: { accessToken: string }): Promise<Connection> {
		return new Promise(async (resolve, reject) => {
			const [core, connection] = await this.connect({ accessToken, isReconnect: true });

			connection.on('approved', ({ topicId }) => {
				resolve(connection);
			});

			setTimeout(() => {
				resolve(null);
			}, 20000);
		});
	}

	public async connect({
		accessToken,
	}: {
		accessToken: string;
		isReconnect?: boolean;
	}): Promise<[MiraiCore, MiraiConnection]> {
		return new Promise(async (resolve, reject) => {
			if (!accessToken) {
				reject(
					new NoAccessToken(SDKError.NoConnection, 'Not found access token. Pleases connect MiraiID first'),
				);
			}

			const miraiInfo = await parseUserInfoFromAccessToken(accessToken);
			if (!miraiInfo) {
				reject(
					new NoAccessToken(SDKError.NoConnection, 'Not found access token. Pleases connect MiraiID first'),
				);
			}
			const { sub, aud } = miraiInfo;
			this.miraiUser = {
				sub,
				aud,
				accessToken,
			};
			const gameConfig = await ShardsTechApi.INSTANCE.getConfig(accessToken);
			this.gameConfig = gameConfig;
			this.emit('connecting');

			const newConnection = await MiraiConnection.init({});

			this.emit('connecting');
			const isConnected = await newConnection.connect({ accessToken });

			if (isConnected) {
				newConnection.on('disconnected', async () => {
					await newConnection.reset();
				});
			} else {
				reject(new Error('Connection failed'));
			}

			this.connection = newConnection;
			return resolve([this, newConnection] as [MiraiCore, MiraiConnection]);
		});
	}

	public async disconnect(connection: Connection): Promise<void> {
		if (connection) {
			try {
				await connection.disconnect();
			} catch (e: any) {
				throw new Error(e);
			}
		}
	}

	public getConnection() {
		return this.connection;
	}

	async initialize() {
		try {
			this.connection = null;
		} catch (e) {
			console.error(e);
		}
	}

	public async getGuildOfUser() {
		try {
			const data = await ShardsTechApi.INSTANCE.guildsModule.getGuilds(this.miraiUser.accessToken);
			this.userGuild = data;
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async userUpdateGuild(guildId: string, body: any) {
		try {
			const data = await ShardsTechApi.INSTANCE.guildsModule.userUpdateGuild(
				this.miraiUser.accessToken,
				guildId,
				body,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getLeaderBoards() {
		try {
			const data = await ShardsTechApi.INSTANCE.leaderBoardModule.getLeaderBoards(this.miraiUser.accessToken);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getGuildScores(query: GetGuildScoreDto) {
		try {
			const data = await ShardsTechApi.INSTANCE.guildScoreModule.getGuildScoreForLeaderBoard(
				this.miraiUser.accessToken,
				query,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	// Guild Share and Slot Information
	public async getMyShares() {
		try {
			const data = await ShardsTechApi.INSTANCE.userSharesGuildModule.getGuildUserHaveShare(
				this.miraiUser.accessToken,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getTotalShareOfGuild(guildId: string) {
		try {
			const data = await ShardsTechApi.INSTANCE.guildsModule.getShareOfGuild(this.miraiUser.accessToken, guildId);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getMyShareOfGuild(guildId: string) {
		try {
			const data = await ShardsTechApi.INSTANCE.guildsModule.getShareUserHaveInGuild(
				this.miraiUser.accessToken,
				guildId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getBuySlotPrice(guildId: string) {
		try {
			const data = await ShardsTechApi.INSTANCE.userSellGuildModule.getSlotPrice(
				this.miraiUser.accessToken,
				guildId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getBuySharePrice(guildId: string, amount: number) {
		try {
			const data = await ShardsTechApi.INSTANCE.guildsModule.getSharePrice(
				this.miraiUser.accessToken,
				guildId,
				amount,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getSellSharePrice(guildId: string, amount: number) {
		try {
			const data = await ShardsTechApi.INSTANCE.guildsModule.getSellPrice(
				this.miraiUser.accessToken,
				guildId,
				amount,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	// Transaction History
	public async getTransactionHistoryOfUser(query: GetTransactionHistoryDto) {
		try {
			const data = await ShardsTechApi.INSTANCE.transactionHistoryModule.getTransactionHistoryOfUser(
				this.miraiUser.accessToken,
				query,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getTransactionHistoryOfGuild(query: GetTransactionHistoryDto) {
		try {
			const data = await ShardsTechApi.INSTANCE.transactionHistoryModule.getTransactionHistoryOfGuild(
				this.miraiUser.accessToken,
				query,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	// Join Guild Request
	public async createJoinGuildRequest(guildId: string) {
		try {
			const data = await ShardsTechApi.INSTANCE.joinGuildRequestModule.createJoinGuildRequest(
				this.miraiUser.accessToken,
				guildId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getJoinGuildRequest(guildId: string) {
		try {
			const data = await ShardsTechApi.INSTANCE.joinGuildRequestModule.getJoinGuildRequest(
				this.miraiUser.accessToken,
				guildId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getJoinGuildOfUser() {
		try {
			const data = await ShardsTechApi.INSTANCE.joinGuildRequestModule.getJoinGuildOfUser(
				this.miraiUser.accessToken,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	// Guild Chat
	public async getGuildChatHistory(query: GetHistoryChatDto) {
		try {
			const data = await ShardsTechApi.INSTANCE.guildChatModule.getHistoryChat(this.miraiUser.accessToken, query);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getUserOnlineInGuild() {
		try {
			const data = await ShardsTechApi.INSTANCE.guildChatModule.getUserOnlineInGuild(this.miraiUser.accessToken);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	async sendMessage(body: SendMessageDto) {
		try {
			const data = await ShardsTechApi.INSTANCE.guildChatModule.sendMessage(this.miraiUser.accessToken, body);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	private async _createAction(type: string, params: Record<string, any>, metadata: Record<string, any>) {
		try {
			const action = await ShardsTechApi.INSTANCE.actionModule.createAction(
				this.miraiUser.accessToken,
				type,
				metadata,
			);
			const actionId = action._id;
			const miraiAppUrl = 'miraiapp://gsf/';
			const dappUrl = this.gameConfig.linkDapp;
			const page = type === 'create-guild' ? '' : type;
			const gameId = this.gameConfig.clientId;
			const paramObj = {
				...params,
				actionId,
				gameId,
			} as Record<string, any>;

			var ordered = {} as Record<string, any>;
			Object.keys(paramObj)
				.sort()
				.forEach(function (key) {
					ordered[key] = paramObj[key];
				});

			const query = queryString.stringify(ordered);
			const url = `${dappUrl}/${page}?${query}`;

			await ShardsTechApi.INSTANCE.actionModule.sendNotification(this.miraiUser.accessToken, url);
			while (true) {
				const action = await ShardsTechApi.INSTANCE.actionModule.getAction(
					this.miraiUser.accessToken,
					actionId,
				);
				if (action.status === 'success') {
					return action;
				}
				if (action.status === 'error') {
					throw new Error('Action failed');
				}
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
		} catch (e) {
			console.error(e);
		}
	}

	public async createGuild(
		name: string,
		slotPrice: number,
		txGuildOwnerShare: number,
		rewardShareForMembers: number,
		guildOwnerShare: number,
		metadata: Record<string, any>,
	) {
		const data = await this._createAction(
			'create-guild',
			{
				name,
				slotPrice,
				rewardShareForMembers,
				txGuildOwnerShare,
				guildOwnerShare,
			},
			metadata,
		);
		return data;
	}

	public async buySlot(guildAddress: string, seller: string, price: number) {
		const data = await this._createAction(
			'buy-slot',
			{
				guildAddress,
			},
			{
				guildAddress,
				seller,
				price,
			},
		);
		return data;
	}

	public async sellSlot(guildId: string, price: number) {
		try {
			const data = await ShardsTechApi.INSTANCE.memberModule.sellMemberSlot(
				this.miraiUser.accessToken,
				guildId,
				price,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async burnSlot(guildId: string) {
		try {
			const data = await ShardsTechApi.INSTANCE.memberModule.burnMemberSlot(this.miraiUser.accessToken, guildId);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async updateSellSlot(sellSlotId: string, price: number) {
		try {
			const data = await ShardsTechApi.INSTANCE.memberModule.updateSellMemberSlot(
				this.miraiUser.accessToken,
				sellSlotId,
				price,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async cancelSellSlot(sellSlotId: string) {
		try {
			const data = await ShardsTechApi.INSTANCE.memberModule.cancelSellMemberSlot(
				this.miraiUser.accessToken,
				sellSlotId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getMySellMemberSlot() {
		try {
			const data = await ShardsTechApi.INSTANCE.userSellGuildModule.getMySellMemberSlot(
				this.miraiUser.accessToken,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async buyShare(guildAddress: string, amount: number) {
		const data = await this._createAction(
			'buy-share',
			{
				guildAddress,
				amount,
			},
			{},
		);
		return data;
	}

	public async sellShare(guildAddress: string, amount: number) {
		const data = await this._createAction(
			'sell-share',
			{
				guildAddress,
				amount,
			},
			{},
		);
		return data;
	}

	public async linkAddress() {
		const data = await this._createAction(
			'link-address',
			{
				userId: this.miraiUser.sub,
			},
			{
				userId: this.miraiUser.sub,
			},
		);
		return data;
	}

	public async disbandGuild(guildAddress: string) {
		const data = await this._createAction(
			'disband-guild',
			{
				guildAddress,
			},
			{},
		);
		return data;
	}
}
