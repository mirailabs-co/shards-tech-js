# AdX Shards Package

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## 🚀 Installation

You can install the package using either `yarn` or `npm`:

```sh
yarn add @mirailabs-co/adx-shards

npm install @mirailabs-co/adx-shards
```

## 📌 Usage

Here is an example of how to use `AdX Shards` in your project:

```tsx
import { AdShardTech } from '@mirailabs-co/adx-shards';

const ExamplePage = () => {
	return (
		<>
			...
			<AdShardTech adsBlockId={'ADS_BLOCK_ID'} appId={'APP_ID'} />
			...
		</>
	);
};

export default ExamplePage;
```

-   `ADS_BLOCK_ID` and `CLIENT_ID` can be obtained from the [AdX Shards Admin](https://admin-adx.shards.tech/) page.
