import {
	AuthTokenType,
	CreateAdParams,
	CreateEventParams,
	DoAdResponse,
	ListAdsType,
	LoginParams,
	UserAttribute,
} from '../../constants/types';
import { BaseHttpService } from './http-base';

const ADMIN_API_KEY = 'mHgk12ivveQm2vqBk7lXFBkVX9YweqgB';

class ShardsDSPService extends BaseHttpService {
	public static readonly INSTANCE = new ShardsDSPService();

	constructor(env = 'development') {
		const SERVER_URL = env === 'production' ? 'https://api-adx.shards.tech' : 'https://api-adx-dev.shards.tech';
		super(SERVER_URL);
	}

	authModule = {
		login: async (params: LoginParams): Promise<AuthTokenType> => {
			return this.sendPost('v1/auth/login', params);
		},

		refreshToken: async (accessToken: string, clientId: string): Promise<AuthTokenType> => {
			return this.sendPost(
				'v1/auth/refresh-token',
				{ refreshToken: accessToken },
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},
	};

	adModule = {
		getAds: async (accessToken: string, clientId: string, limit: number): Promise<ListAdsType> => {
			return this.sendGet(
				`v1/ads/${limit}`,
				{},
				{
					'Authorization': `Bearer ${accessToken}`,
					'x-client-id': clientId,
				},
			);
		},

		createAd: async (params: CreateAdParams) => {
			return this.sendPost('v1/ads', params, {
				'api-key': ADMIN_API_KEY,
			});
		},

		actionDoAd: async (
			accessToken: string,
			clientId: string,
			params: { ad: string; app: string },
		): Promise<DoAdResponse> => {
			return this.sendPost('v1/history/user-do-ad', params, {
				'Authorization': `Bearer ${accessToken}`,
				'x-client-id': clientId,
			});
		},
	};

	usersModule = {
		createUserAttributes: async (
			accessToken: string,
			clientId: string,
			params: { attributes: UserAttribute[] },
		) => {
			return this.sendPost('v1/users/attributes', params, {
				'Authorization': `Bearer ${accessToken}`,
				'x-client-id': clientId,
			});
		},

		updateUserAttributes: async (accessToken: string, clientId: string, params: UserAttribute) => {
			return this.sendPut('v1/users/attributes/create-user-attribute', params, {
				'Authorization': `Bearer ${accessToken}`,
				'x-client-id': clientId,
			});
		},
	};

	eventModule = {
		createEvent: async (params: CreateEventParams) => {
			return this.sendPost('v1/events/create', params);
		},
	};
}

export { ShardsDSPService };
