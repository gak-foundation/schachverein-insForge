import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    exclude: ["**/node_modules/**", "**/e2e/**", "**/.{idea,git,cache,output,temp}/**"],
    setupFiles: ["./src/lib/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "**/node_modules/**",
        "**/*.d.ts",
        "**/*.test.ts",
        "**/test/**",
        "**/e2e/**",
        "**/*.config.*",
        "**/scripts/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
