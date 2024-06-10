import { ItemView, Plugin, WorkspaceLeaf } from "obsidian";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { PluginContext } from "./context";
import { NoteExtractorSettingTab } from "./ui/settings";
import NoteExtractor from "./ui/noteExtractor";

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
		return "sparkles";
	}

	async onOpen(): Promise<void> {
		// Ensure settings are loaded
		await this.plugin.loadSettings();

		// Create the React component with settings as props
		this.reactComponent = React.createElement(NoteExtractor);

		// Render the component with the context provider
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<PluginContext.Provider value={this.plugin}>
				{this.reactComponent}
			</PluginContext.Provider>
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
		const rightLeaf = this.app.workspace.getRightLeaf(false);
		if (rightLeaf) {
			rightLeaf.setViewState({
				type: VIEW_TYPE,
			});
		}
	}
}
