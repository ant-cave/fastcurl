<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs text-gray-500">请求头</span>
      <button class="text-xs text-gray-400 hover:text-gray-700" @click="addRow">+ 添加</button>
    </div>
    <div class="space-y-1">
      <div v-for="(h, idx) in headers" :key="h._id"
        class="flex items-center gap-1">
        <input
          class="flex-1 border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-gray-400 bg-white"
          v-model="h.key" placeholder="Header name"
          @input="emitChange"
        />
        <span class="text-gray-300">:</span>
        <input
          class="flex-[2] border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-gray-400 bg-white font-mono"
          v-model="h.value" placeholder="Value"
          @input="emitChange"
        />
        <button class="text-gray-300 hover:text-red-500 text-xs px-1" @click="removeRow(idx)">x</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue'])

let idCounter = Date.now()
const headers = ref([])

watch(() => props.modelValue, (val) => {
  headers.value = val.map(h => ({ ...h, _id: ++idCounter }))
}, { immediate: true, deep: true })

function addRow() {
  headers.value.push({ _id: ++idCounter, key: '', value: '' })
}

function removeRow(idx) {
  headers.value.splice(idx, 1)
  emitChange()
}

function emitChange() {
  emit('update:modelValue', headers.value.map(({ _id, ...rest }) => rest))
}
</script>
