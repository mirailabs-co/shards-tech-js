const base = require('./jest.config.base.js');

module.exports = {
	...base,
	coverageDirectory: '<rootDir>/coverage/',
	moduleNameMapper: {
		'^@mirailabs-co/*$': '<rootDir>/packages/*/src',
	},
	projects: ['<rootDir>/packages/*/jest.config.js'],
};
