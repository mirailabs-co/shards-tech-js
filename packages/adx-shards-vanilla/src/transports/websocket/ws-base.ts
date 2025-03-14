import { WebSocketConnection } from './connection-wrapper';

export type IWSOpts = {
	url: string;
	accessToken: string;
	clientId: string;
};

export abstract class BaseWebSocketService {
	constructor(opts: IWSOpts) {
	}

	protected getHeaders = async (authToken?: string, clientId?: string) => {
		const authHeaders: Record<string, string> = {};

		if (authToken) {
			authHeaders.authorization = `Bearer ${authToken}`;
			authHeaders.clientId = `${clientId}`;
			return authHeaders;
		}
		return authHeaders;
	};

	public abstract establish(): Promise<WebSocketConnection>;
}
