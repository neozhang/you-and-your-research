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

		containerEl.empty();

		new Setting(containerEl)
			.setName("OpenAI API key")
			.setDesc("Bring your own API key")
			.addText((text) => {
				text.setPlaceholder("sk-")
					.setValue(this.plugin.settings.openAIAPIKey)
					.onChange(async (value) => {
						this.plugin.settings.openAIAPIKey = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("OpenAI API Endpoint")
			.setDesc("Use a custom endpoint")
			.addText((text) => {
				text.setPlaceholder("https://api.openai.com/v1")
					.setValue(this.plugin.settings.openAIAPIEndpoint)
					.onChange(async (value) => {
						this.plugin.settings.openAIAPIEndpoint = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("OpenAI model")
			.setDesc("Choose your preferred model")
			.addDropdown((dropdown) => {
				dropdown
					.addOptions({
						"gpt-3.5-turbo": "gpt-3.5-turbo",
						"gpt-4o": "gpt-4o",
					})
					.setValue(this.plugin.settings.openAIModel)
					.onChange(async (value) => {
						this.plugin.settings.openAIModel = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Jina AI API key (optional)")
			.setDesc("https://jina.ai/reader#apiform")
			.addText((text) => {
				text.setPlaceholder("jina_")
					.setValue(this.plugin.settings.jinaAIAPIKey)
					.onChange(async (value) => {
						this.plugin.settings.jinaAIAPIKey = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Location for generated research files")
			.setDesc(
				"Saved files from You and Your Research will be saved here, default to the root of the vault"
			)
			.addText((text) => {
				text.setPlaceholder("Example: folder/subfolder")
					.setValue(this.plugin.settings.savedLocation)
					.onChange(async (value) => {
						this.plugin.settings.savedLocation = value.replace(
							/\/$/,
							""
						);
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Tag for generated research files")
			.setDesc("Tag your saved files automatically")
			.addText((text) => {
				text.setPlaceholder("Example: tagname")
					.setValue(this.plugin.settings.savedTag)
					.onChange(async (value) => {
						this.plugin.settings.savedTag = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl).addButton((button) =>
			button.setButtonText("Save").onClick(async () => {
				await this.plugin.saveSettings();
			})
		);
	}
}
