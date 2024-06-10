import React, { useEffect, useState } from "react";
import {
	SquarePlus,
	Tornado,
	CloudDownload,
	Check,
	ChevronRight,
	BetweenHorizontalEnd,
	Settings,
} from "lucide-react";
import { useApp } from "../hooks";
import generateCards from "../utils/generateCards";
import saveNote from "../utils/saveNote";
import insertCard from "../utils/insertCard";
import { MarkdownView } from "obsidian";

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
	const app = useApp() as any;
	const vault = app?.vault;
	const setting = app?.setting;
	const [activeEditor, setActiveEditor] = useState<any>(null);
	const [cursorPosition, setCursorPosition] = useState<any>(null);

	useEffect(() => {
		const handleActiveLeafChange = () => {
			const view = app?.workspace?.getActiveViewOfType(MarkdownView);
			if (view) {
				setActiveEditor(view.editor);
				setCursorPosition(view.editor.getCursor());
			} else if (activeEditor) {
				console.log(activeEditor.hasFocus(), activeEditor.getCursor());
				setCursorPosition(activeEditor.getCursor());
			}
		};

		// Initial check
		handleActiveLeafChange();

		// Listen for active leaf changes
		app?.workspace?.on("active-leaf-change", handleActiveLeafChange);

		// Cleanup function to remove the event listeners if the component unmounts
		return () => {
			app?.workspace?.off("active-leaf-change", handleActiveLeafChange);
		};
	}, [app, activeEditor]);

	const [url, setUrl] = React.useState("");
	const [content, setContent] = React.useState("");
	const [title, setTitle] = React.useState("");
	const [cards, setCards] = React.useState<Card[]>([]);
	const [isExtracting, setIsExtracting] = React.useState(false);
	const [isGenerating, setIsGenerating] = React.useState(false);
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
			await saveNote(
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
		await saveNote({ title, content, url }, vault);
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
							setSaved(false);
							extractNote(url || "https://example.com");
						}
					}}
					className="searchbox"
				/>
				<button
					onClick={() => {
						setCards([]); // Initialize cards state
						setSaved(false);
						extractNote(url || "https://example.com").finally(
							() => {
								setIsExtracting(false);
							}
						);
					}}
					className="btn btn-primary"
					disabled={isExtracting}
					title="Download content from URL"
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
							title="Save note"
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
									const newCards = await generateCards(
										content,
										openAIAPIKey,
										openAIModel
									);
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
							title="Generate notes from the given content"
						>
							<Tornado className="icon" strokeWidth={1} />{" "}
							<span>Generate</span>
						</button>
						<div
							className="model-selector"
							onClick={() => {
								setting.open();
								setting.openTabById("note-extractor");
							}}
							title="Open API settings"
						>
							<span>{openAIModel}</span>
							<ChevronRight className="icon" strokeWidth={1} />
						</div>
					</div>
				</div>
			)}
			{isGenerating && (
				<div className="loading-container">
					<div className="loading-animation">Generating...</div>
				</div>
			)}
			{cards && cards.length > 0 && (
				<ul style={{ listStyleType: "none", padding: 0 }}>
					{cards.map((card: any, index: any) => (
						<li
							key={index}
							className={`card card-secondary ${
								card.id === -1 ? "card-warning" : ""
							}`}
						>
							<>
								{card.id !== -1 ? (
									<div className="card-sidebar">
										{card.saved ? (
											<button
												className="btn btn-success"
												style={{
													pointerEvents: "none",
												}}
												title="Note saved"
											>
												<Check
													className="icon"
													color="var(--color-green)"
													strokeWidth={1}
												/>
											</button>
										) : (
											<button
												className="btn btn-secondary"
												onClick={(e) => {
													e.stopPropagation(); // Prevents the click event from bubbling up to the li element
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
												if (activeEditor) {
													insertCard(
														activeEditor,
														card,
														cursorPosition
													);
												} else {
													console.error(
														"No active editor found to insert the card into."
													);
												}
											}}
											title="Insert card into editor"
										>
											<BetweenHorizontalEnd
												className="icon"
												strokeWidth={1}
											/>
										</button>
									</div>
								) : (
									<div className="card-sidebar">
										<button
											className="btn btn-secondary"
											onClick={() => {
												setting.open();
												setting.openTabById(
													"note-extractor"
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
								<div
									className="card-main"
									onClick={() => {
										setExpandedCard(
											expandedCard === index
												? null
												: index
										); // Toggle or set the expanded card
									}}
								>
									<div className="card-title">
										{card.title}
									</div>
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
							</>
						</li>
					))}
				</ul>
			)}
		</>
	);
};

export default NoteExtractor;
