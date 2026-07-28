<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <antmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<template>
  <div class="border border-gray-200 rounded bg-white p-3">
    <div class="text-xs text-gray-500 mb-2">LLM API 预设</div>
    <div class="flex flex-wrap gap-1">
      <button
        v-for="preset in presets"
        :key="preset.name"
        class="px-2.5 py-1 text-xs border border-gray-200 rounded hover:bg-gray-100 text-gray-700"
        @click="$emit('select', preset)"
      >
        {{ preset.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRequestStore } from '../stores/request'

const store = useRequestStore()
const presets = store.LLM_PRESETS

defineEmits(['select'])
</script>
