// import { MiraiConnector as Connector } from './connectors/mirai-connector';
export { MiraiConnection as Connection } from './connection/mirai-connection';
export { MiraiCore as ShardsTechCore } from './core/mirai-core';

export { IConnection } from './connection/connection';
export * from './errors';

if (typeof window !== 'undefined') {
	(window as any).ShardsTech = {
		Connection: require('./connection/mirai-connection').MiraiConnection,
		Core: require('./core/mirai-core').MiraiCore,
	};
}
