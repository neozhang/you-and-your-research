import React from "react";
import { useApp } from "../hooks";

// import extractNote from "../utils/ExtractNote";
import generateKnowledgeCards from "../utils/GenerateCards";
import { saveNote } from "../utils/SaveNote";

export const NoteExtractor = () => {
	const [url, setUrl] = React.useState("");
	const [content, setContent] = React.useState("");
	const [title, setTitle] = React.useState("");
	const [cards, setCards] = React.useState([]);
	const { vault } = useApp();

	// Use Jina AI to extract texts from given URL
	const API = "https://r.jina.ai/";
	const extractNote = async (url: string) => {
		try {
			const response = await fetch(API + url, {
				method: "GET",
				headers: {
					Accept: "application/json",
				},
			});
			const data = await response.json();
			setContent(data.data.content);
			setTitle(data.data.title);
			console.log(data.data.content, data.data.title);
		} catch (error) {
			console.error("Failed to fetch data", error);
			throw new Error("Failed to fetch data");
		}
	};

	return (
		<>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					marginBottom: "8px",
				}}
			>
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
					style={{
						padding: "10px 20px",
						border: "1px solid #d1d5db",
						borderRadius: "4px",
						flexGrow: 1, // input will expand to take remaining space
						marginRight: "8px", // space between input and button
					}}
				/>
				<button
					onClick={() => extractNote(url || "https://example.com")}
					className="btn btn-primary"
				>
					Extract
				</button>
			</div>
			{content && title && (
				<div className="card">
					<div className="card-title">{title}</div>
					<div className="card-content">{content}</div>
					<button
						className="btn btn-primary"
						onClick={() => saveNote({ title, content, url }, vault)}
					>
						Save
					</button>
					<button
						className="btn btn-secondary"
						onClick={async () => {
							const newCards = await generateKnowledgeCards(
								content
							);
							const cleanNewCards = newCards
								.replace(/```json/g, "")
								.replace(/```/g, "")
								.trim();

							setCards(JSON.parse(cleanNewCards));
						}}
					>
						Generate Cards
					</button>
				</div>
			)}
			{cards && cards.length > 0 && (
				<ul style={{ listStyleType: "none", padding: 0 }}>
					{cards.map((card, index) => (
						<li key={index} className="card">
							<div className="card-title">{card.title}</div>
							<div className="card-content">{card.content}</div>
						</li>
					))}
				</ul>
			)}
		</>
	);
};

export default NoteExtractor;
