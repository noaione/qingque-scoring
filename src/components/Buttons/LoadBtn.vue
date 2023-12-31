<template>
  <div class="upload-area">
    <label for="score-upload" class="upload-btn" :aria-disabled="loading">Upload</label>
    <input
      id="score-upload"
      type="file"
      accept="application/json"
      :onchange="onFileLoad"
      :disabled="loading"
    />
  </div>
  <button class="upload-url-btn" :disabled="loading" @click="loadFromURL">Load from URL</button>
</template>

<script setup lang="ts">
import { useScoresStore } from "@/stores";
import { ScoreValidationError, validateScoreJSON } from "@/utils/scoring";

type HandleFileInput = Event & { currentTarget: EventTarget & HTMLInputElement };

const emits = defineEmits<{
  (e: "load-error", error: string | null): void;
  (e: "init-load"): void;
}>();

const scores = useScoresStore();
const loading = ref(false);

function onFileLoad(ev: HandleFileInput) {
  scores.cleanData();
  emits("init-load");
  const files = ev.currentTarget.files;
  if (!files) return;
  const file = files[0];
  if (file.type !== "application/json") {
    emits("load-error", "File must be a JSON file");
    return;
  }

  console.log("Loading:", file);
  loading.value = true;

  const reader = new FileReader();
  reader.readAsText(file, "UTF-8");

  reader.addEventListener("load", () => {
    const result = reader.result as string;

    try {
      const scoreJSON = JSON.parse(result);
      validateScoreJSON(scoreJSON);
      scores.fromJSON(scoreJSON);
    } catch (e) {
      if (e instanceof ScoreValidationError) {
        emits("load-error", e.message);
        return;
      } else {
        emits("load-error", "An unknown error occurred.");
      }
    } finally {
      loading.value = false;
    }
  });

  reader.addEventListener("error", () => {
    if (reader.error) {
      emits("load-error", reader.error.message);
    } else {
      emits("load-error", "An unknown error occurred.");
    }
    loading.value = false;
  });
}

function loadFromURL() {
  const url = prompt("Enter the URL of the score JSON file:");
  if (!url) return;

  // Download first
  loading.value = true;

  fetch(url)
    .then((res) => res.text())
    .then((rawData) => {
      let scoreJSON: any;
      try {
        scoreJSON = JSON.parse(rawData);
      } catch (e) {
        emits("load-error", "Invalid JSON file.");
        return;
      }

      try {
        validateScoreJSON(scoreJSON);
        scores.fromJSON(scoreJSON);
      } catch (e) {
        if (e instanceof ScoreValidationError) {
          emits("load-error", e.message);
        } else {
          emits("load-error", "An unknown error occurred.");
        }
      } finally {
        loading.value = false;
      }
    })
    .catch((e) => {
      emits("load-error", "An unknown error occurred, check console!");
      console.error(e);
      loading.value = false;
    });
}
</script>

<style scoped lang="postcss">
.upload-btn {
  @apply bg-cyan-700 hover:bg-cyan-600 select-none pb-2 active:bg-cyan-600 hover:text-gray-50;
  @apply transition-colors px-4 py-2 rounded-md font-bold;
}
.upload-btn[aria-disabled="true"] {
  @apply bg-cyan-600 !important;
  @apply cursor-not-allowed;
}
.upload-area > input[type="file"] {
  display: none;
}

.upload-url-btn {
  @apply bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-600 hover:text-gray-50 disabled:bg-cyan-600;
  @apply transition-colors px-4 py-2 rounded-md font-bold;
}
</style>
