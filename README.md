## Notes

If you want to change the default main file from main.ts to main.tsx, you need to change the esbuild.config.mjs file:

`entryPoints: ["main.ts"]`

to

`entryPoints: ["main.tsx"]`

.

## Todo

-   [x] Develop the SaveNote module
-   [x] Add URL as a frontmatter property
-   [x] Clean up the Jina Reader mess
-   [x] Consider dark mode for styles
-   [x] Develop the GenerateCards module
-   [x] Bring your own API key
-   [x] Add loading animation
-   [x] Fix the backlink issue in saving the url property of knowledge cards
-   [x] Improve the look and feel: icons and card design
-   [x] Improve the prompt for GenerateCards
-   [-] Add a model selector next to Generate Cards button
-   [x] ISSUE: The DEFAULT_SETTING var always revert back to gpt-3.5-turbo
-   [x] Add preview function to cards
-   [x] ISSUE: new extraction should clear all previously generated cards
-   [x] ISSUE: Setting tab default model should reflect the current model in use
-   [ ] Add a button to insert a card to current file
-   [ ] FUTRE: Card preview in Markdown
