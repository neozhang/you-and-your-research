// import { Editor } from "obsidian";

// interface Card {
// 	title: string;
// 	content: string;
// }

export const insertCard = (editor: any, card: any, cursor: any) => {
	const text = `\n${card.title}\n\n${card.content}\n`;
	editor.replaceRange(text, cursor);
	editor.focus();
	editor.scrollIntoView({ from: cursor, to: cursor }, true);
};

export default insertCard;
