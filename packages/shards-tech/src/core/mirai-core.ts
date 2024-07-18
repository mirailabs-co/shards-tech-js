import { Connection } from '../connection/connection';
import { MiraiConnection } from '../connection/mirai-connection';
import { GameConfig } from '../constants/types';
import { NoAccessToken, SDKError } from '../errors';
import { GetHistoryChatDto, SendMessageDto } from '../transports/dtos/GuildChat.dtos';
import { GetGuildScoreDto } from '../transports/dtos/GuildScore.dtos';
import { Guilds, UserUpdateGuildInput } from '../transports/dtos/Guilds.dtos';
import { GetTransactionHistoryDto } from '../transports/dtos/TransactionHistoty.dto';
import { ShardsTechApi } from '../transports/http/http-shardstech';
import { Core, ICore } from './core';
import queryString from 'query-string';

export class MiraiCore extends Core {
	connection: MiraiConnection;
	userGuild: Guilds;
	gameConfig: GameConfig;
	userInfo: any;
	accessToken: string;
	env: any;
	INSTANCE: ShardsTechApi;

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
				reject(new NoAccessToken(SDKError.NoConnection, 'Not found access token.'));
			}
			this.accessToken = accessToken;

			this.INSTANCE = new ShardsTechApi(this.env);

			const gameConfig = await this.INSTANCE.getConfig(accessToken, this.clientId);
			this.gameConfig = gameConfig;
			this.emit('connecting');

			const userInfo = await this.INSTANCE.usersModule.getUser(accessToken, this.clientId);
			this.userInfo = userInfo;

			const newConnection = await MiraiConnection.init({
				accessToken,
				clientId: this.clientId,
				env: this.env,
			});

			this.emit('connecting');
			const isConnected = await newConnection.connect({ accessToken, clientId: this.clientId });

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
			const data = await this.INSTANCE.guildsModule.getGuilds(
				this.accessToken,
				this.gameConfig.clientId,
			);
			this.userGuild = data;
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async userUpdateGuild(guildId: string, body: UserUpdateGuildInput) {
		try {
			const data = await this.INSTANCE.guildsModule.userUpdateGuild(
				this.accessToken,
				guildId,
				body,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getLeaderBoards() {
		try {
			const data = await this.INSTANCE.leaderBoardModule.getLeaderBoards(
				this.accessToken,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getGuildScores(query: GetGuildScoreDto) {
		try {
			const data = await this.INSTANCE.guildScoreModule.getGuildScoreForLeaderBoard(
				this.accessToken,
				query,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	// Guild Fraction and Slot Information
	public async getMyFractions() {
		try {
			const data = await this.INSTANCE.userSharesGuildModule.getGuildUserHaveShare(
				this.accessToken,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getTotalFractionOfGuild(guildId: string) {
		try {
			const data = await this.INSTANCE.guildsModule.getShareOfGuild(
				this.accessToken,
				guildId,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getMyFractionOfGuild(guildId: string) {
		try {
			const data = await this.INSTANCE.guildsModule.getShareUserHaveInGuild(
				this.accessToken,
				guildId,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getBuySlotPrice(guildId: string) {
		try {
			const data = await this.INSTANCE.userSellGuildModule.getSlotPrice(
				this.accessToken,
				guildId,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getBuyFractionPrice(guildId: string, amount: number) {
		try {
			const data = await this.INSTANCE.guildsModule.getSharePrice(
				this.accessToken,
				guildId,
				amount,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getSellFractionPrice(guildId: string, amount: number) {
		try {
			const data = await this.INSTANCE.guildsModule.getSellPrice(
				this.accessToken,
				guildId,
				amount,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	// Transaction History
	public async getTransactionHistoryOfUser(query: GetTransactionHistoryDto) {
		try {
			const data = await this.INSTANCE.transactionHistoryModule.getTransactionHistoryOfUser(
				this.accessToken,
				query,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getTransactionHistoryOfGuild(query: GetTransactionHistoryDto) {
		try {
			const data = await this.INSTANCE.transactionHistoryModule.getTransactionHistoryOfGuild(
				this.accessToken,
				query,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	// Join Guild Request
	public async createJoinGuildRequest(guildId: string) {
		try {
			const data = await this.INSTANCE.joinGuildRequestModule.createJoinGuildRequest(
				this.accessToken,
				guildId,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getJoinGuildRequest(guildId: string) {
		try {
			const data = await this.INSTANCE.joinGuildRequestModule.getJoinGuildRequest(
				this.accessToken,
				guildId,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getJoinGuildOfUser() {
		try {
			const data = await this.INSTANCE.joinGuildRequestModule.getJoinGuildOfUser(
				this.accessToken,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async acceptJoinGuildRequest(userId: string, guildId: string) {
		try {
			const data = await this.INSTANCE.joinGuildRequestModule.acceptJoinGuildRequest(
				this.accessToken,
				userId,
				guildId,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async rejectJoinGuildRequest(userId: string, guildId: string) {
		try {
			const data = await this.INSTANCE.joinGuildRequestModule.rejectJoinGuildRequest(
				this.accessToken,
				userId,
				guildId,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async inviteUser(userId: string, guildId: string) {
		try {
			const data = await this.INSTANCE.joinGuildRequestModule.inviteUser(
				this.accessToken,
				userId,
				guildId,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async rejectInvite(guildId: string) {
		try {
			const data = await this.INSTANCE.joinGuildRequestModule.rejectInvite(
				this.accessToken,
				guildId,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async acceptInvite(guildId: string) {
		try {
			const data = await this.INSTANCE.joinGuildRequestModule.acceptInvite(
				this.accessToken,
				guildId,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	// Guild Chat
	public async getGuildChatHistory(query: GetHistoryChatDto) {
		try {
			const data = await this.INSTANCE.guildChatModule.getHistoryChat(
				this.accessToken,
				query,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getUserOnlineInGuild() {
		try {
			const data = await this.INSTANCE.guildChatModule.getUserOnlineInGuild(
				this.accessToken,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	async sendMessage(body: SendMessageDto) {
		try {
			const data = await this.INSTANCE.guildChatModule.sendMessage(
				this.accessToken,
				body,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	private async _createAction(type: string, params: Record<string, any>, metadata: Record<string, any>, chain?: string) {
		try {
			const action = await this.INSTANCE.actionModule.createAction(
				this.accessToken,
				type,
				metadata,
				this.gameConfig.clientId,
				chain,
			);
			const actionId = action._id;
			const miraiAppUrl = 'miraiapp://gsf/';
			const dappUrl = this.gameConfig.linkDapp;
			const page = type === 'create-guild' ? '' : type;
			const gameId = this.gameConfig.clientId;
			const callBack = this.gameConfig.callBack;
			const paramObj = {
				...params,
				actionId,
				gameId,
				callBack,
			} as Record<string, any>;

			var ordered = {} as Record<string, any>;
			Object.keys(paramObj)
				.sort()
				.forEach(function (key) {
					ordered[key] = paramObj[key];
				});

			if (this.userInfo?.address && !this.gameConfig?.supportWebBrowser) {
				paramObj.address = this.userInfo.address;
				const hash = await this.INSTANCE.actionModule.generateHash(
					this.accessToken,
					paramObj,
					this.gameConfig.clientId,
				);
				ordered.hash = hash;
			}

			const query = queryString.stringify(ordered);
			const url = `${dappUrl}/${page}?${query}`;

			if (this.gameConfig?.supportWebBrowser) {
				if (typeof window !== 'undefined') {
					window?.open(url, '_blank');
				} else {
					throw new Error('Cannot open browser');
				}
			} else {
				if (this.userInfo?.address) {
					await this.INSTANCE.actionModule.sendNotification(
						this.accessToken,
						url,
						this.gameConfig.clientId,
					);
				} else {
					if (typeof window !== 'undefined') {
						const redirectUrl = `https://go.miraiapp.io/gsf/${encodeURIComponent(url)}`;
						window?.open(redirectUrl, '_blank');
					} else {
						throw new Error('Cannot open browser');
					}
				}
			}
			while (true) {
				const action = await this.INSTANCE.actionModule.getAction(
					this.accessToken,
					actionId,
					this.gameConfig.clientId,
				);
				if (action.status === 'success') {
					return action;
				}
				if (action.status === 'error') {
					throw new Error('Action failed');
				}
				await new Promise((resolve) => setTimeout(resolve, 3000));
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
		chain?: string,
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
			chain,
		);
		return data;
	}

	public async buySlot(guildAddress: string, seller: string, price: number, chain?: string) {
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
			chain,
		);
		return data;
	}

	public async sellSlot(guildId: string, price: number) {
		try {
			const data = await this.INSTANCE.memberModule.sellMemberSlot(
				this.accessToken,
				guildId,
				price,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async burnSlot(guildId: string) {
		try {
			const data = await this.INSTANCE.memberModule.burnMemberSlot(
				this.accessToken,
				guildId,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async updateSellSlot(sellSlotId: string, price: number) {
		try {
			const data = await this.INSTANCE.memberModule.updateSellMemberSlot(
				this.accessToken,
				sellSlotId,
				price,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async cancelSellSlot(sellSlotId: string) {
		try {
			const data = await this.INSTANCE.memberModule.cancelSellMemberSlot(
				this.accessToken,
				sellSlotId,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async getMySellMemberSlot() {
		try {
			const data = await this.INSTANCE.userSellGuildModule.getMySellMemberSlot(
				this.accessToken,
				this.gameConfig.clientId,
			);
			return data;
		} catch (e) {
			console.error(e);
		}
	}

	public async buyFraction(guildAddress: string, amount: number, chain?: string) {
		const data = await this._createAction(
			'buy-share',
			{
				guildAddress,
				amount,
			},
			{},
			chain,
		);
		return data;
	}

	public async sellFraction(guildAddress: string, amount: number, chain?: string) {
		const data = await this._createAction(
			'sell-share',
			{
				guildAddress,
				amount,
			},
			{},
			chain,
		);
		return data;
	}

	public async linkAddress() {
		const data = await this._createAction(
			'link-address',
			{
				userId: this.userInfo.userId,
			},
			{
				userId: this.userInfo.userId,
			},
		);
		return data;
	}

	public async disbandGuild(guildAddress: string, chain?: string) {
		const data = await this._createAction(
			'disband-guild',
			{
				guildAddress,
			},
			{},
			chain,
		);
		return data;
	}

	public async changeGuildOwner(guildAddress: string, newOwnerId: string, oldOwnerUserId: string) {
		const data = await this._createAction(
			'change-guild-owner',
			{
				oldOwnerUserId,
				guildAddress,
				newOwnerId,
			},
			{
				guildAddress,
				newOwnerId,
			},
		);
		return data;
	}
}
