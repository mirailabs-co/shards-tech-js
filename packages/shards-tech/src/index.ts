// import { MiraiConnector as Connector } from './connectors/mirai-connector';
export { MiraiConnection as Connection } from './connection/mirai-connection';
export { MiraiCore as ShardsTechCore } from './core/mirai-core';

export { IConnection } from './connection/connection';
export * from './errors';

import { MiraiConnection } from './connection/mirai-connection';
import { MiraiCore } from './core/mirai-core';

if (typeof window !== 'undefined') {
	(window as any).ShardsTech = {
		Connection: MiraiConnection,
		Core: MiraiCore,
	};
}
