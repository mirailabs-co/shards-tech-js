import FingerprintJS, { GetResult } from '@fingerprintjs/fingerprintjs';
import { Connection } from '../connection/connection';
import { MiraiConnection } from '../connection/mirai-connection';
import { UserType } from '../constants/types';
import { NoAccessToken, SDKError } from '../errors';
import { ShardsDSPService } from '../transports/http/http-dsp';
import { getLocalStorageAsObject } from './../utils/auth-util';
import { ConnectType, Core, ICore } from './core';

type Timeout = ReturnType<typeof setInterval>;
export class MiraiCore extends Core {
	connection: MiraiConnection;
	initData: string;
	accessToken: string;
	userInfo: UserType;
	fingerprint: GetResult;
	INSTANCE: ShardsDSPService;
	localStorageObject: Record<string, any>;
	intervalId: Timeout | null = null;
	// intervalTime: number = 2 * 60 * 1000; // 2 minutes
	intervalTime: number = 5 * 1000; // 5 secs

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

	public async connect(options?: ConnectType): Promise<[MiraiCore, MiraiConnection]> {
		const { initData: initDataProps } = options || {};

		return new Promise(async (resolve, reject) => {
			const initData = window?.Telegram?.WebApp?.initData || initDataProps;
			if (!initData) {
				reject(new NoAccessToken(SDKError.NoConnection, 'Not found initData.'));
			}

			this.initData = initData;
			this.localStorageObject = getLocalStorageAsObject();

			this.INSTANCE = new ShardsDSPService(this.env);
			const authToken = await this.INSTANCE.authModule.login(initData);

			const { accessToken } = authToken || {};

			this.accessToken = accessToken;
			this.emit('connecting');
			const userInfo = await this.INSTANCE.usersModule.getUser(accessToken, this.clientId);

			const fp = await FingerprintJS.load();
			const result: GetResult = await fp.get();

			this.fingerprint = result;
			this.userInfo = userInfo;
			console.log('webGlBasics :>> ', this.fingerprint.components.webGlBasics);

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
			this.trackingSession();
			this.startTrackingInterval();
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
			console.log(`Tracking :>> ${userId} - ${date}`);

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

	public getListAds = async (number: number): Promise<any[]> => {
		try {
			const response = await this.INSTANCE.questModule.getQuests({
				accessToken: this.accessToken,
				clientId: this.clientId,
				number,
			});

			console.log('getListAds  :>> ', response);
			return response || [];
		} catch (error) {
			console.error('Error during getListAds:', error);
		}
	};

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
}
