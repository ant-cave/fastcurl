<template>
  <div class="select-none">
    <div v-if="node._type === 'object' || node._type === 'array'">
      <div
        class="flex items-center gap-1 px-1 py-0.5 hover:bg-gray-100 rounded cursor-pointer"
        :style="{ paddingLeft: depth * 16 + 4 + 'px' }"
        @click="toggle"
      >
        <span class="text-gray-400 text-xs w-3">{{ node._expanded ? 'v' : '>' }}</span>
        <input
          v-if="depth > 0"
          class="flex-1 bg-transparent border-b border-dashed border-gray-300 px-1 text-xs outline-none focus:border-gray-600"
          v-model="node._key"
          @click.stop
          placeholder="key"
        />
        <span class="text-xs text-gray-500">{{ node._type === 'array' ? '[]' : '{}' }}</span>
        <span class="text-xs text-gray-400">{{ node._children ? node._children.length : 0 }} 项</span>
        <button
          v-if="depth > 0"
          class="ml-auto text-gray-300 hover:text-red-500 text-xs"
          @click.stop="removeSelf"
        >x</button>
      </div>
      <div v-if="node._expanded && node._children" class="space-y-0.5">
        <div v-for="(child, idx) in node._children" :key="child._id">
          <JsonNode
            :node="child"
            :depth="depth + 1"
            :parent-node="node"
            :parent-index="idx"
          />
        </div>
        <div class="flex gap-1" :style="{ paddingLeft: (depth + 1) * 16 + 20 + 'px' }">
          <button class="text-xs text-gray-400 hover:text-gray-700" @click="addChild">+ 添加</button>
        </div>
      </div>
    </div>
    <div v-else class="flex items-center gap-1 px-1 py-0.5 hover:bg-gray-100 rounded"
      :style="{ paddingLeft: depth * 16 + 4 + 'px' }">
      <span class="text-gray-400 text-xs w-3">&nbsp;</span>
      <input
        v-if="depth > 0"
        class="w-24 bg-transparent border-b border-dashed border-gray-300 px-1 text-xs outline-none focus:border-gray-600"
        v-model="node._key"
        placeholder="key"
      />
      <span class="text-xs text-gray-400">:</span>

      <input
        v-if="node._type === 'string'"
        class="flex-1 bg-transparent border-b border-dashed border-gray-300 px-1 text-xs outline-none focus:border-gray-600 font-mono"
        v-model="node._value"
        placeholder="value"
      />
      <input
        v-else-if="node._type === 'number'"
        type="number"
        class="w-32 bg-transparent border-b border-dashed border-gray-300 px-1 text-xs outline-none focus:border-gray-600 font-mono text-right"
        v-model.number="node._value"
      />
      <select
        v-else-if="node._type === 'boolean'"
        class="text-xs bg-transparent border border-gray-300 rounded px-1 outline-none"
        v-model="node._value"
      >
        <option :value="true">true</option>
        <option :value="false">false</option>
      </select>
      <span v-else-if="node._type === 'null'" class="text-xs text-gray-400">null</span>

      <select
        class="text-xs text-gray-400 bg-transparent border border-gray-200 rounded px-1 outline-none ml-2"
        :value="node._type"
        @change="changeType($event.target.value)"
      >
        <option value="string">string</option>
        <option value="number">number</option>
        <option value="boolean">boolean</option>
        <option value="null">null</option>
        <option value="object">object</option>
        <option value="array">array</option>
      </select>

      <button
        v-if="depth > 0"
        class="ml-auto text-gray-300 hover:text-red-500 text-xs"
        @click="removeSelf"
      >x</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, inject } from 'vue'

let uid = Date.now()

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
  parentNode: { type: Object, default: null },
  parentIndex: { type: Number, default: -1 }
})

const notify = inject('notify', () => {})

function toggle() {
  props.node._expanded = !props.node._expanded
  notify()
}

function addChild() {
  if (!props.node._children) props.node._children = []
  props.node._children.push(reactive({ _id: ++uid, _key: '', _type: 'string', _value: '' }))
  notify()
}

function removeSelf() {
  if (props.parentNode && props.parentIndex >= 0) {
    props.parentNode._children.splice(props.parentIndex, 1)
    notify()
  }
}

function changeType(type) {
  const n = props.node
  n._type = type
  if (type === 'object') { n._children = []; n._expanded = true; delete n._value }
  else if (type === 'array') { n._children = []; n._expanded = true; delete n._value }
  else if (type === 'null') { n._value = null }
  else if (type === 'boolean') { n._value = false }
  else if (type === 'number') { n._value = 0 }
  else { n._value = '' }
  notify()
}
</script>
