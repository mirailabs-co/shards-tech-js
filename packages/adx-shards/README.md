# AdX Shards Package

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## 🚀 Installation

You can install the package using `yarn` or `npm`:

```sh
yarn add @mirailabs-co/adx-shards

npm install @mirailabs-co/adx-shards
```

## 📌 Usage

Here’s how to use `AdX Shards` in your project:

```tsx
import { AdShardTech } from '@mirailabs-co/adx-shards';

const AdXComponent = () => {
	return <AdShardTech adsBlockId="ADS_BLOCK_ID" appId="APP_ID" />;
};

export default AdXComponent;
```

### 🔹 Notes:

-   **`ADS_BLOCK_ID`** and **`APP_ID`** are required values. You can obtain them from the [AdX Shards Publisher](https://publisher-adx.shards.tech/) (or development environment [AdX Shards Publisher Dev](https://publisher-dev-1737355217.shards.tech/)) page.
-   Replace these values with your actual credentials and use `<AdXComponent />` anywhere in your application to display ads.

---

Now you're ready to integrate `AdX Shards` into your project! 🚀
