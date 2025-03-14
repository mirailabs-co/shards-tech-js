# AdX Shards Vanilla Package

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## 🚀 Installation

You can install the package using `yarn` or `npm`:

```sh:packages/adx-shards-vanilla/README.md
yarn add @mirailabs-co/adx-shards-vanilla

npm install @mirailabs-co/adx-shards-vanilla
```

Or use directly from CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@mirailabs-co/adx-shards-vanilla/dist/adx-shards-vanilla.min.js"></script>
```

## 📌 Usage

### Basic Ad Integration

Here's how to use basic ads with `AdX Shards Vanilla`:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>AdShardTech Integration</title>
		<script src="https://cdn.jsdelivr.net/npm/@mirailabs-co/adx-shards-vanilla/dist/adx-shards-vanilla.min.js"></script>
	</head>
	<body>
		<div id="ad-container"></div>

		<script>
			document.addEventListener('DOMContentLoaded', function () {
				const adShardTech = new window.ShardsDSP.AdShardTech({
					adsBlockId: 'ADS_BLOCK_ID',
					appId: 'APP_ID',
					position: 'default',
					env: 'production',
				});

				adShardTech.mount(document.getElementById('ad-container'));
			});
		</script>
	</body>
</html>
```

### Position Options

The `position` parameter can be one of the following:

-   `"default"` - Display within page content
-   `"bottom"` - Fixed at the bottom of the page
-   `"top"` - Fixed at the top of the page

### Advanced Options

You can customize additional properties:

```javascript
const adShardTech = new window.ShardsDSP.AdShardTech({
	adsBlockId: 'ADS_BLOCK_ID',
	appId: 'APP_ID',
	width: 400, // Width from 320px to 512px
	borderRadius: 8, // Border radius up to 24px
	position: 'bottom', // 'default', 'top', or 'bottom'
	env: 'production', // 'development' or 'production'
});
```

### Removing Ads

To remove ads when no longer needed:

```javascript
// Store reference to adShardTech object
const adShardTech = new window.ShardsDSP.AdShardTech({...});

// When removal is needed
adShardTech.unmount();
```

### 🔹 Notes:

-   **`ADS_BLOCK_ID`** and **`APP_ID`** are required values. You can obtain them from [AdX Shards Publisher](https://publisher-adx.shards.tech/) (or development environment [AdX Shards Publisher Dev](https://publisher-dev-1737355217.shards.tech/)).
-   Ads will automatically refresh every 30 seconds.
-   When deploying to production, ensure you change the `env` parameter from 'development' to 'production'.
-   Default ad size has an aspect ratio of 32:5, with width ranging from 320px to 512px.

---

Now you're ready to integrate `AdX Shards Vanilla` into your project! 🚀
