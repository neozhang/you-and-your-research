export type Card = {
	id: number;
	title: string;
	content: string;
	url: string;
	isLocal: boolean;
	saved?: boolean;
	savedName: string;
};
