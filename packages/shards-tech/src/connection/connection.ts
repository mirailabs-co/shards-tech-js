import EventEmitter from 'eventemitter3';
import { SignerWebSocketService } from '../transports/websocket/ws-signer';

export type ConnectionOpts = {
	accessToken?: string;
	clientId?: string;
};

export interface IConnection {}

export abstract class Connection extends EventEmitter<any> implements IConnection {
	public abstract ws: InstanceType<typeof SignerWebSocketService>;
	public abstract accessToken: string;
	public abstract clientId: string;

	public abstract isConnected(): boolean;
	public abstract disconnect(): Promise<boolean>;
	public abstract reset(): Promise<void>;

	constructor(opts: ConnectionOpts) {
		super();
	}
}
