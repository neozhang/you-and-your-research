import { createContext } from "react";
import { Plugin } from "obsidian";

export const PluginContext = createContext<Plugin | undefined>(undefined);
