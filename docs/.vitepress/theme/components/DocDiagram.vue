<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';
import { ExternalLink, Maximize2, Minimize2, X, ZoomIn } from '@lucide/vue';
import { withBase } from 'vitepress';

const props = defineProps<{
  src: string;
  original: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}>();

const dialog = ref<HTMLDialogElement>();
const trigger = ref<HTMLButtonElement>();
const actualSize = ref(false);
const optimizedSrc = computed(() => withBase(props.src));
const originalSrc = computed(() => withBase(props.original));

async function openDialog() {
  actualSize.value = false;
  dialog.value?.showModal();
  document.body.classList.add('diagram-open');
  await nextTick();
  dialog.value?.querySelector<HTMLButtonElement>('.doc-diagram__close')?.focus();
}

function closeDialog() {
  dialog.value?.close();
}

function onClose() {
  document.body.classList.remove('diagram-open');
  trigger.value?.focus();
}

function onBackdropClick(event: MouseEvent) {
  if (event.target === dialog.value) closeDialog();
}

onBeforeUnmount(() => {
  document.body.classList.remove('diagram-open');
});
</script>

<template>
  <figure class="doc-diagram">
    <button
      ref="trigger"
      class="doc-diagram__trigger"
      type="button"
      :aria-label="`放大查看：${caption}`"
      @click="openDialog"
    >
      <img
        :src="optimizedSrc"
        :alt="alt"
        :width="width"
        :height="height"
        loading="lazy"
        decoding="async"
      />
      <span class="doc-diagram__zoom-hint" aria-hidden="true">
        <ZoomIn :size="18" />
        放大查看
      </span>
    </button>
    <figcaption>
      <span>{{ caption }}</span>
      <a
        class="doc-diagram__original"
        :href="originalSrc"
        target="_blank"
        rel="noreferrer"
        :title="`在新窗口打开原图：${caption}`"
        :aria-label="`在新窗口打开原图：${caption}`"
      >
        <ExternalLink :size="18" />
      </a>
    </figcaption>
  </figure>

  <dialog
    ref="dialog"
    class="doc-diagram__dialog"
    :aria-label="caption"
    @close="onClose"
    @click="onBackdropClick"
  >
    <div class="doc-diagram__viewer" :class="{ 'is-actual-size': actualSize }">
      <div class="doc-diagram__toolbar">
        <strong>{{ caption }}</strong>
        <div class="doc-diagram__actions">
          <button
            type="button"
            :title="actualSize ? '适合屏幕' : '100% 查看'"
            :aria-label="actualSize ? '适合屏幕' : '100% 查看'"
            @click="actualSize = !actualSize"
          >
            <Minimize2 v-if="actualSize" :size="20" />
            <Maximize2 v-else :size="20" />
          </button>
          <a
            :href="originalSrc"
            target="_blank"
            rel="noreferrer"
            title="在新窗口打开原图"
            aria-label="在新窗口打开原图"
          >
            <ExternalLink :size="20" />
          </a>
          <button
            class="doc-diagram__close"
            type="button"
            title="关闭大图"
            aria-label="关闭大图"
            @click="closeDialog"
          >
            <X :size="22" />
          </button>
        </div>
      </div>
      <div class="doc-diagram__canvas">
        <img
          :src="optimizedSrc"
          :alt="alt"
          :width="width"
          :height="height"
          decoding="async"
        />
      </div>
    </div>
  </dialog>
</template>
