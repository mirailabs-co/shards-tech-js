# Shards Tech - Constants

## App Constants

##### Make Authorization Requests

```typescript
// app constants shared for own app
type TMiraiToken = {
	access_token: string;
	expires_in?: number;
	refresh_expires_in?: number;
	refresh_token: string;
	type?: string;
	sessionState?: string;
	scope?: string;
};
```
