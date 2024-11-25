import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { Connection } from '../connection/connection';
import { MiraiConnection } from '../connection/mirai-connection';
import { UserType } from '../constants/types';
import { NoAccessToken, SDKError } from '../errors';
import { ShardsDSPService } from '../transports/http/http-dsp';
import { ConnectType, Core, ICore } from './core';

export class MiraiCore extends Core {
	connection: MiraiConnection;
	initData: string;
	accessToken: string;
	userInfo: UserType;
	INSTANCE: ShardsDSPService;

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

			this.INSTANCE = new ShardsDSPService(this.env);
			const authToken = await this.INSTANCE.authModule.login(initData);

			console.log('authToken :>> ', authToken);
			const { accessToken } = authToken || {};

			this.accessToken = accessToken;
			this.emit('connecting');
			const userInfo = await this.INSTANCE.usersModule.getUser(accessToken, this.clientId);

			const fp = await FingerprintJS.load();
			const result: any = await fp.get();

			console.log('result :>> ', result);
			this.userInfo = userInfo;
			const newConnection = await MiraiConnection.init({
				clientId: this.clientId,
				env: this.env,
			});
			this.emit('connecting');
			// const isConnected = await newConnection.connect({ accessToken, clientId: this.clientId });
			// if (isConnected) {
			// 	newConnection.on('disconnected', async () => {
			// 		await newConnection.reset();
			// 	});
			// } else {
			// 	reject(new Error('Connection failed'));
			// }
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
}
