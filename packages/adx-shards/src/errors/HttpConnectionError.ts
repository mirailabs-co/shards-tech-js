class HttpConnectionError extends Error {
	private errorCode: number;
	constructor(errorCode: number, message: string) {
		super(message);
		this.errorCode = errorCode;
	}

	toJSON() {
		return {
			message: this.message,
			errorCode: this.errorCode,
		};
	}
}

export { HttpConnectionError };
