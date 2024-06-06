import { ItemView, Plugin, WorkspaceLeaf } from "obsidian";
import React from "react";
import { createRoot } from "react-dom/client";
import { AppContext } from "./context";

import NoteExtractor from "./ui/NoteExtractor";

const VIEW_TYPE = "react-view";

class MyReactView extends ItemView {
	root: Root | null = null;
	private reactComponent: React.ReactElement;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
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
		this.reactComponent = React.createElement(NoteExtractor);

		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<AppContext.Provider value={this.app}>
				{this.reactComponent}
			</AppContext.Provider>
		);
	}
}

export default class ReactStarterPlugin extends Plugin {
	private view: MyReactView;

	async onload(): Promise<void> {
		this.registerView(
			VIEW_TYPE,
			(leaf: WorkspaceLeaf) => (this.view = new MyReactView(leaf))
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
