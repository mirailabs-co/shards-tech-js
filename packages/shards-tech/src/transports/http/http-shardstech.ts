import { AuthTokenType, UserType } from '../../constants/types';
import { BaseHttpService } from './http-base';

class ShardsTechApi extends BaseHttpService {
	public static readonly INSTANCE = new ShardsTechApi();

	constructor(env = 'development') {
		const SERVER_URL =
			env === 'production' ? 'https://api-telegram-app.shards.tech' : 'https://api-telegram-app-dev.shards.tech';
		super(SERVER_URL);
	}

	authModule = {
		login: async (telegramInitData: string): Promise<AuthTokenType> => {
			return this.sendPost('v1/auth/login', { telegramInitData });
		},
	};

	usersModule = {
		getUser: async (accessToken: string, clientId: string): Promise<UserType> => {
			return this.sendGet(
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
