// @ts-nocheck
import { MiraiConnection } from './connection/mirai-connection';
import { AdShardTech } from './core/AdShardTech';
import { MiraiCore } from './core/mirai-core';

// Declare global window interface
declare global {
	interface Window {
		ShardsDSP: {
			Connection: typeof MiraiConnection;
			Core: typeof MiraiCore;
			AdShardTech: typeof AdShardTech;
		};
	}
}

// Exports
export { MiraiConnection as Connection } from './connection/mirai-connection';
export { MiraiCore as ShardsDSPCore } from './core/mirai-core';
export { AdShardTech } from './core/AdShardTech';
export * from './constants/types';
export * from './errors';

// Add to window object if in browser environment
if (typeof window !== 'undefined') {
	window.ShardsDSP = {
		Connection: MiraiConnection,
		Core: MiraiCore,
		AdShardTech: AdShardTech,
	};
}
