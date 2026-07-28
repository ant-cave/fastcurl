<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave -->

<template>
  <div v-if="command" class="border border-gray-200 rounded bg-gray-50">
    <div class="flex items-center justify-between px-3 py-1.5 border-b border-gray-200">
      <span class="text-xs text-gray-500">curl 命令</span>
      <button
        class="text-xs text-gray-400 hover:text-gray-700"
        @click="copy"
      >
        {{ copied ? '已复制' : '复制' }}
      </button>
    </div>
    <pre class="p-3 text-xs font-mono text-gray-800 overflow-x-auto max-h-32">{{ command }}</pre>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  command: { type: String, default: '' }
})

const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(document.querySelector('pre').textContent)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}
</script>
