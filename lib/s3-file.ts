export interface S3File {
	key: string;
	size: number;
	modified: string;
	css?: Record<string, string>;
	base64?: string;
	metadata?: Record<string, any> & {
		width: number;
		height: number;
	};
}
