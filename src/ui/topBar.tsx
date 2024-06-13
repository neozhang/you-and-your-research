import React from "react";
import { ChevronRight } from "lucide-react";
import extractDoc, { getNoteSuggestions } from "../utils/extractDoc";
import { Card } from "../types";

interface TopBarProps {
	settings: any;
	vault: any;
	onExtract: (doc: Card) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
	settings,
	vault,
	onExtract,
}) => {
	const [inputValue, setInputValue] = React.useState("");
	const [suggestions, setSuggestions] = React.useState<string[]>([]);
	const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
		React.useState(-1);
	const [isExtracting, setIsExtracting] = React.useState(false);

	const handleInputChange = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const input = e.target.value;
		setInputValue(input); // Update only the input value state
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
				setInputValue(`[[${suggestions[selectedSuggestionIndex]}]]`);
				setSuggestions([]);
			}
		}
	};

	const extractNote = (url: string, apiKey: string) => {
		setIsExtracting(true);
		extractDoc(url, apiKey, vault).then((newDoc) => {
			onExtract(newDoc);
			setIsExtracting(false);
		});
	};

	return (
		<div className="topbar">
			<form>
				<input
					type="text"
					placeholder="https://example.com or [[Note Title]]"
					value={inputValue} // Use the new state for the input value
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					className="searchbox"
				/>

				<button
					onClick={() => {
						extractNote(
							inputValue || "https://example.com",
							settings.jinaAIAPIKey
						);
					}}
					className="btn btn-primary"
					disabled={isExtracting}
					title="Extract content from URL"
				>
					<ChevronRight className="icon" strokeWidth={1} />
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
								setInputValue(`[[${suggestion}]]`);
								setSuggestions([]);
							}}
						>
							{suggestion}
						</li>
					))}
				</ul>
			)}
			{isExtracting && (
				<div className="loading-animation">
					Loading your document...
				</div>
			)}
		</div>
	);
};

export default TopBar;
