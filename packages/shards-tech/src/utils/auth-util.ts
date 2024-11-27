import jwt_decode from 'jwt-decode';
import { NoAccessToken, SDKError } from '../errors';
import { auth } from '../constants';

export const parseUserInfoFromAccessToken = async (accessToken: string): Promise<auth.TMiraiAccessToken | null> => {
	if (!accessToken) {
		throw new NoAccessToken(SDKError.NotFoundAccessToken, 'No access token found');
	}

	try {
		return (await jwt_decode(accessToken)) as auth.TMiraiAccessToken;
	} catch (e) {
		console.log(e);
	}

	return null;
};

export const sleep = (ms: number) => {
	return new Promise((resolve) => setTimeout(() => resolve(true), ms));
};

export const getLocalStorageAsObject = () => {
	const localStorageObject: Record<string, any> = {};

	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key) {
			try {
				localStorageObject[key] = JSON.parse(localStorage.getItem(key));
			} catch {
				localStorageObject[key] = localStorage.getItem(key);
			}
		}
	}
	return localStorageObject;
};
