import { BaseHttpService } from './http-base';

class ShardsTechApi extends BaseHttpService {
	public static readonly INSTANCE = new ShardsTechApi();

	constructor(env = 'development') {
		const API_GUILD_URL =
			env === 'production'
				? 'https://api-telegram-app.shards.tech/'
				: 'https://api-telegram-app-dev.shards.tech/';
		super(API_GUILD_URL);
	}

	authModule = {
		login: async (telegramInitData: string): Promise<string> => {
			return this.sendPost('v1/auth/login', { telegramInitData });
		},
	};

	guildsModule = {
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
