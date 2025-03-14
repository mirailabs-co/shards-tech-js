import { SignerWebSocketService } from '../transports/websocket/ws-signer';
import { parseUserInfoFromAccessToken } from '../utils/auth-util';
import { Connection, ConnectionOpts } from './connection';

class MiraiConnection extends Connection {
	public topicId: string;
	public wcTopicId: string;

	private serverURL: string = 'https://api-adx-dev.shards.tech/';

	private pending = false;
	private initializing = false;
	private initialized = false;

	// FOR WS CONNECTION
	public accessToken: string;
	public clientId: string;
	public ws: InstanceType<typeof SignerWebSocketService>;
	private isDisconnecting: boolean = false;

	constructor(opts: ConnectionOpts) {
		super(opts);

		this.accessToken = opts.accessToken || null;
		this.clientId = opts.clientId || null;
		const env = opts.env;

		if (env === 'production') {
			this.serverURL = 'https://api-adx.shards.tech/';
		}
	}

	public static async init(opts: ConnectionOpts) {
		const connection = new MiraiConnection(opts);

		await connection.initialize();

		return connection;
	}
	public isConnected(): boolean {
		return this.ws && this.ws.socket.getSocket().connected;
	}

	private async initialize(): Promise<void> {
		if (this.pending) {
			return new Promise((resolve, reject) => {
				this.once('open', () => {
					this.once('open_error', (error: any) => {
						reject(error);
					});
					if (typeof this.ws === 'undefined') {
						return reject(new Error('WS not initialized'));
					}
					resolve();
				});
			});
		}

		try {
			this.pending = true;
			await this._registerListener();

			if (this.accessToken) {
				await this.register(this.accessToken, this.clientId);
			}

			this.emit('open');
		} catch (e) {
			this.emit('open_error', e);
			throw e;
		}
	}

	private async register(accessToken: string, clientId: string): Promise<SignerWebSocketService> {
		if (typeof this.ws !== 'undefined') {
			return this.ws;
		}

		if (this.initializing) {
			return new Promise((resolve, reject) => {
				this.once('register_error', (error: any) => {
					reject(error);
				});
				this.once('init', () => {
					if (typeof this.ws === 'undefined') {
						return reject(new Error('WS not initialized'));
					}
					resolve(this.ws);
				});
			});
		}
		try {
			this.initializing = true;

			this.ws = new SignerWebSocketService({
				url: this.serverURL,
				accessToken,
				clientId,
			});

			this.initializing = false;
			this.emit('init');
			return this.ws;
		} catch (e) {
			this.emit('register_error', e);
			throw e;
		}
	}

	public async connect({ accessToken, clientId }: { accessToken: string; clientId: string }): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			try {
				if (!this.ws || this.ws === undefined) {
					await this.register(accessToken, clientId);
				}
				const socket = await this.ws.establish(true);

				socket.on('disconnect', async (reason) => {
					if (this.isDisconnecting) {
						this.isDisconnecting = false;
					} else {
						this.emit('disconnected', { reason, reconnect: true });
						// await this.resetAll(reason);
					}
				});

				socket.on('connect', async () => {
					// this.emit('connected', getInternalTopicId(sub, aud));
					this.accessToken = accessToken;

					this.initialized = true;

					resolve(true);
				});

				socket.on('newMessage', async (received) => {
					this.emit('newMessage', received);
				});

				socket.on('connect_error', (reason: string) => {
					this.emit('error', reason);
					reject(false);
				});

				socket.connect();
			} catch (error) {
				console.error(error);
				throw error;
			} finally {
			}
		});
	}

	public async disconnect(): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			console.log('current ws status', this.ws.socket.getSocket().connected);
			try {
				this.isDisconnecting = true;
				if (this.ws.socket.getSocket().connected) {
					if (this.ws.socket.disconnect()) {
						this.emit('disconnected', {
							reconnect: false,
						});
						resolve(true);
					}
				} else {
					this.emit('disconnected', {
						reconnect: false,
					});
					resolve(true);
				}
			} catch (e: any) {
				this.isDisconnecting = false;
				reject(e);
			}

			resolve(false);
		});
	}

	public async reset(): Promise<void> {
		this.removeAllListeners();
		this.accessToken = null;
		this.initialized = false;
	}

	private async resetAll(reason: string): Promise<void> {
		this.removeAllListeners();

		this.accessToken = null;
		this.initialized = false;
	}

	private async _registerListener() {
		this.once('connected', async (topic: string) => {
			this.topicId = topic;
		});
	}
}

export { MiraiConnection };
