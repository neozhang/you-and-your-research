import React, { useEffect, useState } from "react";
import {
	SquarePlus,
	Tornado,
	Play,
	Check,
	BetweenHorizontalEnd,
	Settings,
	Copy,
} from "lucide-react";
import { usePlugin } from "../hooks";
import { MarkdownView } from "obsidian";
import generateCards from "../utils/generateCards";
import saveNote from "../utils/saveNote";
import insertCard from "../utils/insertCard";
import extractDoc, { getNoteSuggestions } from "../utils/extractDoc";

interface Card {
	id: number;
	title: string;
	content: string;
	url: string;
	saved?: boolean;
}

export const NoteExtractor = () => {
	const plugin = usePlugin() as any;
	const app = plugin?.app;
	const vault = plugin?.app?.vault;
	const setting = plugin?.app?.setting;

	const [settings, setSettings] = React.useState(plugin?.settings);
	const [url, setUrl] = React.useState("");
	const [content, setContent] = React.useState("");
	const [title, setTitle] = React.useState("");
	const [cards, setCards] = React.useState<Card[]>([]);
	const [isExtracting, setIsExtracting] = React.useState(false);
	const [isGenerating, setIsGenerating] = React.useState(false);
	const [saved, setSaved] = React.useState(false);
	const [isLocal, setIsLocal] = React.useState(false);
	const [expandedCard, setExpandedCard] = React.useState<number | null>(null);
	const [suggestions, setSuggestions] = React.useState<string[]>([]);
	const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
		React.useState<number>(-1);
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

	const handleInputChange = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const input = e.target.value;
		setUrl(input);
		if (input.startsWith("[[")) {
			const matches = await getNoteSuggestions(input, vault);
			setSuggestions(matches);
			setSelectedSuggestionIndex(-1); // Reset the selected suggestion index
		} else {
			setSuggestions([]);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (suggestions.length > 0) {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedSuggestionIndex((prevIndex) =>
					prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
				);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedSuggestionIndex((prevIndex) =>
					prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
				);
			} else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
				e.preventDefault();
				setUrl(`[[${suggestions[selectedSuggestionIndex]}]]`);
				setSuggestions([]);
			}
		}
	};

	const extractNote = async (url: string) => {
		setIsExtracting(true);
		const doc = await extractDoc(url, vault);
		setIsLocal(doc.isLocal);
		setTitle(doc.title);
		setContent(doc.content);
		setIsExtracting(false);
	};

	// Update the card's saved status and trigger a re-render
	const handleSaveCard = async (index: number) => {
		const newCards = [...cards];
		const card = newCards[index];
		if (card) {
			saveNote(
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
		saveNote({ title, content, url }, vault);
		setSaved(true);
	};

	return (
		<>
			<div className="topbar">
				<form>
					<input
						type="text"
						placeholder="https://example.com or [[Note Title]]"
						value={url}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
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
						<Play className="icon" strokeWidth={1} />
					</button>
				</form>
				{suggestions.length > 0 && (
					<ul className="suggestions-list">
						{suggestions.map((suggestion, index) => (
							<li
								key={index}
								className={`suggestion-item ${
									index === selectedSuggestionIndex
										? "selected"
										: ""
								}`}
								onClick={() => {
									setUrl(`[[${suggestion}]]`);
									setSuggestions([]);
								}}
							>
								{suggestion}
							</li>
						))}
					</ul>
				)}
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
							style={{
								pointerEvents:
									saved || isLocal ? "none" : "auto",
							}}
							title="Save note"
						>
							{saved || isLocal ? (
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
								console.log("Generating with:", settings);
								try {
									const newCards = await generateCards(
										content,
										settings.openAIAPIKey,
										settings.openAIModel
									);
									// const cleanNewCards = newCards
									// 	.replace(/```json/g, "")
									// 	.replace(/```/g, "")
									// 	.trim();
									console.log(newCards);
									newCards.map((card: any) => {
										return {
											id: card.id,
											title: card.title,
											content: card.content,
											url:
												"[[" + (title as string) + "]]",
										};
									});
									setCards(newCards);
									console.log(newCards);
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
							<button className="btn btn-secondary">
								<Settings className="icon" strokeWidth={1} />
							</button>
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
				<ul className="generated-cards">
					{cards.map((card: any, index: any) => (
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
										{/* <button
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
										</button> */}
										<button
											className="btn btn-secondary"
											onClick={() => {
												navigator.clipboard
													.writeText(card.content)
													.then(() => {
														console.log(
															"Card content copied to clipboard"
														);
													})
													.catch((err) => {
														console.error(
															"Failed to copy card content: ",
															err
														);
													});
											}}
											title="Copy card to clipboard"
										>
											<Copy
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
							</>
						</li>
					))}
				</ul>
			)}
		</>
	);
};

export default NoteExtractor;
