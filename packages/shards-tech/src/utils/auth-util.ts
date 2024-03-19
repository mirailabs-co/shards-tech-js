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
