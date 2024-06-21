export function splitTextByParagraphs(
	text: string,
	maxWords: number = 2000
): string[] {
	const paragraphs = text.split(/\n\s*\n/); // Split by paragraphs
	const chunks: string[] = [];
	let currentChunk: string[] = [];
	let currentWordCount = 0;

	for (const paragraph of paragraphs) {
		const wordCount = paragraph.split(" ").length;

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

	// Add the last chunk if there's any remaining content
	if (currentChunk.length > 0) {
		chunks.push(currentChunk.join("\n\n"));
	}

	return chunks;
}

export function splitText(
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
