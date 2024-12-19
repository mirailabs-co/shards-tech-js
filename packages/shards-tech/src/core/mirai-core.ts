import FingerprintJS, { GetResult } from '@fingerprintjs/fingerprintjs';
import { Connection } from '../connection/connection';
import { MiraiConnection } from '../connection/mirai-connection';
import { AdType, CreateAdParams, CreateEventParams, ListAdsType, LoginParams, UserType } from '../constants/types';
import { NoAccessToken, SDKError } from '../errors';
import { ShardsDSPService } from '../transports/http/http-dsp';
import { getLocalStorageAsObject } from './../utils/auth-util';
import { ConnectType, Core, ICore } from './core';
import Cookies from 'js-cookie';

type Timeout = ReturnType<typeof setInterval>;
export class MiraiCore extends Core {
	connection: MiraiConnection;
	initData: string;
	accessToken: string;
	userInfo: WebAppInitData;
	fingerprint: GetResult;
	INSTANCE: ShardsDSPService;
	localStorageObject: Record<string, any>;
	intervalId: Timeout | null = null;
	intervalTime: number = 2 * 60 * 1000; // 2 minutes
	advertiserId: string;
	// intervalTime: number = 5 * 1000; // 5 secs

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
			const [core, connection] = await this.connect();

			connection.on('approved', ({ topicId }) => {
				resolve(connection);
			});

			setTimeout(() => {
				resolve(null);
			}, 20000);
		});
	}

	public async connectAdvertiser(advertiserId: string) {
		this.advertiserId = advertiserId;
		return advertiserId;
	}

	public async connect(options?: ConnectType): Promise<[MiraiCore, MiraiConnection]> {
		const { initData: initDataProps } = options || {};

		return new Promise(async (resolve, reject) => {
			const initData = window?.Telegram?.WebApp?.initData || initDataProps;
			if (!initData) {
				reject(new NoAccessToken(SDKError.NoConnection, 'Not found initData.'));
			}
			const paramsInitData = new URLSearchParams(initData);
			const parsedInitData: WebAppInitData & Record<string, any> = {
				auth_date: 0,
				hash: '',
				signature: '',
			};
			Array.from(paramsInitData.entries()).forEach(([key, value]) => {
				parsedInitData[key] = key === 'user' ? JSON.parse(decodeURIComponent(value)) : value;
			});

			this.userInfo = parsedInitData;
			this.initData = initData;
			this.localStorageObject = getLocalStorageAsObject();
			const loginParams: LoginParams = {
				telegramInitData: initData,
				appId: this.clientId,
			};

			this.INSTANCE = new ShardsDSPService(this.env);
			const authToken = await this.INSTANCE.authModule.login(loginParams);

			Cookies.set('accessToken', authToken?.accessToken);
			Cookies.set('refreshToken', authToken?.refreshToken);

			const { accessToken } = authToken || {};
			this.accessToken = accessToken;
			this.emit('connecting');
			// const userInfo = await this.INSTANCE.usersModule.getUser({ accessToken, clientId: this.clientId });

			const fp = await FingerprintJS.load();
			const result: GetResult = await fp.get();

			this.fingerprint = result;
			// this.userInfo = userInfo;
			// console.log('webGlBasics :>> ', this.fingerprint.components.webGlBasics);

			const newConnection = await MiraiConnection.init({
				clientId: this.clientId,
				env: this.env,
			});
			this.emit('connecting');
			// TODO socket
			// const isConnected = await newConnection.connect({ accessToken, clientId: this.clientId });
			// if (isConnected) {
			// 	newConnection.on('disconnected', async () => {
			// 		await newConnection.reset();
			// 	});
			// } else {
			// 	reject(new Error('Connection failed'));
			// }
			this.connection = newConnection;

			// TODO tracking session
			// this.trackingSession();
			// this.startTrackingInterval();
			console.log('SDK Connected');
			return resolve([this, newConnection] as [MiraiCore, MiraiConnection]);
		});
	}

	public async disconnect(connection: Connection): Promise<void> {
		if (connection) {
			try {
				await connection.disconnect();
				this.stopTrackingInterval();
			} catch (e: any) {
				throw new Error(e);
			}
		}
	}

	public async getListAds(limit: number, getAll: boolean = false): Promise<ListAdsType> {
		try {
			const response = await this.INSTANCE.adModule.getAds(this.accessToken, this.clientId, 50);
			console.log(`Get ${limit} Ads for user @${this.userInfo?.user?.username}`);

			return (getAll ? response : response?.filter((ad) => ad?.matchScore).slice(0, limit)) || [];
		} catch (error) {
			console.error('Error during getListAds:', error);
		}
	}

	public async doAd(ad: AdType) {
		try {
			if (!ad) {
				throw new Error('Ad is required');
			}

			const response = await this.INSTANCE.adModule.actionDoAd(this.accessToken, this.clientId, {
				ad: ad._id,
				app: this.clientId,
			});
			console.log('User Click Ad :>> ', ad);

			return response;
		} catch (error) {
			console.error('Error during doAd:', error);
		}
	}

	public async requestAd(ad: AdType) {
		try {
			if (!ad || !this.clientId) {
				throw new Error('Ad and clientId is required');
			}

			const params = {
				adId: ad._id,
				app: this.clientId,
				title: ad.title,
				description: ad.description,
				url: ad.url,
				campaign: ad.campaign,
				weight: ad.weight,
				attributes: ad.attributes,
			};

			const response = await this.INSTANCE.adModule.createAd(params);
			console.log('Request Ad :>> ', ad);
			return response || [];
		} catch (error) {
			console.error('Error during createAd:', error);
		}
	}

	public async createEvent(params: CreateEventParams) {
		try {
			const response = await this.INSTANCE.eventModule.createEvent(params);
			console.log('SDK Create Event :>> ', params);
			return response;
		} catch (error) {
			console.error('Error during createEvent:', error);
		}
	}

	public getConnection() {
		return this.connection;
	}

	private async trackingSession(): Promise<void> {
		try {
			if (!this.initData) {
				return;
			}

			const params = new URLSearchParams(this.initData);
			const parsedData: Record<string, any> = {};
			Array.from(params.entries()).forEach(([key, value]) => {
				parsedData[key] = key === 'user' ? JSON.parse(decodeURIComponent(value)) : value;
			});

			const userId = parsedData?.user?.id?.toString();
			const date = new Date().toISOString();
			console.log(`Tracking Session :>> ${userId} - ${date}`);

			// TODO api call to track session
			//   const response = await fetch(this.env, {
			// 	method: 'POST',
			// 	headers: { 'Content-Type': 'application/json' },
			// 	body: JSON.stringify({ userId: this.userId, timestamp: Date.now() }),
			//   });
			// console.log('response trackSession :>> ', response);
		} catch (error) {
			console.error('Error during session tracking:', error);
		}
	}

	private startTrackingInterval(): void {
		if (this.intervalId) {
			console.warn('Session tracking is already running.');
			return;
		}

		this.intervalId = setInterval(() => this.trackingSession(), this.intervalTime);
		console.log('Session tracking started.');
	}

	private stopTrackingInterval(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
			console.log('Session tracking stopped.');
		}
	}

	async initialize() {
		try {
			this.INSTANCE = new ShardsDSPService(this.env);
			this.connection = null;
		} catch (e) {
			console.error(e);
		}
	}
}
