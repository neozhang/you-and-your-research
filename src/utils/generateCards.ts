export const generateCards = async (
	doc: string,
	openAIAPIKey: string,
	openAIModel: string
) => {
	console.log(openAIAPIKey, openAIModel === "gpt-3.5-turbo");

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
		content: "Doc:\n" + chunk,
	}));

	console.log(prompts);

	const results: any[] = [];
	for (const prompt of prompts) {
		const response = await fetch(
			"https://api.openai.com/v1/chat/completions",
			{
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
							content: `You are an expert in generating notes from documents. 
								You will be given a document and a prompt. 
								You will need to generate notes from the document according to the prompt. 
								The notes will need to be in JSON format. 
								The notes will need to be in the following format: [{id: id, title: "title", content: "content"}].`,
						},
						{
							role: "user",
							content: `Generate notes from the following doc. Instructions:
							1. The titles of the notes should be short phrases which can be distinguishable with explicit subject matters, and holistically present the main logic structure of the provided doc. 
							2. The contents of the notes should start with a summary of the data, facts or insights from the original doc, followed by quotes of all relevant pieces from the original doc as supporting. When quoting the original works, use Markdown's blockquotes.
							3. Include the author name and original source of each quote. If you don't know the author, leave it empty.
							4. Include relevant images (use Markdown to include the images).
							5. The notes including titles and contents should use the original language of the provided doc. 
							6. Notes should be information rich. Only keep the most informative notes. Combine related notes into one note. \n`,
						},
						prompt,
					],
					temperature: 0,
				}),
			}
		);

		if (response.status === 401) {
			const errorMessage = [
				{
					id: -1,
					title: "Error",
					content:
						"Invalid API key. Please provide a proper OpenAI API key in Settings.",
				},
			];
			return errorMessage;
		}

		const data = await response.json();
		// Assuming the correct data is in data.choices[0].message.content
		let content =
			data.choices &&
			data.choices[0] &&
			data.choices[0].message &&
			data.choices[0].message.content;
		// Check and clean content if necessary
		if (content && typeof content === "string") {
			// Remove any non-JSON parts if they exist
			content = content
				.replace(/```json/g, "")
				.replace(/```/g, "")
				.trim();
			try {
				let jsonContent = JSON.parse(content);
				results.push(...jsonContent);
			} catch (error) {
				console.error("Failed to parse JSON content:", content);
				console.error(error);
			}
		}
	}
	return results;
};

export default generateCards;
