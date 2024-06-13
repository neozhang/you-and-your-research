import React from "react";
import { SquarePlus, BookOpen, Settings, Copy } from "lucide-react";
import { saveNote, openNote } from "../utils/saveNote";
import generateCards from "../utils/generateCards";
import { Card } from "../types";

interface GenerateCardsProps {
	settings: any;
	settingView: any;
	workspace: any;
	app: any;
	vault: any;
	cards: Card[];
	onSaveCard: (cards: Card[]) => void;
}

export const GenerateCards: React.FC<GenerateCardsProps> = ({
	settings,
	settingView,
	workspace,
	app,
	vault,
	cards,
	onSaveCard,
}) => {
	const [expandedCard, setExpandedCard] = React.useState<number | null>(null);

	const handleSaveCard = async (index: number) => {
		const newCards = [...cards];
		const card = newCards[index];

		const f = await saveNote(
			{
				id: 1,
				title: card.title,
				content: card.content,
				url: card.url,
				isLocal: card.isLocal,
				savedName: card.savedName,
			},
			vault,
			app,
			settings.savedLocation,
			settings.savedTag
		);
		newCards[index].savedName = f;
		newCards[index].saved = true;
		onSaveCard(newCards);
	};

	return (
		<ul className="generated-cards">
			{cards.map((card: Card, index: number) => (
				<li
					key={index}
					className={`card card-secondary ${
						card.id === -1 ? "card-warning" : ""
					}`}
				>
					<>
						<div
							className="card-main"
							onClick={() => {
								setExpandedCard(
									expandedCard === index ? null : index
								); // Toggle or set the expanded card
							}}
						>
							<div className="card-title">{card.title}</div>
							<div
								className={`card-content ${
									expandedCard === index ? "card-full" : ""
								}`}
							>
								{card.content}
							</div>
						</div>
						{card.id !== -1 ? (
							<div className="card-sidebar">
								{card.saved ? (
									<button
										className="btn btn-success"
										title="Open the saved note"
										onClick={() =>
											openNote(
												settings.savedLocation,
												card.savedName,
												vault,
												workspace
											)
										}
									>
										<BookOpen
											className="icon"
											strokeWidth={1}
										/>
									</button>
								) : (
									<button
										className="btn btn-secondary"
										onClick={(e) => {
											handleSaveCard(index);
										}}
										title="Save note"
									>
										<SquarePlus
											className="icon"
											strokeWidth={1}
										/>
									</button>
								)}
								<button
									className="btn btn-secondary"
									onClick={() => {
										navigator.clipboard.writeText(
											"#### " +
												card.title +
												"\n\n" +
												card.content
										);
									}}
									title="Copy card to clipboard"
								>
									<Copy className="icon" strokeWidth={1} />
								</button>
							</div>
						) : (
							<div className="card-sidebar">
								<button
									className="btn btn-secondary"
									onClick={() => {
										settingView.open();
										settingView.openTabById(
											"you-and-your-research"
										);
									}}
									title="Open settings"
								>
									<Settings
										className="icon"
										strokeWidth={1}
									/>
								</button>
							</div>
						)}
					</>
				</li>
			))}
		</ul>
	);
};

export default GenerateCards;
