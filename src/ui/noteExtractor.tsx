import React from "react";
import TopBar from "./topBar";
import DocCard from "./docCard";
import GenerateCards from "./genCards";
import { usePlugin } from "../hooks";
import { Card } from "../types";

export const NoteExtractor: React.FC = () => {
	const plugin = usePlugin() as any;
	const app = plugin?.app;
	const workspace = plugin?.app?.workspace;
	const vault = plugin?.app?.vault;
	const settingView = plugin?.app?.setting;
	const settings = plugin?.settings;

	const [doc, setDoc] = React.useState<Card>({
		id: 0,
		title: "",
		content: "",
		url: "",
		isLocal: false,
		saved: false,
		savedName: "",
	});

	const [cards, setCards] = React.useState<Card[]>([]);

	const handleExtract = (doc: Card) => {
		setDoc(doc);
		setCards([]);
	};

	const handleSaveDoc = (doc: Card) => {
		setDoc(doc);
	};

	const handleGenerate = (cards: Card[]) => {
		setCards((prevCards) => [...prevCards, ...cards]);
	};

	const handleSaveCard = (cards: Card[]) => {
		setCards(cards);
	};

	return (
		<div className="note-extractor-container">
			<TopBar
				settings={settings}
				vault={vault}
				onExtract={handleExtract}
			/>
			{doc.content && doc.title && (
				<DocCard
					settings={settings}
					settingView={settingView}
					workspace={workspace}
					app={app}
					vault={vault}
					doc={doc}
					onSaveDoc={handleSaveDoc}
					onGenerate={handleGenerate}
				/>
			)}

			{cards && cards.length > 0 && (
				<GenerateCards
					settings={settings}
					settingView={settingView}
					workspace={workspace}
					app={app}
					vault={vault}
					cards={cards}
					onSaveCard={handleSaveCard}
				/>
			)}
		</div>
	);
};

export default NoteExtractor;
