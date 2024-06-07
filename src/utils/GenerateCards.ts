export const generateCards = async (
	note: string,
	openAIAPIKey: string,
	openAIModel: string
) => {
	console.log(openAIAPIKey, openAIModel);
	const prompt = `Generate 3 knowledge cards from the following note in JSON with the following format: [{id: id, title: "title", content: "content"}], : ${note}`;
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
					role: "system",
					content: "You are a knowledge card generator.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.1,
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

export default generateCards;
