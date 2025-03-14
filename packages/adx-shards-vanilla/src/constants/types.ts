export enum AdPosition {
	BOTTOM = 'bottom',
	TOP = 'top',
	DEFAULT = 'default',
}

export enum MediaPosition {
	HORIZONTAL = 'horizontal',
	VERTICAL = 'vertical',
	FULL_SCREEN = 'full_screen',
}

export enum AdsMediaType {
	VIDEO = 'video',
	IMAGE = 'image',
}

export type AuthTokenType = {
	accessToken: string;
	refreshToken: string;
};

export type UserType = {
	_id: string;
	__v: number;
	createdAt: string;
	firstName: string;
	lastName: string;
	updatedAt: string;
	user: TelegramUser;
	userName: string;
	address: string;
	twitter?: TwitterUser;
	discord?: DiscordUser;
	referralCode: string;
	isAmbassador: boolean;
};

export type TelegramUser = {
	id: number;
	first_name: string;
	last_name: string;
	username: string;
	language_code: string;
	allows_write_to_pm: boolean;
};

export type DiscordUser = {
	sub: string;
	username: string;
	email: string | null;
	picture: string;
	provider: string;
};

export type TwitterUser = {
	provider: string;
	id: string;
	username: string;
	displayName: string;
	profileUrl: string | null;
	photos: {
		value: string;
	}[];
	_raw: string;
	_json: {
		profile_image_url: string;
		id: string;
		name: string;
		username: string;
	};
};

export type LoginParams = {
	telegramInitData: string;
	appId: string;
};

export type AuthParams<T = {}> = T & {
	accessToken: string;
	clientId: string;
};

export type UserAttribute = {
	key: string;
	value: string;
};

export type AdType = {
	app: string;
	adId: string;
	_id: string;
	title: string;
	description: string;
	status: string;
	url: string;
	campaign: string;
	weight: number;
	updatedAt: string;
	attributes: UserAttribute[];
	__v: number;
};

export type ListAdsType = {
	ad: AdType;
	matchScore: number;
}[];

export type AdCampaignType = {
	title: string;
	desc: string;
	url: string;
	logo: string;
	verifyUrl: string;
	images: {
		position: MediaPosition;
		url: string;
		width?: number;
		height?: number;
	}[];
	videos: {
		position: MediaPosition;
		url: string;
	}[];
	contentType: AdsMediaType;
	id?: string;
	campaignId?: string;
	createdAt?: string;
	updatedAt?: string;
};

export type AdsType = {
	campaignId: string;
	adsCampaign: AdCampaignType[];
	matchScore: number;
	adsBlockId: string;
	bidForCPM: number;
};

export type CreateAdParams = {
	adId: string;
	app: string;
	title: string;
	description: string;
	url: string;
	campaign: string;
	weight: number;
	attributes: UserAttribute[];
};

export type DoAdResponse = {
	actionHistory: {
		_id: string;
		user: string;
		ad: string;
		app: string;
		type: string;
		status: string;
	};
	clickHistory: {
		_id: string;
		user: string;
		ad: string;
		app: string;
		type: string;
		status: string;
	};
};

export type CreateEventParams = {
	type: string;
	status: string;
	advertiser: string;
	data?: {
		[key: string]: any;
	};
};

export type StartViewAdResponse = {
	startTimestamp: number;
	nextTimestamp: number;
	endTimestamp: number;
};

export type TrackViewAdResponse = StartViewAdResponse & { isEnd: boolean };
