<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <antmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<template>
  <div class="border border-gray-200 rounded bg-white text-sm font-mono">
    <div class="flex items-center gap-2 px-3 py-1.5 border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
      <span>JSON</span>
      <button class="ml-auto text-xs text-gray-400 hover:text-gray-700" @click="switchMode">
        {{ codeMode ? '图形模式' : '代码模式' }}
      </button>
      <template v-if="!codeMode">
        <button class="text-xs text-gray-400 hover:text-gray-700" @click="addRootKey">
          + 添加字段
        </button>
        <button class="text-xs text-gray-400 hover:text-red-500" @click="clearAll">
          清空
        </button>
      </template>
    </div>
    <!-- 图形模式 -->
    <div v-if="!codeMode" class="p-2 space-y-1 max-h-80 overflow-y-auto">
      <template v-if="root">
        <JsonNode
          :node="root"
          :depth="0"
          @change="emitChange"
        />
      </template>
      <div v-else class="text-gray-400 text-xs text-center py-4">
        JSON 为空，点击上方 "+ 添加字段" 开始构建
      </div>
    </div>
    <!-- 代码模式 -->
    <div v-else class="p-2">
      <textarea
        class="w-full h-64 border border-gray-200 rounded p-2 text-xs font-mono outline-none focus:border-gray-400 resize-y"
        :value="codeText"
        @input="onCodeInput"
        placeholder='{"key": "value"}'
      ></textarea>
      <div v-if="codeError" class="text-red-500 text-xs mt-1">{{ codeError }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, provide } from 'vue'
import JsonNode from './JsonNode.vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

let uid = Date.now()

const root = ref(null)
let syncing = false
const codeMode = ref(false)
const codeText = ref('')
const codeError = ref('')

function buildNode(val) {
  if (Array.isArray(val)) {
    return reactive({ _id: ++uid, _type: 'array', _expanded: true, _children: val.map(v => buildChild(v, '')) })
  }
  if (typeof val === 'object' && val !== null) {
    return reactive({ _id: ++uid, _type: 'object', _expanded: true, _children: Object.entries(val).map(([k, v]) => buildChild(v, k)) })
  }
  return null
}

function buildChild(val, key) {
  if (typeof val === 'object' && val !== null) {
    return reactive({
      _id: ++uid, _key: key, _type: Array.isArray(val) ? 'array' : 'object', _expanded: true,
      _children: Array.isArray(val) ? val.map((v, i) => buildChild(v, String(i))) : Object.entries(val).map(([k, v]) => buildChild(v, k))
    })
  }
  return reactive({ _id: ++uid, _key: key, _type: guessType(val), _value: val })
}

function guessType(v) {
  if (v === null) return 'null'
  if (typeof v === 'boolean') return 'boolean'
  if (typeof v === 'number') return 'number'
  return 'string'
}

function nodeToValue(node) {
  if (node._type === 'object') {
    const obj = {}
    for (const c of node._children || []) {
      if (c._key !== undefined && c._key !== null) obj[c._key] = nodeToValue(c)
    }
    return obj
  }
  if (node._type === 'array') {
    return (node._children || []).map(c => nodeToValue(c))
  }
  return node._value
}

watch(() => props.modelValue, (val) => {
  if (syncing) return
  const n = buildNode(val)
  root.value = n
  codeText.value = JSON.stringify(val, null, 2)
}, { immediate: true, deep: true })

function switchMode() {
  if (codeMode.value) {
    // 代码 -> 图形：解析 JSON 重建树
    codeError.value = ''
    try {
      const parsed = JSON.parse(codeText.value)
      const n = buildNode(parsed)
      root.value = n
      codeMode.value = false
      syncing = true
      emit('update:modelValue', parsed)
      syncing = false
    } catch (e) {
      codeError.value = 'JSON 格式错误: ' + e.message
      return
    }
  } else {
    // 图形 -> 代码：同步当前值到 textarea
    codeText.value = JSON.stringify(nodeToValue(root.value), null, 2)
    codeMode.value = true
  }
}

function onCodeInput(e) {
  codeText.value = e.target.value
  codeError.value = ''
  try {
    const parsed = JSON.parse(codeText.value)
    syncing = true
    emit('update:modelValue', parsed)
    syncing = false
  } catch {
    // 输入中可能暂时不合法，不报错
  }
}

function addRootKey() {
  if (!root.value) {
    root.value = reactive({ _id: ++uid, _type: 'object', _expanded: true, _children: [] })
  }
  if (!root.value._children) root.value._children = []
  root.value._children.push(reactive({ _id: ++uid, _key: '', _type: 'string', _value: '' }))
  emitChange()
}

function clearAll() {
  root.value = reactive({ _id: ++uid, _type: 'object', _expanded: true, _children: [] })
  codeText.value = '{}'
  emitChange()
}

function emitChange() {
  if (!root.value) {
    syncing = true
    emit('update:modelValue', {})
    syncing = false
    return
  }
  syncing = true
  emit('update:modelValue', nodeToValue(root.value))
  syncing = false
}

provide('notify', emitChange)
</script>
