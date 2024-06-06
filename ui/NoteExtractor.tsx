import React from "react";
import { useApp } from "../hooks";

// import extractNote from "../utils/ExtractNote";
import generateKnowledgeCards from "../utils/ExpandNote";
import { saveNote } from "../utils/SaveNote";

export const NoteExtractor = () => {
	const [url, setUrl] = React.useState("");
	const [content, setContent] = React.useState("");
	const [title, setTitle] = React.useState("");
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
					style={{
						backgroundColor: "#4CAF50",
						color: "white",
						padding: "10px 20px",
						border: "none",
						borderRadius: "4px",
						cursor: "pointer",
					}}
				>
					Extract
				</button>
			</div>
			{content && title && (
				<div
					style={{
						marginTop: "16px",
						padding: "16px",
						border: "1px solid #d1d5db",
						borderRadius: "4px",
						backgroundColor: "white",
					}}
				>
					<div
						style={{
							fontSize: "16px",
							fontWeight: "bold",
							marginBottom: "8px",
						}}
					>
						{title}
					</div>
					<div style={{ fontSize: "14px" }}>{content}</div>
					<button
						style={{
							marginRight: "8px",
							backgroundColor: "#4CAF50",
							color: "white",
							padding: "10px 20px",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
						}}
						onClick={() => saveNote({ title, content, url }, vault)}
					>
						Save
					</button>
					<button
						style={{
							backgroundColor: "#008CBA",
							color: "white",
							padding: "10px 20px",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
						}}
						onClick={() =>
							expandNoteToKnowledgeCards(title, content)
						}
					>
						Expand
					</button>
				</div>
			)}
		</>
	);
};

export default NoteExtractor;
