# AdX Shards Package

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## 🚀 Installation

You can install the package using `yarn` or `npm`:

```sh
yarn add @mirailabs-co/adx-shards

npm install @mirailabs-co/adx-shards
```

## 📌 Usage

### Basic Ad Integration

Here's how to use basic ads with `AdX Shards`:

```tsx
import { AdShardTech } from '@mirailabs-co/adx-shards';

const AdXComponent = () => {
	return (
		<AdShardTech
			adsBlockId="ADS_BLOCK_ID"
			appId="APP_ID"
			position="bottom" // Optional: 'top' or 'bottom'
			env="production" // Optional: defaults to 'development'
		/>
	);
};

export default AdXComponent;
```

### Position Options

The `position` prop can be either:

-   `"bottom"` (default) - Centered at bottom
-   `"top"` - Centered at top

### Rewarded Ads Integration

For rewarded ads, you'll need to use both the `AdRewards` provider and `useAdRewards` hook:

```tsx
import { AdRewards, useAdRewards } from '@mirailabs-co/adx-shards';

// First, wrap your app or component with AdRewards provider
const App = () => {
	return (
		<AdRewards
			adsBlockId="YOUR_REWARD_ADS_BLOCK_ID"
			appId="YOUR_APP_ID"
			env="production" // Optional, defaults to 'development'
		>
			<YourComponents />
		</AdRewards>
	);
};

// Then use the hook in your components
const RewardButton = () => {
	const { showAd, isAdCompleted } = useAdRewards();

	useEffect(() => {
		if (isAdCompleted) {
			// Handle reward after ad completion
			console.log('User completed watching the ad!');
		}
	}, [isAdCompleted]);

	return <button onClick={showAd}>Watch Ad to Get Reward</button>;
};
```

### 🔹 Notes:

-   **`ADS_BLOCK_ID`** and **`APP_ID`** are required values. You can obtain them from [AdX Shards Publisher](https://publisher-adx.shards.tech/) (or development environment [AdX Shards Publisher Dev](https://publisher-dev-1737355217.shards.tech/)).
-   For Rewarded Ads:
    -   Ads will be displayed as a full-screen overlay
    -   Users must watch for at least 20 seconds before being able to skip
    -   `isAdCompleted` will be `true` when the user has finished watching the ad
    -   Use `env="production"` when deploying to production

---

Now you're ready to integrate `AdX Shards` into your project! 🚀
