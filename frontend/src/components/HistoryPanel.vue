<template>
  <div class="border border-gray-200 rounded bg-white">
    <div class="flex items-center justify-between px-3 py-1.5 border-b border-gray-200 bg-gray-50">
      <div class="flex gap-3">
        <button
          class="text-xs"
          :class="tab === 'history' ? 'text-gray-900 font-medium' : 'text-gray-400'"
          @click="tab = 'history'"
        >历史 ({{ store.history.length }})</button>
        <button
          class="text-xs"
          :class="tab === 'favorites' ? 'text-gray-900 font-medium' : 'text-gray-400'"
          @click="tab = 'favorites'"
        >收藏 ({{ store.favorites.length }})</button>
      </div>
      <button
        v-if="tab === 'history' && store.history.length > 0"
        class="text-xs text-gray-400 hover:text-red-500"
        @click="store.clearHistory()"
      >清空</button>
    </div>

    <div class="max-h-80 overflow-y-auto">
      <div v-if="items.length === 0" class="p-6 text-center text-xs text-gray-400">
        {{ tab === 'history' ? '暂无历史记录' : '暂无收藏' }}
      </div>
      <div v-for="(item, idx) in items" :key="idx"
        class="px-3 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
        @click="store.loadFromHistory(item)"
      >
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono text-gray-500 w-12">{{ item.method }}</span>
          <span class="text-xs font-mono text-gray-800 truncate flex-1">{{ item.url }}</span>
          <button
            class="text-xs text-gray-300 hover:text-yellow-500"
            @click.stop="store.toggleFavorite(item)"
          >
            {{ isFav(item) ? '*' : 'o' }}
          </button>
        </div>
        <div v-if="item.response" class="flex gap-2 mt-0.5">
          <span
            class="text-xxs px-1 rounded"
            :class="item.response.status_code >= 200 && item.response.status_code < 300 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
          >{{ item.response.status_code }}</span>
          <span class="text-xxs text-gray-400">{{ item.response.elapsed_ms }}ms</span>
          <span class="text-xxs text-gray-400">{{ formatTime(item.timestamp) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRequestStore } from '../stores/request'

const store = useRequestStore()
const tab = ref('history')

const items = computed(() =>
  tab.value === 'history' ? store.history : store.favorites
)

function isFav(item) {
  return store.favorites.some(f => f.url === item.url && f.timestamp === item.timestamp)
}

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}
</script>
