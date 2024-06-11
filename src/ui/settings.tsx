import NoteExtractorPlugin from "../main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class NoteExtractorSettingTab extends PluginSettingTab {
	plugin: NoteExtractorPlugin;

	constructor(app: App, plugin: NoteExtractorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;
		let apiKey: string, model: string, jinaAPIKey: string;

		containerEl.empty();

		new Setting(containerEl)
			.setName("OpenAI API Key")
			.setDesc("Bring Your Own API Key")
			.addText((text) => {
				text.setPlaceholder("sk-")
					.setValue(this.plugin.settings.openAIAPIKey)
					.onChange(async (value) => {
						this.plugin.settings.openAIAPIKey = value;
						apiKey = value;
						await this.plugin.saveSettings();
					});
				apiKey = this.plugin.settings.openAIAPIKey;
			});

		new Setting(containerEl)
			.setName("OpenAI Model")
			.setDesc("Choose the Right Model")
			.addDropdown((dropdown) => {
				dropdown
					.addOptions({
						"gpt-3.5-turbo": "gpt-3.5-turbo",
						"gpt-4o": "gpt-4o",
					})
					.setValue(this.plugin.settings.openAIModel)
					.onChange(async (value) => {
						this.plugin.settings.openAIModel = value;
						model = value;
						await this.plugin.saveSettings();
					});
				model = this.plugin.settings.openAIModel;
			});

		new Setting(containerEl)
			.setName("Jina AI API (Optional)")
			.setDesc("https://jina.ai/reader#apiform")
			.addText((text) => {
				text.setPlaceholder("jina_")
					.setValue(this.plugin.settings.jinaAIAPIKey)
					.onChange(async (value) => {
						this.plugin.settings.jinaAIAPIKey = value;
						jinaAPIKey = value;
						await this.plugin.saveSettings();
					});
				jinaAPIKey = this.plugin.settings.jinaAIAPIKey;
			});

		new Setting(containerEl).addButton((button) =>
			button.setButtonText("Save").onClick(async () => {
				this.plugin.settings.openAIModel = model;
				this.plugin.settings.openAIAPIKey = apiKey;
				this.plugin.settings.jinaAIAPIKey = jinaAPIKey;
				await this.plugin.saveSettings();
				console.log("Settings saved: ", this.plugin.settings);
			})
		);
	}
}
