import { Card } from "../types";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export const generateCards = async (
	doc: string,
	openAIAPIKey: string,
	openAIAPIEndpoint: string,
	openAIModel: string
): Promise<Card[]> => {
	// const docChunks = openAIModel === "gpt-3.5-turbo" ? splitText(doc) : [doc];

	const results: Card[] = [];

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

	// const prompt2 = `You will be given some paragraphs of texts. Use the following instructions to process ALL the provided paragraphs. Remain the original language of the provided texts. \n
	// 				1. Exclude the headings and promotional paragraphs. Include all the other paragraphs, especially the quoted paragraphs. \n
	// 				2. Group paragraphs based on the similarity of meanings. \n
	// 				3. Give each group a new $title$, which should be a short complete sentence. \n
	// 				4. Give each group a $summary$. \n
	// 				5. Select sentences ($selectedSentences$) from each paragraph group, which can represent the core meaning of the group. Use triple dots (...) to separate sentences. \n
	// 				6. Output in JSON with the schema: \n

	// 					[
	// 						{
	// 							id: a unique id,
	// 							title: $title$,
	// 							content: $summary$ + $selectedSentences$,
	// 						},
	// 						...
	// 					]`;

	// Create the OpenAI client
	const openai = createOpenAI({
		apiKey: openAIAPIKey,
		baseURL: openAIAPIEndpoint,
	});

	const model = openai(openAIModel);

	const { object } = await generateObject({
		model: model,
		mode: "json",
		schema: z.object({
			notes: z.array(
				z.object({
					id: z.number().describe("A unique id"),
					title: z.string().describe("A short title"),
					content: z.string().describe("The content of the note"),
				})
			),
		}),
		system: prompt,
		prompt: doc,
	});

	const data = object.notes;

	data.map((card) => {
		results.push({
			...card,
			url: "[[" + card.title + "]]",
			isLocal: false,
			savedName: "",
		});
	});

	return results;
};

export default generateCards;
