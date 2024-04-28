import EventEmitter from 'eventemitter3';
import { Connection } from '../connection/connection';

export type ICore = {
	clientId: string;
	env?: string;
};

export type CoreEventType =
	| 'new_connection'
	| 'connecting'
	| 'reconnecting'
	| 'disconnected'
	| 'reconnect'
	| 'reconnected';

export interface EventArguments {
	connecting: void;
	new_connection: {
		topicId: string;
	};
	reconnecting: void;
	disconnected: void;
	reconnect: void;
	reconnected: {
		connection: Connection;
	};
}

export abstract class Core extends EventEmitter<CoreEventType> {
	/**
	 * Constructs a new instance of the class.
	 *
	 * @param {ICore} opts - The options for the constructor.
	 */
	clientId: string;
	env?: string;
	constructor(opts: ICore) {
		super();
		this.clientId = opts.clientId;
		this.env = opts.env;
	}

	abstract connection: Connection;

	// CONNECTION
	public abstract connect({ accessToken }: { accessToken: string }): Promise<
	[Core, Connection]>;
	public abstract disconnect(connection: Connection): Promise<void>;
}

export interface ICoreEvent {
	on: <E extends CoreEventType>(event: E, listener: (args: EventArguments[E]) => void) => Core;
}
