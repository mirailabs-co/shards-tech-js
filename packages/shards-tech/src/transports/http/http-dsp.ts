import { AuthTokenType, UserType } from '../../constants/types';
import { sleep } from '../../utils/auth-util';
import { BaseHttpService } from './http-base';

class ShardsDSPService extends BaseHttpService {
	public static readonly INSTANCE = new ShardsDSPService();

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

	questModule = {
		getQuests: async ({ number }: { accessToken: string; clientId: string; number: number }): Promise<any> => {
			await sleep(1000);
			return FAKE_DATA_QUESTS.slice(0, number);
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

export { ShardsDSPService };

const FAKE_DATA_QUESTS = [
	{
		'_id': '672e04a8ce08021b246743a1',
		'type': 'visit_link',
		'group': 'partner_tasks',
		'xp': 500,
		'metadata': {
			'name': 'Join Etaku now!',
			'order': 5,
			'url': 'https://t.me/etakubot/etaku?startapp=1553199737',
		},
		'createdAt': '2024-11-08T12:31:36.072Z',
		'updatedAt': '2024-11-08T12:31:36.072Z',
		'__v': 0,
		'isCompleted': true,
		'isCanClaim': true,
	},
	{
		'_id': '67341d5016403205cbba1728',
		'type': 'visit_link',
		'group': 'partner_tasks',
		'xp': 500,
		'metadata': {
			'name': 'Launch Secret Ton Project & complete 1 task',
			'url': 'https://t.me/SecretPadBot/app?startapp=r432963868_sPictoTapp',
			'order': 10,
		},
		'createdAt': '2024-11-13T03:30:24.683Z',
		'updatedAt': '2024-11-13T03:30:24.683Z',
		'__v': 0,
		'isCompleted': true,
		'isCanClaim': true,
	},
	{
		'_id': '6735733f0d0e595dac308528',
		'type': 'visit_link',
		'group': 'partner_tasks',
		'xp': 500,
		'metadata': {
			'name': 'Register for Xociety Playtest!',
			'url': 'https://app.xociety.io/game',
			'order': 11,
		},
		'createdAt': '2024-11-14T03:49:19.309Z',
		'updatedAt': '2024-11-14T03:49:19.309Z',
		'__v': 0,
		'isCompleted': true,
		'isCanClaim': true,
	},
	{
		'_id': '67357357304295201036ff4f',
		'type': 'visit_link',
		'group': 'partner_tasks',
		'xp': 250,
		'metadata': {
			'name': 'Follow Xociety on X!',
			'url': 'https://x.com/xocietyofficial',
			'order': 12,
		},
		'createdAt': '2024-11-14T03:49:43.590Z',
		'updatedAt': '2024-11-14T03:49:43.590Z',
		'__v': 0,
		'isCompleted': true,
		'isCanClaim': true,
	},
	{
		'_id': '673573963042952010370940',
		'type': 'visit_link',
		'group': 'partner_tasks',
		'xp': 500,
		'metadata': {
			'name': 'Join Street Fury Game!',
			'url': 'https://t.me/street_fury_bot/start?startapp=PC_shards',
			'order': 13,
		},
		'createdAt': '2024-11-14T03:50:46.552Z',
		'updatedAt': '2024-11-14T03:50:46.552Z',
		'__v': 0,
		'isCompleted': true,
		'isCanClaim': true,
	},
	{
		'_id': '673573ab0d0e595dac309730',
		'type': 'visit_link',
		'group': 'partner_tasks',
		'xp': 500,
		'metadata': {
			'name': 'Join Street Fury!',
			'url': 'https://t.me/street_fury',
			'order': 14,
		},
		'createdAt': '2024-11-14T03:51:07.423Z',
		'updatedAt': '2024-11-14T03:51:07.423Z',
		'__v': 0,
		'isCompleted': true,
		'isCanClaim': true,
	},
	{
		'_id': '6745427f3d72c1db8142abbd',
		'type': 'visit_link',
		'group': 'partner_tasks',
		'xp': 500,
		'metadata': {
			'name': 'Follow 1launch on X!',
			'url': 'https://x.com/1Launch_xyz',
			'order': 18,
		},
		'createdAt': '2024-11-26T03:37:35.758Z',
		'updatedAt': '2024-11-26T03:37:35.758Z',
		'__v': 0,
		'isCompleted': false,
		'isCanClaim': true,
	},
	...Array.from({ length: 13 }, (_, i) => ({
		'_id': `fake_id_${i}`,
		'type': 'visit_link',
		'group': 'partner_tasks',
		'xp': Math.random() > 0.5 ? 250 : 500,
		'metadata': {
			'name': `Task ${i + 8}`,
			'url': `https://example.com/task/${i + 8}`,
			'order': i + 10,
		},
		'createdAt': new Date().toISOString(),
		'updatedAt': new Date().toISOString(),
		'__v': 0,
		'isCompleted': Math.random() > 0.5,
		'isCanClaim': Math.random() > 0.2,
	})),
];
