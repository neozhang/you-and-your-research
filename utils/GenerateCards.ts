// fetch OpenAI API to generate an array of knowledge cards from the extracted notes
// import * as dotenv from "dotenv";

export const generateCards = async (note: string) => {
	const prompt = `Generate 3 knowledge cards from the following note in JSON with the following format: [{id: id, title: "title", content: "content"}], : ${note}`;
	// dotenv.config({ path: "../.env" });
	// console.log(process.env.REACT_APP_OPENAI_API_KEY);

	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization:
				"Bearer sk-proj-TpY6cyV0F8PXztuyCtStT3BlbkFJK3TLWitdSIuyZpgAC3Gc",
		},
		body: JSON.stringify({
			model: "gpt-3.5-turbo",
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

	const data = await response.json();
	return data.choices[0].message.content;
};

export default generateCards;
