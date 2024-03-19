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

const API_GUILD_URL: string = 'https://api-dev.shards.tech';

class ShardsTechApi extends BaseHttpService {
	public static readonly INSTANCE = new ShardsTechApi();

	private constructor() {
		super(API_GUILD_URL);
	}

	async getConfig(accessToken: string): Promise<GameConfig> {
		return this.sendGet<GameConfig>('v1/game-config', {} , { 'Authorization': `Bearer ${accessToken}` });
	}

	actionModule = {
		createAction: async (accessToken: string, type: string, metadata: Record<string, any>): Promise<Action> => {
			return this.sendPost<Action>(
				'v1/actions',
				{ type, metadata },
				{ 'Authorization': `Bearer ${accessToken}` },
			);
		},

		sendNotification: async (accessToken: string, link: string): Promise<boolean> => {
			return this.sendPost<boolean>(
				'v1/actions/send-notification',
				{ link },
				{ 'Authorization': `Bearer ${accessToken}` },
			);
		},

		getAction: async (accessToken: string, actionId: string): Promise<Action> => {
			return this.sendGet<Action>(`v1/actions/${actionId}`, {}, { 'Authorization': `Bearer ${accessToken}` });
		},
	};

	guildChatModule = {
		getHistoryChat: async (accessToken: string, query: GetHistoryChatDto): Promise<GuildHistoryChat[]> => {
			return this.sendGet<GuildHistoryChat[]>('v1/chat', query, { 'Authorization': `Bearer ${accessToken}` });
		},
		sendMessage: async (accessToken: string, body: SendMessageDto): Promise<GuildHistoryChat> => {
			return this.sendPost<GuildHistoryChat>('v1/chat', body, { 'Authorization': `Bearer ${accessToken}` });
		},

		getUserOnlineInGuild: async (accessToken: string): Promise<string[]> => {
			return this.sendGet<string[]>('v1/socket', {},  { 'Authorization': `Bearer ${accessToken}` });
		},
	};

	guildScoreModule = {
		getGuildScoreForLeaderBoard: async (accessToken: string, query: GetGuildScoreDto): Promise<GuildScore[]> => {
			return this.sendGet<GuildScore[]>('v1/guild-score', query, {
				'Authorization': `Bearer ${accessToken}`,
			});
		},

		getIndexLeaderBoard: async (accessToken: string, guildId: string, leaderBoardId: string): Promise<number> => {
			return this.sendGet<number>(
				`v1/guild-score/${guildId}/${leaderBoardId}`,
				{},
				{ 'Authorization': `Bearer ${accessToken}` },
			);
		},
	};

	guildsModule = {
		getGuilds: async (accessToken: string): Promise<Guilds> => {
			return this.sendGet<Guilds>('v1/guilds/guild-of-user', {}, { 'Authorization': `Bearer ${accessToken}` });
		},

		getUsersInGuild: async (accessToken: string, guildId: string): Promise<string[]> => {
			return this.sendGet<string[]>(
				`v1/guilds/users/${guildId}`,
				{},
				{ 'Authorization': `Bearer ${accessToken}` },
			);
		},

		getShareOfGuild: async (accessToken: string, guildId: string): Promise<number> => {
			return this.sendGet<number>(`v1/guilds/${guildId}`, {}, { 'Authorization': `Bearer ${accessToken}` });
		},

		getShareUserHaveInGuild: async (accessToken: string, guildId: string): Promise<number> => {
			return this.sendGet<number>(`v1/guilds/user/${guildId}`, {}, { 'Authorization': `Bearer ${accessToken}` });
		},

		userUpdateGuild: async (accessToken: string, guildId: string, body: any): Promise<string> => {
			return this.sendPut<string>(`v1/guilds/${guildId}`, body, { 'Authorization': `Bearer ${accessToken}` });
		},

		getSharePrice: async (accessToken: string, guildId: string, amount: number): Promise<string> => {
			return this.sendGet<string>(
				`v1/guilds/share-price/${guildId}/${amount}`,
				{},
				{ 'Authorization': `Bearer ${accessToken}` },
			);
		},

		getSellPrice: async (accessToken: string, guildId: string, amount: number): Promise<string> => {
			return this.sendGet<string>(
				`v1/guilds/sell-share-price/${guildId}/${amount}`,
				{},
				{ 'Authorization': `Bearer ${accessToken}` },
			);
		},
	};

	joinGuildRequestModule = {
		createJoinGuildRequest: async (accessToken: string, guildId: string): Promise<JoinGuildRequest> => {
			return this.sendPost<JoinGuildRequest>(
				`v1/join-guild-request/${guildId}`,
				{},
				{ 'Authorization': `Bearer ${accessToken}` },
			);
		},

		getJoinGuildRequest: async (accessToken: string, guildId: string): Promise<JoinGuildRequest[]> => {
			return this.sendGet<JoinGuildRequest[]>(
				`v1/join-guild-request/${guildId}`,
				{},
				{ 'Authorization': `Bearer ${accessToken}` },
			);
		},
		getJoinGuildOfUser: async (accessToken: string): Promise<JoinGuildRequest[]> => {
			return this.sendGet<JoinGuildRequest[]>(
				'v1/join-guild-request',
				{},
				{ 'Authorization': `Bearer ${accessToken}` },
			);
		},
	};

	leaderBoardModule = {
		getLeaderBoards: async (accessToken: string): Promise<LeaderBoards[]> => {
			return this.sendGet<LeaderBoards[]>('v1/leader-boards', {}, { 'Authorization': `Bearer ${accessToken}` });
		},
	};

	transactionHistoryModule = {
		getTransactionHistoryOfUser: async (
			accessToken: string,
			query: GetTransactionHistoryDto,
		): Promise<TransactionHistory[]> => {
			return this.sendGet<TransactionHistory[]>('v1/transaction-history', query, {
				'Authorization': `Bearer ${accessToken}`,
			});
		},

		getTransactionHistoryOfGuild: async (
			accessToken: string,
			query: GetTransactionHistoryDto,
		): Promise<TransactionHistory[]> => {
			return this.sendGet<TransactionHistory[]>('v1/transaction-history/guild', query, {
				'Authorization': `Bearer ${accessToken}`,
			});
		},

		calcAmountTransaction: async (accessToken: string, query: GetTransactionHistoryDto): Promise<number> => {
			return this.sendGet<number>('v1/transaction-history/amount', query, {
				'Authorization': `Bearer ${accessToken}`,
			});
		},
	};

	userSellGuildModule = {
		getGuildUserHaveShare: async (accessToken: string): Promise<UserSellGuild[]> => {
			return this.sendGet<UserSellGuild[]>(
				'v1/user-sell-guild/list',
				{},
				{ 'Authorization': `Bearer ${accessToken}` },
			);
		},

		getMySellMemberSlot: async (accessToken: string): Promise<UserSellGuild[]> => {
			return this.sendGet<UserSellGuild[]>(
				'v1/user-sell-guild/my',
				{},
				{ 'Authorization': `Bearer ${accessToken}` },
			);
		},

		getSlotPrice: async (accessToken: string, guildId: string): Promise<string> => {
			return this.sendGet<string>(
				`v1/user-sell-guild/slot-price/${guildId}`,
				{},
				{ 'Authorization': `Bearer ${accessToken}` },
			);
		},
	};

	memberModule = {
		sellMemberSlot: async (accessToken: string, guildId: string, price: number): Promise<any> => {
			return this.sendPost<string>(
				'v1/member/sell-slot',
				{
					guildId,
					price,
				},
				{ 'Authorization': `Bearer ${accessToken}` },
			);
		},
		updateSellMemberSlot: async (accessToken: string, sellSlotId: string, price: number): Promise<any> => {
			return this.sendPut<string>(
				'v1/member/sell-slot',
				{
					price,
					sellSlotId,
				},
				{
					'Authorization': `Bearer ${accessToken}`,
				},
			);
		},
		cancelSellMemberSlot: async (accessToken: string, sellSlotId: string): Promise<any> => {
			return this.sendDelete<string>(
				`v1/member/sell-slot/${sellSlotId}`,
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
				},
			);
		},
		burnMemberSlot: async (accessToken: string, guildId: string): Promise<any> => {
			return this.sendDelete<string>(
				`v1/member/sell-slot/burn/${guildId}`,
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
				},
			);
		},
	};

	userSharesGuildModule = {
		getGuildUserHaveShare: async (accessToken: string): Promise<Guilds[]> => {
			return this.sendGet<Guilds[]>('v1/guilds/share/user', {}, { 'Authorization': `Bearer ${accessToken}` });
		},
	};

	usersModule = {
		getUser: async (accessToken: string): Promise<string> => {
			return this.sendGet<string>('v1/users', {}, { 'Authorization': `Bearer ${accessToken}` });
		},
	};
}

export { ShardsTechApi };
