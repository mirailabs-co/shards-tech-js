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
