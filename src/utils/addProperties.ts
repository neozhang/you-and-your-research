import { Vault, TFile } from "obsidian";

export const addProperties = async (
	vault: Vault,
	file: TFile,
	data: object
) => {
	const yaml = require("js-yaml");
	const fileContents = await vault.read(file);
	let newContents;
	if (fileContents.startsWith("---")) {
		const endOfFrontMatterIndex = fileContents.indexOf("---", 3);
		if (endOfFrontMatterIndex !== -1) {
			const beforeYaml = fileContents.substring(
				0,
				endOfFrontMatterIndex + 3
			);
			const afterYaml = fileContents.substring(endOfFrontMatterIndex + 3);
			const yamlToAdd = yaml.dump(data);
			newContents = beforeYaml + "\n" + yamlToAdd + afterYaml;
		} else {
			const yamlFrontmatter = "---\n" + yaml.dump(data) + "---\n";
			newContents = yamlFrontmatter + fileContents;
		}
	} else {
		const yamlFrontmatter = "---\n" + yaml.dump(data) + "---\n";
		newContents = yamlFrontmatter + fileContents;
	}
	await vault.modify(file, newContents);
};
