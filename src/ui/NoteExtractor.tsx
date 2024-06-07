import React from "react";
import { useApp } from "../hooks";
import generateCards from "../utils/GenerateCards";
import { saveNote } from "../utils/SaveNote";

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
	const [cards, setCards] = React.useState([]);
	const [isExtracting, setIsExtracting] = React.useState(false);
	const [isGenerating, setIsGenerating] = React.useState(false);
	const { vault } = useApp() ?? {};

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
							extractNote(url || "https://example.com");
						}
					}}
					className="searchbox"
				/>
				<button
					onClick={() =>
						extractNote(url || "https://example.com").finally(
							() => {
								setIsExtracting(false);
							}
						)
					}
					className="btn btn-primary"
					disabled={isExtracting}
				>
					Extract
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
							onClick={() =>
								saveNote({ title, content, url }, vault)
							}
						>
							Save
						</button>
						<button
							className="btn btn-secondary"
							onClick={async () => {
								setIsGenerating(true);
								try {
									const newCards = await generateCards(
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
							Generate Cards
						</button>
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
						>
							<div className="card-title">{card.title}</div>
							<div className="card-content">{card.content}</div>
							{card.id !== -1 && (
								<div className="card-footer">
									<button
										className="btn btn-secondary"
										onClick={() =>
											saveNote(
												{
													title: card.title,
													content: card.content,
													url: card.url,
												},
												vault
											)
										}
									>
										Save
									</button>
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
