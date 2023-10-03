import { fileURLToPath, URL } from "node:url";

import { defineConfig, splitVendorChunk } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import Components from "unplugin-vue-components/vite";
import VueRouter from "unplugin-vue-router/vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import { VueRouterAutoImports } from "unplugin-vue-router";
import { unheadVueComposablesImports } from "@unhead/vue";
import AutoImport from "unplugin-auto-import/vite";
import type { ManualChunkMeta } from "rollup";

function splitMoreVendorChunk(
  id: string,
  getModuleInfo: ManualChunkMeta,
  extraSplitName?: (id: string) => string | undefined
): string | undefined {
  const isVendorChunk = splitVendorChunk();

  if (isVendorChunk(id, getModuleInfo)) {
    if (typeof extraSplitName === "function") {
      const extraName = extraSplitName(id);

      if (extraName) {
        return `vendor.${extraName}`;
      }
    }

    return "vendor";
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueRouter({
      routesFolder: "src/routes",
      extensions: [".vue"],
      dts: "./src/types/router.d.ts"
    }),
    vue({
      script: {
        defineModel: true
      }
    }),
    Icons({
      compiler: "vue3",
      defaultClass: "v-icon"
    }),
    vueJsx(),
    Components({ dts: "./src/types/components.d.ts", resolvers: [IconsResolver()] }),
    AutoImport({
      imports: ["vue", VueRouterAutoImports, unheadVueComposablesImports],
      dts: "./src/types/imports.d.ts"
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id, getModuleInfo) => {
          if (id.includes("src/assets/")) {
            // get everything after "src/assets/"
            const [, assetPath] = id.split("src/assets/");
            // remove the extension
            const [assetName] = assetPath.split(".");
            return `meta/${assetName.replace("/", ".").replace("_", ".")}`;
          }

          if (id.includes("/routes")) {
            return "routes";
          }

          return splitMoreVendorChunk(id, getModuleInfo, (intId) => {
            const isVueRelated = ["@vue", "vue-i18n", "@intlify", "vue-router"].some((name) => {
              return intId.includes(name);
            });

            if (isVueRelated) {
              return "vue";
            }

            if (intId.includes("lodash")) {
              return "lodash";
            }
          });
        }
      }
    }
  }
});
