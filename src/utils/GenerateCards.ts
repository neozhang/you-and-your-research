export const GenerateCards = async (
	note: string,
	openAIAPIKey: string,
	openAIModel: string
) => {
	console.log(openAIAPIKey, openAIModel);
	const prompt = `Generate notes from the following doc in JSON with the following format: 
	[{id: id, title: "title", content: "content"}]. Follow the instructions below:
	1. The titles of the notes should be short phrases which can be 
	distinguishable with explicit subject matters, and holistically 
	present the main logic structure of the provided doc. 
	2. The contents of the notes should use the original wording when possible, 
	and pull all relevant pieces from the provided doc to support their titles. 
	3. The notes including titles and contents should use the original 
	language of the provided doc. 
	4. Only keep the most informative notes. Combine related notes into one note. \n ${note}`;
	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${openAIAPIKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: openAIModel,
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.5,
		}),
	});

	if (response.status === 401) {
		const errorMessage = [
			{
				id: -1,
				title: "Error",
				content:
					"Invalid API key. Please provide a proper OpenAI API key in Settings.",
			},
		];
		return JSON.stringify(errorMessage);
	}

	const data = await response.json();
	return data.choices[0].message.content;
};

export default GenerateCards;
