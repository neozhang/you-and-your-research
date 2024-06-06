// TODO: add URL as a property of the note

interface Note {
	title: string;
	content: string;
	url: string;
}

export const saveNote = (note: Note, vault) => {
	console.log("Notes saved:", note);
	// Additional logic to handle saved notes
	const sanitizedTitle = note.title.replace(/[\\/:*?"<>|]/g, "-");
	let fileName = `${sanitizedTitle}.md`;
	let counter = 1;
	const checkAndCreateFile = async () => {
		while (await vault.exists(fileName)) {
			fileName = `${sanitizedTitle} - ${counter}.md`;
			counter++;
		}
		await vault.create(fileName, note.content);
	};
	checkAndCreateFile();
};

export default saveNote;
