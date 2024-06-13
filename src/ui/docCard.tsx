import React from "react";
import { SquarePlus, Tornado, BookOpen, Settings } from "lucide-react";
import saveNote, { openNote } from "../utils/saveNote";
import generateCards from "../utils/generateCards";
import { Card } from "../types";

interface DocCardProps {
	settings: any;
	settingView: any;
	workspace: any;
	app: any;
	vault: any;
	doc: Card;
	onSaveDoc: (doc: Card) => void;
	onGenerate: (cards: Card[]) => void;
}

export const DocCard: React.FC<DocCardProps> = ({
	settings,
	settingView,
	workspace,
	app,
	vault,
	doc,
	onSaveDoc,
	onGenerate,
}) => {
	const [isGenerating, setIsGenerating] = React.useState(false);

	const handleSave = async () => {
		if (doc.saved) {
			openNote(settings.savedLocation, doc.savedName, vault, workspace);
		} else if (doc.isLocal && doc.savedPath) {
			openNote(doc.savedPath, doc.savedName, vault, workspace);
		} else {
			const newDoc = { ...doc };
			saveNote(
				{
					id: 1,
					title: doc.title,
					content: doc.content,
					url: doc.url,
					isLocal: true,
					savedName: "",
				},
				vault,
				app,
				settings.savedLocation,
				settings.savedTag
			).then((f) => {
				newDoc.savedName = f;
				newDoc.saved = true;
				onSaveDoc(newDoc);
			});
		}
	};

	return (
		<div className="doc-container">
			<div
				className={`card card-primary ${
					doc.id === -1 ? "card-warning" : ""
				}`}
			>
				<div className="card-title">{doc.title}</div>
				<div className="card-content">{doc.content}</div>
				<div
					className="card-footer"
					style={doc.id === -1 ? { display: "none" } : {}}
				>
					<button
						className="btn btn-primary"
						onClick={handleSave}
						title={
							doc.saved || doc.isLocal
								? "Open the note"
								: "Save to your vault"
						}
					>
						{doc.saved ? (
							<>
								<BookOpen className="icon" strokeWidth={1} />
								<span>Open</span>
							</>
						) : (
							<>
								<SquarePlus className="icon" strokeWidth={1} />
								<span>Save</span>
							</>
						)}
					</button>
					<button
						className="btn btn-primary"
						onClick={async () => {
							setIsGenerating(true);
							onGenerate([]);
							try {
								const newCards = await generateCards(
									doc.content,
									settings.openAIAPIKey,
									settings.openAIAPIEndpoint,
									settings.openAIModel
								);
								const updatedCards = newCards.map(
									(card: any) => {
										return {
											id: card.id,
											title: card.title,
											content: card.content,
											url: "[[" + card.title + "]]",
											isLocal: false,
											saved: false,
											savedName: "",
										};
									}
								);
								onGenerate(updatedCards);
							} finally {
								setIsGenerating(false);
							}
						}}
						disabled={isGenerating}
						title="Generate notes from the given content"
					>
						<Tornado className="icon" strokeWidth={1} />
						<span>Research</span>
					</button>
					<div
						className="model-selector"
						onClick={() => {
							settingView.open();
							settingView.openTabById("you-and-your-research");
						}}
						title="Open API settings"
					>
						<button className="btn btn-secondary">
							<Settings className="icon" strokeWidth={1} />
						</button>
					</div>
				</div>
			</div>
			{isGenerating && (
				<div className="loading-animation">
					Researching in progress...
				</div>
			)}
		</div>
	);
};

export default DocCard;
