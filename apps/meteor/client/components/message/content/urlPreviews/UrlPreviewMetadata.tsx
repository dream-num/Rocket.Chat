export type UrlPreviewMetadata = {
	type: 'image' | 'video' | 'audio' | 'sheet' | 'doc' | 'slide';
	originalType: string;
	url: string;
};
