import NoteExtractorPlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class NoteExtractorSettingTab extends PluginSettingTab {
	plugin: NoteExtractorPlugin;

	constructor(app: App, plugin: NoteExtractorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("OpenAI API Key")
			.setDesc("Bring Your Own API Key")
			.addText((text) =>
				text
					.setPlaceholder("sk-")
					.setValue(this.plugin.settings.openAIAPIKey)
					.onChange(async (value) => {
						this.plugin.settings.openAIAPIKey = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("OpenAI Model")
			.setDesc("Choose the Right Model")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions({
						"GPT-3.5-Turbo": "GPT-3.5-Turbo",
						"GPT-4o": "GPT-4o",
					})
					.onChange(async (value) => {
						this.plugin.settings.openAIModel = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
