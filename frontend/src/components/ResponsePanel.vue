<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave -->

<template>
  <div v-if="store.response" class="border border-gray-200 rounded bg-white">
    <!-- 状态栏 -->
    <div class="flex items-center gap-3 px-3 py-1.5 border-b border-gray-200 bg-gray-50">
      <span
        class="text-xs font-medium px-1.5 py-0.5 rounded"
        :class="statusColor"
      >
        {{ store.response.status_code }}
      </span>
      <span class="text-xs text-gray-500">{{ store.response.elapsed_ms }}ms</span>
    </div>

    <!-- Tabs: Body / Headers -->
    <div class="flex border-b border-gray-200">
      <button
        class="px-3 py-1.5 text-xs border-b-2"
        :class="tab === 'body' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'"
        @click="tab = 'body'"
      >响应体</button>
      <button
        class="px-3 py-1.5 text-xs border-b-2"
        :class="tab === 'headers' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'"
        @click="tab = 'headers'"
      >响应头</button>
    </div>

    <!-- 响应体 -->
    <div v-if="tab === 'body'" class="p-3">
      <pre class="text-xs font-mono text-gray-800 overflow-x-auto max-h-96 whitespace-pre-wrap break-all">{{ formattedBody }}</pre>
    </div>

    <!-- 响应头 -->
    <div v-if="tab === 'headers'" class="p-3 space-y-0.5 max-h-96 overflow-y-auto">
      <div v-for="(v, k) in store.response.headers" :key="k" class="flex gap-2 text-xs">
        <span class="text-gray-500 whitespace-nowrap">{{ k }}:</span>
        <span class="text-gray-700 font-mono break-all">{{ v }}</span>
      </div>
    </div>
  </div>

  <!-- 空状态 -->
  <div v-else class="border border-dashed border-gray-200 rounded p-8 text-center text-xs text-gray-400">
    发送请求后响应将显示在这里
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRequestStore } from '../stores/request'

const store = useRequestStore()
const tab = ref('body')

const statusColor = computed(() => {
  const code = store.response?.status_code || 0
  if (code >= 200 && code < 300) return 'bg-green-100 text-green-800'
  if (code >= 300 && code < 400) return 'bg-blue-100 text-blue-800'
  if (code >= 400 && code < 500) return 'bg-yellow-100 text-yellow-800'
  if (code >= 500) return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
})

const formattedBody = computed(() => {
  const body = store.response?.body || ''
  try {
    return JSON.stringify(JSON.parse(body), null, 2)
  } catch {
    return body
  }
})
</script>
