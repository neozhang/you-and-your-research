import React from "react";
import { SquarePlus, Tornado, CloudDownload, Check } from "lucide-react";
import { useApp } from "../hooks";
import GenerateCards from "../utils/generateCards";
import SaveNote from "../utils/saveNote";

interface Card {
	id: number;
	title: string;
	content: string;
	url: string;
	saved?: boolean;
}

export const NoteExtractor = ({
	openAIAPIKey,
	openAIModel,
}: {
	openAIAPIKey: string;
	openAIModel: string;
}) => {
	const [url, setUrl] = React.useState("");
	const [content, setContent] = React.useState("");
	const [title, setTitle] = React.useState("");
	const [cards, setCards] = React.useState<Card[]>([]);
	const [isExtracting, setIsExtracting] = React.useState(false);
	const [isGenerating, setIsGenerating] = React.useState(false);
	const { vault } = useApp() ?? {};
	const [saved, setSaved] = React.useState(false);
	const [expandedCard, setExpandedCard] = React.useState<number | null>(null);

	// Use Jina AI to extract texts from given URL
	const jinaAPI = "https://r.jina.ai/";
	const extractNote = async (url: string) => {
		try {
			setIsExtracting(true);
			const response = await fetch(jinaAPI + url, {
				method: "GET",
				headers: {
					Accept: "application/json",
				},
			});
			const data = await response.json();
			setContent(data.data.content);
			setTitle(data.data.title.replace(/[\\/:*?"<>|]/g, "_"));
		} catch (error) {
			console.error("Failed to fetch data", error);
			throw new Error("Failed to fetch data");
		} finally {
			setIsExtracting(false);
		}
	};

	// Update the card's saved status and trigger a re-render
	const handleSaveCard = async (index: number) => {
		const newCards = [...cards];
		const card = newCards[index];
		if (card) {
			await SaveNote(
				{
					title: card.title,
					content: card.content,
					url: card.url,
				},
				vault
			);
			card.saved = true;
			setCards(newCards); // This will update the state and re-render the component
		}
	};

	const handleSave = async () => {
		await SaveNote({ title, content, url }, vault);
		setSaved(true);
	};

	return (
		<>
			<div className="topbar">
				<input
					type="text"
					placeholder="https://example.com"
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							setCards([]); // Initialize cards state
							extractNote(url || "https://example.com");
						}
					}}
					className="searchbox"
				/>
				<button
					onClick={() => {
						setCards([]); // Initialize cards state
						extractNote(url || "https://example.com").finally(
							() => {
								setIsExtracting(false);
							}
						);
					}}
					className="btn btn-primary"
					disabled={isExtracting}
				>
					<CloudDownload className="icon" strokeWidth={1} />
				</button>
			</div>
			{isExtracting && (
				<div className="loading-container">
					<div className="loading-animation">Loading...</div>
				</div>
			)}
			{content && title && (
				<div className="card card-primary">
					<div className="card-title">{title}</div>
					<div className="card-content">{content}</div>
					<div className="card-footer">
						<button
							className="btn btn-primary"
							onClick={handleSave}
							style={{ pointerEvents: saved ? "none" : "auto" }}
						>
							{saved ? (
								<>
									<Check
										className="icon"
										color="green"
										strokeWidth={1}
									/>
									<span>Saved</span>
								</>
							) : (
								<>
									<SquarePlus
										className="icon"
										strokeWidth={1}
									/>
									<span>Save</span>
								</>
							)}
						</button>
						<button
							className="btn btn-secondary"
							onClick={async () => {
								setIsGenerating(true);
								try {
									const newCards = await GenerateCards(
										content,
										openAIAPIKey,
										openAIModel
									);
									console.log(newCards, typeof newCards);
									const cleanNewCards = newCards
										.replace(/```json/g, "")
										.replace(/```/g, "")
										.trim();
									const cleanNewCardsJSON = JSON.parse(
										cleanNewCards
									).map((card: any) => {
										return {
											id: card.id,
											title: card.title,
											content: card.content,
											url:
												"[[" + (title as string) + "]]",
										};
									});
									setCards(cleanNewCardsJSON);
									console.log(cleanNewCardsJSON);
								} finally {
									setIsGenerating(false);
								}
							}}
							disabled={isGenerating}
						>
							<Tornado className="icon" strokeWidth={1} />{" "}
							<span>Generate Cards</span>
						</button>
						<div className="model-selector">
							<span className="model-name">{openAIModel}</span>
						</div>
					</div>
				</div>
			)}
			{isGenerating && (
				<div className="loading-container">
					<div className="loading-animation">Generating Cards...</div>
				</div>
			)}
			{cards && cards.length > 0 && (
				<ul style={{ listStyleType: "none", padding: 0 }}>
					{cards.map((card: any, index: any) => (
						<li
							key={index}
							className={`card card-secondary ${
								card.id === -1 && "card-warning"
							}`}
							onClick={() => {
								setExpandedCard(
									expandedCard === index ? null : index
								); // Toggle or set the expanded card
							}}
						>
							<div>
								<div className="card-title">{card.title}</div>
								<div
									className={`card-content ${
										expandedCard === index
											? "card-full"
											: ""
									}`}
								>
									{card.content}
								</div>
							</div>
							{card.id !== -1 && (
								<div className="card-footer">
									{card.saved ? (
										<div
											className="btn btn-success"
											style={{ pointerEvents: "none" }}
										>
											<Check
												className="icon"
												color="var(--color-green)"
												strokeWidth={1}
											/>
										</div>
									) : (
										<button
											className="btn btn-secondary"
											onClick={(e) => {
												e.stopPropagation(); // Prevents the click event from bubbling up to the li element
												handleSaveCard(index);
											}}
										>
											<SquarePlus
												className="icon"
												strokeWidth={1}
											/>
										</button>
									)}
								</div>
							)}
						</li>
					))}
				</ul>
			)}
		</>
	);
};

export default NoteExtractor;
