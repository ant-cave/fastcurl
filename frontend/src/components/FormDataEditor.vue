<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <antmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs text-gray-500">Form Data</span>
      <button class="text-xs text-gray-400 hover:text-gray-700" @click="addRow">+ 添加</button>
    </div>
    <div class="space-y-1">
      <div v-for="(f, idx) in fields" :key="f._id"
        class="flex items-center gap-1">
        <input
          class="flex-1 border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-gray-400 bg-white"
          v-model="f.key" placeholder="Field name"
        />
        <span class="text-gray-300">:</span>
        <input
          class="flex-[2] border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-gray-400 bg-white font-mono"
          v-model="f.value" placeholder="Value"
        />
        <label class="text-xs text-gray-400 cursor-pointer whitespace-nowrap">
          <input type="checkbox" v-model="f.isFile" class="mr-1" />文件
        </label>
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
const fields = ref([])

watch(() => props.modelValue, (val) => {
  fields.value = val.map(f => ({ ...f, _id: ++idCounter }))
}, { immediate: true, deep: true })

function addRow() {
  fields.value.push({ _id: ++idCounter, key: '', value: '', isFile: false })
}

function removeRow(idx) {
  fields.value.splice(idx, 1)
  emitChange()
}

function emitChange() {
  emit('update:modelValue', fields.value.map(({ _id, ...rest }) => rest))
}
</script>
