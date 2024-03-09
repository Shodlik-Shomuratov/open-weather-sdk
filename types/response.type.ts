enum StatusEnum {
	OK,
	ERROR,
}

export type ResponseType<T> = {
	data: T | null;
	status: "OK" | "ERROR";
	errorMessage: string | null;
};
