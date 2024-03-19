module.exports = {
	preset: 'ts-jest',
	extensionsToTreatAsEsm: ['.ts'],
	testEnvironment: 'node',
	transform: {
		'^.+\\.ts?$': 'ts-jest',
	},
	transformIgnorePatterns: ['<rootDir>/node_modules/'],
	coverageDirectory: '<rootDir>/coverage/',
	verbose: true,
};
