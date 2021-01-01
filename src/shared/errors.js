/* eslint-disable max-classes-per-file */
export class BadStatusError extends Error {
	constructor(status, message, response = null) {
		super(`Bad Status (${status}): ${message}`);
		this.name = 'BadStatusError';
		this.status = status;
		this.response = response;
	}
}

export class MissingGravatarProfileError extends BadStatusError {
	constructor(email, response) {
		super(response?.status, `${email} doesn't have a gravatar`, response);
		this.email = email;
	}
}
export class UnreachableGravatarProfileError extends BadStatusError {
	constructor(email, response) {
		super(response?.status, `Something went wrong while retrieving the gravatar profile of ${email}`, response);
		this.email = email;
	}
}
export class UnreachableGravatarPhotoError extends BadStatusError {
	constructor(email, response) {
		super(response?.status, `Something went wrong while retrieving the gravatar photo of ${email}`, response);
		this.email = email;
	}
}
