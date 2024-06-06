// fetch OpenAI API to generate an array of knowledge cards from the extracted notes

export const generateKnowledgeCards = async (notes: string[]) => {
	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		body: JSON.stringify({ notes }),
	});
	return response;
};

export default generateKnowledgeCards;
