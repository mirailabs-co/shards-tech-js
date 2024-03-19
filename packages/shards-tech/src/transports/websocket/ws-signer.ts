/* eslint-disable @typescript-eslint/no-unused-vars */
import { connect, io } from 'socket.io-client';
import { WebSocketConnection } from './connection-wrapper';
import { BaseWebSocketService, IWSOpts } from './ws-base';

export class SignerWebSocketService extends BaseWebSocketService {
	private url: string;
	private _accessToken: string;

	public socket: WebSocketConnection;

	constructor(opts: IWSOpts) {
		super(opts);

		this.url = opts.url;
		this._accessToken = opts.accessToken;
	}

	public disconnect = async () => {
		return this.socket.disconnect();
	};

	get accessToken(): string {
		return this._accessToken;
	}
	set accessToken(value: string) {
		this._accessToken = value;
	}

	public establish = async (acknowledgement?: boolean): Promise<WebSocketConnection> => {
		const headers = await this.getHeaders(this.accessToken);

		// const socket = io(this.url, {
		// 	autoConnect: false,
		// 	reconnection: true,
		// 	transportOptions: {
		// 		websocket: {
		// 			extraHeaders: headers,
		// 		},
		// 	},
		// 	extraHeaders: headers,
		// 	transports: ['websocket'],
		// 	auth: headers,
		// });

		const socket = connect(this.url, {
			autoConnect: false,
			reconnection: true,

			// transportOptions: {
			//   websocket: {
			//     extraHeaders: {
			//       authorization:
			//         "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhMGJhYzYwNC0wZmE0LTQ0N2EtYTNkZS00ZGVmZjAyMDA4YzQiLCJqdGkiOiIyYzQyZmQzZC04M2FkLTQzZTEtOWE4NS00NjRlZjRlNzhkYjkiLCJleHAiOjE2OTI5NDYxNTcsInN1YiI6ImJmYjRmZmY2LWUzMTQtNDI2OS1iYTAyLWRmYzU5MTk1MzRjZiIsInNjb3BlcyI6WyJvcGVuaWQiLCJlbWFpbCIsIm9mZmxpbmVfYWNjZXNzIiwicHJvZmlsZSJdLCJlbWFpbCI6ImR1Y3BodW9jLnQ5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiUGjGsOG7m2MgTmd1eeG7hW4gxJDhu6ljIiwiZ2l2ZW5fbmFtZSI6IlBoxrDhu5tjIiwiZmFtaWx5X25hbWUiOiJOZ3V54buFbiDEkOG7qWMiLCJpc3MiOiJodHRwczovL2lkLWRldi12Mi5taXJhaWxhYnMuY28iLCJhenAiOiJhMGJhYzYwNC0wZmE0LTQ0N2EtYTNkZS00ZGVmZjAyMDA4YzQiLCJpYXQiOjE2OTI4NTk3NTd9.CoeBHfbUk3hC9PGz4c51dOojXptKR78OsfcSEoQY6PVulcEE8tjxDEOqMtlDU6-eyKDTg9qiQRNxtXf5iHVFeNbZ9E32JdyFsDiwSGjaD1HRpzq7Xm8QkA9SPFO0QQP6BSNgHIgg4fYNrii0t-0r7wojg_sfgjDDyCX_vmZY4TYCIjr9TS9vrELupcW716Y_seiGr6WQfy6HyfTbVSGRb4yviNcOMjDeORht2JuJajLsrMSQsYGXcx_V04uXrcC1SY0xi7LnsVQfQSWyKTf6xoTix6cm3gnzbyZYZJrPqDJtDu2FRxBLNLR53NNc8v3UjaJREjdcNgvvLGarw_HY61Azsqh5LaE_KZuZeBxtBBVjlN209N7hRNPrKv_RbnTnIBvoGjv0zjlN4r42_DPGWojnaqkuConrY2W7daQHHPMdf7XnnlfPL7g3osyO_8TMFLVjdxBEr1cPe6YZERvMMiVbDYg3fEps4dsjabJE4CkaTDt5j1CI8EjiMjhPnrbeq2htd4RsqjDI7enK0l4HAvy-kZJcPNXY6JRgq2R0C_Qh1gSSu8nd_RuutKDmEQ-r_uf6j5KsF-jTRs8qRgPEeO3DLgtDjSl2TLTWXEA8kaSy6Gj41rCyHO5pwPCdK2ySqe1oKIltCwLDAk4MfA83-yPVmeS3B6LZl79yCvpTczE",
			//     },
			//   },
			// },
			// extraHeaders: {
			//   authorization:
			//     "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhMGJhYzYwNC0wZmE0LTQ0N2EtYTNkZS00ZGVmZjAyMDA4YzQiLCJqdGkiOiIyYzQyZmQzZC04M2FkLTQzZTEtOWE4NS00NjRlZjRlNzhkYjkiLCJleHAiOjE2OTI5NDYxNTcsInN1YiI6ImJmYjRmZmY2LWUzMTQtNDI2OS1iYTAyLWRmYzU5MTk1MzRjZiIsInNjb3BlcyI6WyJvcGVuaWQiLCJlbWFpbCIsIm9mZmxpbmVfYWNjZXNzIiwicHJvZmlsZSJdLCJlbWFpbCI6ImR1Y3BodW9jLnQ5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiUGjGsOG7m2MgTmd1eeG7hW4gxJDhu6ljIiwiZ2l2ZW5fbmFtZSI6IlBoxrDhu5tjIiwiZmFtaWx5X25hbWUiOiJOZ3V54buFbiDEkOG7qWMiLCJpc3MiOiJodHRwczovL2lkLWRldi12Mi5taXJhaWxhYnMuY28iLCJhenAiOiJhMGJhYzYwNC0wZmE0LTQ0N2EtYTNkZS00ZGVmZjAyMDA4YzQiLCJpYXQiOjE2OTI4NTk3NTd9.CoeBHfbUk3hC9PGz4c51dOojXptKR78OsfcSEoQY6PVulcEE8tjxDEOqMtlDU6-eyKDTg9qiQRNxtXf5iHVFeNbZ9E32JdyFsDiwSGjaD1HRpzq7Xm8QkA9SPFO0QQP6BSNgHIgg4fYNrii0t-0r7wojg_sfgjDDyCX_vmZY4TYCIjr9TS9vrELupcW716Y_seiGr6WQfy6HyfTbVSGRb4yviNcOMjDeORht2JuJajLsrMSQsYGXcx_V04uXrcC1SY0xi7LnsVQfQSWyKTf6xoTix6cm3gnzbyZYZJrPqDJtDu2FRxBLNLR53NNc8v3UjaJREjdcNgvvLGarw_HY61Azsqh5LaE_KZuZeBxtBBVjlN209N7hRNPrKv_RbnTnIBvoGjv0zjlN4r42_DPGWojnaqkuConrY2W7daQHHPMdf7XnnlfPL7g3osyO_8TMFLVjdxBEr1cPe6YZERvMMiVbDYg3fEps4dsjabJE4CkaTDt5j1CI8EjiMjhPnrbeq2htd4RsqjDI7enK0l4HAvy-kZJcPNXY6JRgq2R0C_Qh1gSSu8nd_RuutKDmEQ-r_uf6j5KsF-jTRs8qRgPEeO3DLgtDjSl2TLTWXEA8kaSy6Gj41rCyHO5pwPCdK2ySqe1oKIltCwLDAk4MfA83-yPVmeS3B6LZl79yCvpTczE",
			// },
			transports: ['websocket'],
			upgrade: true,
			withCredentials: true,
			auth: headers,
		});

		const ws = new WebSocketConnection(socket, acknowledgement);

		this.socket = ws;

		return ws;
	};
}
