<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" ref="backdrop" class="modal-mask backdrop-blur-md" @click="backdropClick">
        <div class="modal-container">
          <div class="modal-header">
            <slot name="header" />
          </div>

          <div class="modal-body">
            <slot />
          </div>

          <div class="float-right">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
}>();
const emit = defineEmits<{
  (e: "close"): void;
}>();

const backdrop = ref();

function backdropClick(e: Event) {
  if (backdrop && e.target === backdrop.value) {
    emit("close");
  }
}
</script>

<style scoped lang="postcss">
.modal-mask {
  @apply fixed flex z-[9998] top-0 left-0 w-full h-full bg-black bg-opacity-50 transition-opacity;
}

.modal-container {
  @apply w-80 lg:w-96;
  @apply m-auto px-8 py-6 rounded-md shadow-md shadow-black transition-all bg-gray-800;
}

.modal-header h3 {
  margin-top: 0;
}

.modal-body {
  @apply my-5 mx-0;
}

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
