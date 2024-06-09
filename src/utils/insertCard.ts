// import { Editor } from "obsidian";

// interface Card {
// 	title: string;
// 	content: string;
// }

export const insertCard = (editor: any, card: any, cursor: any) => {
	const calloutText = `\n> [!${card.title}] \n> ${card.content}`;
	editor.replaceRange(calloutText, cursor);
};

export default insertCard;
