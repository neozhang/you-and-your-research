import { ItemView, Plugin, WorkspaceLeaf } from "obsidian";
import React from "react";
import { createRoot } from "react-dom/client";
import { AppContext } from "./context";
import { NoteExtractorSettingTab } from "./settings";
import NoteExtractor from "./ui/NoteExtractor";

const VIEW_TYPE = "react-view";

interface NoteExtractorSetting {
	openAIAPIKey: string;
	openAIModel: string;
}
const DEFAULT_SETTINGS: Partial<NoteExtractorSetting> = {
	openAIAPIKey: "",
	openAIModel: "gpt-3.5-turbo",
};

class MyReactView extends ItemView {
	root: Root | null = null;
	private reactComponent: React.ReactElement;
	private plugin: NoteExtractorPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: NoteExtractorPlugin) {
		// Modify this line
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Note Extractor";
	}

	getIcon(): string {
		return "layers-3";
	}

	async onOpen(): Promise<void> {
		// Ensure settings are loaded
		await this.plugin.loadSettings();

		// Create the React component with settings as props
		this.reactComponent = React.createElement(NoteExtractor, {
			openAIAPIKey: this.plugin.settings.openAIAPIKey,
			openAIModel: this.plugin.settings.openAIModel,
		});

		// Render the component with the context provider
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<AppContext.Provider value={this.app}>
				{this.reactComponent}
			</AppContext.Provider>
		);
	}
}

export default class NoteExtractorPlugin extends Plugin {
	private view: MyReactView;
	settings: NoteExtractorSetting;

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new NoteExtractorSettingTab(this.app, this));
		this.registerView(
			VIEW_TYPE,
			(leaf: WorkspaceLeaf) => (this.view = new MyReactView(leaf, this))
		);

		this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
	}

	onLayoutReady(): void {
		if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length) {
			return;
		}
		this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE,
		});
	}
}
