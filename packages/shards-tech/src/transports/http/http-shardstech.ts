import { GameConfig } from '../../constants/types';
import { Action } from '../dtos/Action.dtos';
import { GetHistoryChatDto, GuildHistoryChat, SendMessageDto } from '../dtos/GuildChat.dtos';
import { GetGuildScoreDto, GuildScore } from '../dtos/GuildScore.dtos';
import { Guilds } from '../dtos/Guilds.dtos';
import { JoinGuildRequest } from '../dtos/JoinGuildRequest.dtos';
import { LeaderBoards } from '../dtos/LeaderBoard.dtos';
import { GetTransactionHistoryDto, TransactionHistory } from '../dtos/TransactionHistoty.dto';
import { UserSellGuild } from '../dtos/UserSellGuild.dtos';
import { BaseHttpService } from './http-base';

class ShardsTechApi extends BaseHttpService {
	public static readonly INSTANCE = new ShardsTechApi();

	constructor(env = 'development') {
		const API_GUILD_URL = env === 'production' ? 'https://api.shards.tech' : 'https://api-dev.shards.tech';
		super(API_GUILD_URL);
	}

	async getConfig(accessToken: string, clientId: string): Promise<GameConfig> {
		return this.sendGet<GameConfig>(
			'v1/game-config',
			{},
			{
				'Authorization': `Bearer ${accessToken}`,
				'x-client-id': clientId,
			},
		);
	}

	actionModule = {
		createAction: async (
			accessToken: string,
			type: string,
			metadata: Record<string, any>,
			clientId: string,
			chain?: string,
		): Promise<Action> => {
			return this.sendPost<Action>(
				'v1/actions',
				{ type, metadata, chain },
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},

		sendNotification: async (accessToken: string, link: string, clientId: string): Promise<boolean> => {
			return this.sendPost<boolean>(
				'v1/actions/send-notification',
				{ link },
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},

		getAction: async (accessToken: string, actionId: string, clientId: string): Promise<Action> => {
			return this.sendGet<Action>(
				`v1/actions/${actionId}`,
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},

		generateHash: async (accessToken: string, params: any, clientId: string): Promise<string> => {
			return this.sendPost<string>(
				'v1/actions/generate-hash',
				{
					params,
				},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},
	};

	guildChatModule = {
		getHistoryChat: async (
			accessToken: string,
			query: GetHistoryChatDto,
			clientId: string,
		): Promise<GuildHistoryChat[]> => {
			return this.sendGet<GuildHistoryChat[]>('v1/chat', query, {
				'Authorization': `Bearer ${accessToken}`,
				'x-client-id': clientId,
			});
		},
		sendMessage: async (accessToken: string, body: SendMessageDto, clientId: string): Promise<GuildHistoryChat> => {
			return this.sendPost<GuildHistoryChat>('v1/chat', body, {
				'Authorization': `Bearer ${accessToken}`,
				'x-client-id': clientId,
			});
		},

		getUserOnlineInGuild: async (accessToken: string, clientId: string): Promise<string[]> => {
			return this.sendGet<string[]>(
				'v1/socket',
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},
	};

	guildScoreModule = {
		getGuildScoreForLeaderBoard: async (
			accessToken: string,
			query: GetGuildScoreDto,
			clientId: string,
		): Promise<GuildScore[]> => {
			return this.sendGet<GuildScore[]>('v1/guild-score', query, {
				'Authorization': `Bearer ${accessToken}`,
				'x-client-id': clientId,
			});
		},

		getIndexLeaderBoard: async (
			accessToken: string,
			guildId: string,
			leaderBoardId: string,
			clientId: string,
		): Promise<number> => {
			return this.sendGet<number>(
				`v1/guild-score/${guildId}/${leaderBoardId}`,
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},
	};

	guildsModule = {
		getGuilds: async (accessToken: string, clientId: string): Promise<Guilds> => {
			return this.sendGet<Guilds>(
				'v1/guilds/guild-of-user',
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},

		getUsersInGuild: async (accessToken: string, guildId: string, clientId: string): Promise<string[]> => {
			return this.sendGet<string[]>(
				`v1/guilds/users/${guildId}`,
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},

		getShareOfGuild: async (accessToken: string, guildId: string, clientId: string): Promise<number> => {
			return this.sendGet<number>(
				`v1/guilds/${guildId}`,
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},

		getShareUserHaveInGuild: async (accessToken: string, guildId: string, clientId: string): Promise<number> => {
			return this.sendGet<number>(
				`v1/guilds/user/${guildId}`,
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},

		userUpdateGuild: async (accessToken: string, guildId: string, body: any, clientId: string): Promise<string> => {
			return this.sendPut<string>(`v1/guilds/${guildId}`, body, {
				'Authorization': `Bearer ${accessToken}`,
				'x-client-id': clientId,
			});
		},

		getSharePrice: async (
			accessToken: string,
			guildId: string,
			amount: number,
			clientId: string,
		): Promise<string> => {
			return this.sendGet<string>(
				`v1/guilds/share-price/${guildId}/${amount}`,
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},

		getSellPrice: async (
			accessToken: string,
			guildId: string,
			amount: number,
			clientId: string,
		): Promise<string> => {
			return this.sendGet<string>(
				`v1/guilds/sell-share-price/${guildId}/${amount}`,
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},
	};

	joinGuildRequestModule = {
		createJoinGuildRequest: async (
			accessToken: string,
			guildId: string,
			clientId: string,
		): Promise<JoinGuildRequest> => {
			return this.sendPost<JoinGuildRequest>(
				`v1/join-guild-request/${guildId}`,
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},

		getJoinGuildRequest: async (
			accessToken: string,
			guildId: string,
			clientId: string,
		): Promise<JoinGuildRequest[]> => {
			return this.sendGet<JoinGuildRequest[]>(
				`v1/join-guild-request/${guildId}`,
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},
		getJoinGuildOfUser: async (accessToken: string, clientId: string): Promise<JoinGuildRequest[]> => {
			return this.sendGet<JoinGuildRequest[]>(
				'v1/join-guild-request',
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},

		acceptJoinGuildRequest: async (
			accessToken: string,
			userId: string,
			guildId: string,
			clientId: string,
		): Promise<boolean> => {
			return this.sendPut<boolean>(
				'v1/join-guild-request/user-accept',
				{
					userId,
					guildId,
				},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},

		rejectJoinGuildRequest: async (
			accessToken: string,
			userId: string,
			guildId: string,
			clientId: string,
		): Promise<boolean> => {
			return this.sendPut<boolean>(
				'v1/join-guild-request/user-reject',
				{
					userId,
					guildId,
				},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},

		inviteUser: async (
			accessToken: string,
			userId: string,
			guildId: string,
			clientId: string,
		): Promise<boolean> => {
			return this.sendPut<boolean>(
				'v1/join-guild-request/invite',
				{
					userId,
					guildId,
				},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},

		rejectInvite: async (
			accessToken: string,
			guildId: string,
			clientId: string,
		): Promise<boolean> => {
			return this.sendDelete<boolean>(
				`v1/join-guild-request/reject-invite/${guildId}`,
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},
	};

	leaderBoardModule = {
		getLeaderBoards: async (accessToken: string, clientId: string): Promise<LeaderBoards[]> => {
			return this.sendGet<LeaderBoards[]>(
				'v1/leader-boards',
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},
	};

	transactionHistoryModule = {
		getTransactionHistoryOfUser: async (
			accessToken: string,
			query: GetTransactionHistoryDto,
			clientId: string,
		): Promise<TransactionHistory[]> => {
			return this.sendGet<TransactionHistory[]>('v1/transaction-history', query, {
				'Authorization': `Bearer ${accessToken}`,
				'x-client-id': clientId,
			});
		},

		getTransactionHistoryOfGuild: async (
			accessToken: string,
			query: GetTransactionHistoryDto,
			clientId: string,
		): Promise<TransactionHistory[]> => {
			return this.sendGet<TransactionHistory[]>('v1/transaction-history/guild', query, {
				'Authorization': `Bearer ${accessToken}`,
				'x-client-id': clientId,
			});
		},

		calcAmountTransaction: async (
			accessToken: string,
			query: GetTransactionHistoryDto,
			clientId: string,
		): Promise<number> => {
			return this.sendGet<number>('v1/transaction-history/amount', query, {
				'Authorization': `Bearer ${accessToken}`,
				'x-client-id': clientId,
			});
		},
	};

	userSellGuildModule = {
		getGuildUserHaveShare: async (accessToken: string, clientId: string): Promise<UserSellGuild[]> => {
			return this.sendGet<UserSellGuild[]>(
				'v1/user-sell-guild/list',
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},

		getMySellMemberSlot: async (accessToken: string, clientId: string): Promise<UserSellGuild[]> => {
			return this.sendGet<UserSellGuild[]>(
				'v1/user-sell-guild/my',
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},

		getSlotPrice: async (accessToken: string, guildId: string, clientId: string): Promise<string> => {
			return this.sendGet<string>(
				`v1/user-sell-guild/slot-price/${guildId}`,
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},
	};

	memberModule = {
		sellMemberSlot: async (accessToken: string, guildId: string, price: number, clientId: string): Promise<any> => {
			return this.sendPost<string>(
				'v1/member/sell-slot',
				{
					guildId,
					price,
				},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},
		updateSellMemberSlot: async (
			accessToken: string,
			sellSlotId: string,
			price: number,
			clientId: string,
		): Promise<any> => {
			return this.sendPut<string>(
				'v1/member/sell-slot',
				{
					price,
					sellSlotId,
				},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},
		cancelSellMemberSlot: async (accessToken: string, sellSlotId: string, clientId: string): Promise<any> => {
			return this.sendDelete<string>(
				`v1/member/sell-slot/${sellSlotId}`,
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},
		burnMemberSlot: async (accessToken: string, guildId: string, clientId: string): Promise<any> => {
			return this.sendDelete<string>(
				`v1/member/sell-slot/burn/${guildId}`,
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},
	};

	userSharesGuildModule = {
		getGuildUserHaveShare: async (accessToken: string, clientId: string): Promise<Guilds[]> => {
			return this.sendGet<Guilds[]>(
				'v1/guilds/share/user',
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},
	};

	usersModule = {
		getUser: async (accessToken: string, clientId: string): Promise<string> => {
			return this.sendGet<string>(
				'v1/users',
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},
	};
}

export { ShardsTechApi };
