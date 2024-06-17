import { requestUrl } from "obsidian";
import { Card } from "../types";

export const generateCards = async (
	doc: string,
	openAIAPIKey: string,
	openAIAPIEndpoint: string,
	openAIModel: string
): Promise<Card[]> => {
	function splitText(
		text: string,
		maxWords: number = 2000,
		overlapWords: number = 200
	): string[] {
		const words = text.split(" ");

		// Calculate the split indices considering overlap
		const chunks: string[] = [];
		for (let i = 0; i < words.length; i += maxWords - overlapWords) {
			const chunk = words.slice(i, i + maxWords).join(" ");
			chunks.push(chunk);
		}

		return chunks;
	}

	function splitTextByParagraphs(
		text: string,
		maxWords: number = 2000
	): string[] {
		const paragraphs = text.split(/\n\s*\n/); // Split by paragraphs
		const chunks: string[] = [];
		let currentChunk: string[] = [];
		let currentWordCount = 0;

		for (const paragraph of paragraphs) {
			const wordCount = paragraph.split(" ").length;

			// Check if the paragraph is a heading
			const isHeading = /^\s*#/.test(paragraph);

			if (isHeading) {
				// If heading, start a new chunk
				if (currentChunk.length > 0) {
					chunks.push(currentChunk.join("\n\n"));
				}
				currentChunk = [paragraph];
				currentWordCount = wordCount;
			} else {
				// Normal paragraph logic
				if (currentWordCount + wordCount <= maxWords) {
					currentChunk.push(paragraph);
					currentWordCount += wordCount;
				} else {
					if (currentChunk.length > 0) {
						chunks.push(currentChunk.join("\n\n"));
					}
					currentChunk = [paragraph];
					currentWordCount = wordCount;
				}
			}
		}

		// Add the last chunk if there's any remaining content
		if (currentChunk.length > 0) {
			chunks.push(currentChunk.join("\n\n"));
		}

		return chunks;
	}

	const docChunks = openAIModel === "gpt-3.5-turbo" ? splitText(doc) : [doc];

	const results: any[] = [];

	const prompt = `You are an multilingual expert in generating notes from documents. \n
					Please respond in the same language as the user input provided. \n
					The notes will need to be in JSON array using the schema: [{id: id, title: "title", content: "content"}]. \n
					Remember, the language of the notes must match the language of the user input. \n
					Generate notes from the following doc. Instructions: \n
					1. The titles of the notes should be short phrases which can be distinguishable with explicit subject matters, and holistically present the main logic structure of the provided doc. \n
					2. The content of the notes should start with a summary of the data, facts or insights from the original document, followed by quotes of all relevant pieces from the original document as supporting. \n
					3. When quoting from the original document, use Markdown blockquotes (i.e. '> '). DO NOT inline quotes. Add 1 line break before and after the blockquote. \n
					4. Include the author name and original source of each quote. If you don't know the author, leave it empty. \n
					5. Include relevant images (use Markdown to link the images). \n
					6. Notes should be information-rich. Only keep the most informative notes. Combine related notes into one note. \n`;

	const prompt2 = `You will be given some paragraphs of texts. Use the following instructions to process ALL the provided paragraphs. Remain the original language of the provided texts. \n
					1. Exclude the headings and promotional paragraphs. Include all the other paragraphs, especially the quoted paragraphs. \n
					2. Group paragraphs based on the similarity of meanings. \n
					3. Give each group a new $title$, which should be a short complete sentence. \n
					4. Give each group a $summary$. \n
					5. Select sentences ($selectedSentences$) from each paragraph group, which can represent the core meaning of the group. Use triple dots (...) to separate sentences. \n
					6. Output in JSON with the schema: \n

						[
							{
								id: a unique id,
								title: $title$, 
								content: $summary$ + $selectedSentences$, 
							}, 
							...
						]`;

	for (const doc of docChunks) {
		const response = await requestUrl({
			url: `${openAIAPIEndpoint}/chat/completions`,
			method: "POST",
			headers: {
				Authorization: `Bearer ${openAIAPIKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: openAIModel,
				messages: [
					{
						role: "system",
						content: prompt,
					},
					{
						role: "user",
						content: doc,
					},
				],
				temperature: 0,
			}),
		});

		if (response.json.status === 401) {
			const errorMessage = [
				{
					id: -1,
					title: "Error",
					content:
						"Invalid API key. Please provide a proper OpenAI API key in Settings.",
					url: "",
					isLocal: false,
					savedName: "",
				},
			];
			return errorMessage;
		}

		const data = await response.json;
		const content = JSON.parse(data.choices[0].message.content);

		try {
			results.push(...content);
		} catch (error) {
			console.error("Failed to parse JSON content:", content);
			console.error(error);
		}
	}
	return results;
};

export default generateCards;
