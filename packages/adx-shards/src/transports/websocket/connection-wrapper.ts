/**
 * A wrapper for socket client
 */
import EventEmitter from 'eventemitter3';
import { Socket } from 'socket.io-client';

type TWsListener = (...args: any) => void;

export class WebSocketConnection {
	private socket: Socket;

	private internalEventEmitter: EventEmitter; // For ack usage

	private acknowledgement: boolean;

	constructor(socket: Socket, acknowledgement?: boolean) {
		this.socket = socket;
		this.acknowledgement = acknowledgement;
		this.internalEventEmitter = new EventEmitter();
	}

	public getSocket = (): Socket => {
		return this.socket;
	};

	public on = (channel: string, listener: TWsListener): Function => {
		this.socket.on(channel, listener);
		return () => this.socket.off(channel, listener);
	};

	public once = (channel: string, listener: TWsListener): Function => {
		this.socket.once(channel, listener);
		return () => this.socket.removeListener(channel, listener);
	};

	public emit = (channel: string, ...args: any): void => {
		if (this.socket && this.socket.connected) {
			if (this.acknowledgement) {
				const t0 = Date.now();
				console.debug(`[WS] EVENT: ${channel}`);

				this.socket.emit(channel, ...args, (response: any) => {
					const t1 = Date.now();
					console.debug(`[WS] EVENT: ${channel} | Time: ${t1 - t0}ms`);

					if (Array.isArray(response)) {
						this.internalEventEmitter.emit(channel, ...response);
					} else {
						this.internalEventEmitter.emit(channel, response);
					}
				});
			} else {
				this.socket.emit(channel, ...args);
			}
		}
	};

	public connect = (): boolean => {
		try {
			if (this.socket && !this.socket.connected) {
				this.socket.connect();
				return true;
			}
		} catch (e) {
			console.error(e);
		}
		return false;
	};

	public disconnect = (): boolean => {
		try {
			if (this.socket && this.socket.connected) {
				this.socket.removeAllListeners();
				this.socket.disconnect();
				return true;
			}
		} catch (e) {
			console.error(e);
		}
		return false;
	};

	public timeout = (t: number): Socket => {
		return this.socket.timeout(t);
	};

	public internal = (): EventEmitter => {
		return this.internalEventEmitter;
	};
}
