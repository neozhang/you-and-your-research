import { useContext } from "react";
import { PluginContext } from "./context";
import { Plugin } from "obsidian";

export const usePlugin = (): Plugin | undefined => {
	return useContext(PluginContext);
};
