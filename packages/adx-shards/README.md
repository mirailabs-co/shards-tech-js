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

### Interstitial Ads Integration

Interstitial ads automatically display during navigation events in your application:

```tsx
import { AdInterstitial } from '@mirailabs-co/adx-shards';

const App = () => {
	return (
		<>
			<YourComponents />
			<AdInterstitial
				adsBlockId="ADS_BLOCK_ID"
				appId="APP_ID"
				env="production" // Optional: defaults to 'development'
			/>
		</>
	);
};
```

### Rewarded Ads Integration

For rewarded ads, you'll need to use both the `AdRewards` provider and `useAdRewards` hook:

```tsx
import { AdRewards, useAdRewards } from '@mirailabs-co/adx-shards';

// First, wrap your app or component with AdRewards provider
const App = () => {
	return (
		<AdRewards
			adsBlockId="ADS_BLOCK_ID"
			appId="APP_ID"
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

### 🔹 General Notes:

-   **Basic Ads:**

    -   Display ads at fixed positions on the page
    -   Can be positioned at top or bottom of the viewport
    -   Suitable for applications requiring continuous ad display

-   **Interstitial Ads:**

    -   Ads will be displayed as a full-screen overlay
    -   Users must watch for at least 20 seconds before skipping
    -   Automatically display when users navigate between pages

-   **Rewarded Ads:**

    -   Ads will be displayed as a full-screen overlay
    -   Users must watch for at least 20 seconds before skipping
    -   Users actively choose to watch ads to receive rewards
    -   Require both provider and hook integration
    -   Track completion status through `isAdCompleted`
    -   `isAdCompleted` will be `true` when the user has finished watching the ad

-   **Common Requirements:**
    -   **`ADS_BLOCK_ID`** and **`APP_ID`** are required. You can obtain them from [AdX Shards Publisher](https://publisher-adx.shards.tech/) (or development environment [AdX Shards Publisher Dev](https://publisher-dev-1737355217.shards.tech/))
    -   Set `env="production"` when deploying to production
    -   Set `env="development"` during development and testing

---

Now you're ready to integrate `AdX Shards` into your project! 🚀
