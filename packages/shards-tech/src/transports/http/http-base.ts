import axios, { AxiosRequestConfig } from 'axios';
import { HttpConnectionError } from '../../errors/HttpConnectionError';

export abstract class BaseHttpService {
	protected apiUrl: string;

	constructor(apiUrl: string) {
		this.apiUrl = apiUrl;
	}

	protected async setHeaders(config: AxiosRequestConfig, headers: Record<string, unknown> = {}): Promise<void> {
		config.headers = {
			...headers,
			'Content-Type': 'application/json',
			Accept: 'application/json',
		};
	}

	public sendGet = async <T>(
		path: string,
		params: Record<string, unknown> = {},
		headers: Record<string, unknown> = {},
	): Promise<T> => {
		const urlPath = path.startsWith('/') ? path : `/${path}`;
		const apiUrl = new URL(`${this.apiUrl}${urlPath}`);

		for (const key in params) {
			apiUrl.searchParams.append(key, String(params[key]));
		}

		const config: AxiosRequestConfig = {
			method: 'GET',
			url: apiUrl.toString(),
		};

		await this.setHeaders(config, headers);

		const response = await axios(config);
		console.debug('[HTTP] GET: ', path);

		if (response.status === 200 || response.status === 201) {
			return response.data?.data as T;
		}

		throw new HttpConnectionError(response?.data?.errorCode, response.data?.message);
	};

	public sendPost = async <T>(
		path: string,
		data?: Record<string, unknown>,
		headers: Record<string, unknown> = {},
	): Promise<T> => {
		const config: AxiosRequestConfig = {
			method: 'POST',
			data: data,
			baseURL: this.apiUrl,
			url: path,
			validateStatus: () => true,
		};

		await this.setHeaders(config, headers);

		const response = await axios(config);
		console.debug('[HTTP] POST: ', path);

		if (response.status === 200 || response.status === 201) {
			return response.data?.data as T;
		}

		const message = response?.data?.message || response.statusText;
		throw new HttpConnectionError(response?.data?.errorCode, message);
	};

	public sendDelete = async <T>(
		path: string,
		data?: Record<string, unknown>,
		headers: Record<string, unknown> = {},
	): Promise<T> => {
		const config: AxiosRequestConfig = {
			method: 'DELETE',
			data: data,
			baseURL: this.apiUrl,
			url: path,
			validateStatus: () => true,
		};

		await this.setHeaders(config, headers);

		const response = await axios(config);
		console.debug('[HTTP] DELETE: ', path);

		if (response.status === 200 || response.status === 201) {
			return response.data?.data as T;
		}

		const message = response?.data?.message || response.statusText;
		throw new HttpConnectionError(response?.data?.errorCode, message);
	};

	public sendPut = async <T>(
		path: string,
		data?: Record<string, unknown>,
		headers: Record<string, unknown> = {},
	): Promise<T> => {
		const config: AxiosRequestConfig = {
			method: 'PUT',
			data: data,
			baseURL: this.apiUrl,
			url: path,
			validateStatus: () => true,
		};

		await this.setHeaders(config, headers);

		const response = await axios(config);
		console.debug('[HTTP] PUT: ', path);

		if (response.status === 200 || response.status === 201) {
			return response.data?.data as T;
		}

		const message = response?.data?.message || response.statusText;
		throw new HttpConnectionError(response?.data?.errorCode, message);
	};
}
