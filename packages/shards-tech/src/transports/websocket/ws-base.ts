import { WebSocketConnection } from './connection-wrapper';

export type IWSOpts = {
	url: string;
	accessToken: string;
};

export abstract class BaseWebSocketService {
	constructor(opts: IWSOpts) {
	}

	protected getHeaders = async (authToken?: string) => {
		const authHeaders: Record<string, string> = {};

		if (authToken) {
			authHeaders.authorization = `${authToken}`;
			return authHeaders;
		}
		return authHeaders;
	};

	public abstract establish(): Promise<WebSocketConnection>;
}
