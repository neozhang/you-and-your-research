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

	const docChunks = openAIModel === "gpt-3.5-turbo" ? splitText(doc) : [doc];

	const prompts = docChunks.map((chunk: string) => ({
		role: "user",
		content: chunk,
	}));

	const results: any[] = [];
	for (const prompt of prompts) {
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
						content: `You are an multilingual expert in generating notes from documents. 
								Please respond in the same language as the user input provided.
								The notes will need to be in JSON array using the schema: [{id: id, title: "title", content: "content"}].
								Remember, the language of the notes must match the language of the user input.`,
					},
					{
						role: "system",
						content: `Generate notes from the following doc. Instructions:
							1. The titles of the notes should be short phrases which can be distinguishable with explicit subject matters, and holistically present the main logic structure of the provided doc. 
							2. The content of the notes should start with a summary of the data, facts or insights from the original document, followed by quotes of all relevant pieces from the original document as supporting. 
							3. When quoting from the original document, use Markdown blockquotes (i.e. '> '). DO NOT inline quotes. Add 1 line break before and after the blockquote.
							4. Include the author name and original source of each quote. If you don't know the author, leave it empty.
							5. Include relevant images (use Markdown to link the images).
							6. Notes should be information-rich. Only keep the most informative notes. Combine related notes into one note. \n`,
					},
					prompt,
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
		console.log(data.choices[0].message.content);
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
