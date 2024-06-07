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
-   [ ] Improve the prompt for GenerateCards
