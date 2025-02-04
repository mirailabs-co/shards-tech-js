export namespace auth {
	export type TMiraiAccessToken = {
		id_token?: string;
		access_token: string;
		expires_in: number;
		refresh_expires_in: number;
		refresh_token: string;
		type?: string;
		sessionState?: string;
		scope?: string;
		sub: string;
		aud: string;
	};

	export type TMiraiToken = {
		access_token: string;
		expires_in?: number;
		refresh_expires_in?: number;
		refresh_token?: string;
		type?: string;
		sessionState?: string;
		scope?: string;
	};

	export type TMiraiUserData = {
		firstName: string;
		lastName: string;
		sub: string;
		id: string;
		emailVerified: true;
		emailVerifiedAt: string;
		givenName: string;
		familyName: string;
		exp: number;
		azp: string;
		status: boolean;
		username: string;
		email_verified: true;
		createdAt: string;
		updatedAt: string;
		email: string;
		socials?: TUserSocial[] | undefined;
	};

	export type TUserSocial = {
		id: string;
		createdAt: string;
		updatedAt: string;
		type: SocialType;
		provider: SocialType;
		socialId: string;
		email: string;
		picture: unknown;
		metadata?: TUserSocialMetadata;
		username: string;
	};

	type SocialType = 'facebook' | 'google';

	export type TUserSocialMetadata = {
		sub: string;
		name: string;
		email: string;
		locale: string;
		picture: string;
		provider: string;
		given_name: string;
		family_name: string;
		email_verified: boolean;
	};

	export type TAuthUrl = {
		url: string;
		expiredTime: number;
	};

	export type TSocialPicture = {
		data: TSocialPictureData;
	};

	export type TSocialPictureData = {
		height: number;
		url: string;
		is_silhouette: boolean;
		width: number;
	};
}
