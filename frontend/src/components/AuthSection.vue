<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <antmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<template>
  <div class="border border-gray-200 rounded bg-white p-3">
    <div class="text-xs text-gray-500 mb-2">认证方式</div>
    <div class="flex gap-2 mb-2">
      <label
        v-for="opt in authOptions"
        :key="opt.value"
        class="flex items-center gap-1 cursor-pointer"
      >
        <input
          type="radio"
          :value="opt.value"
          :checked="authType === opt.value"
          class="text-gray-700"
          @change="$emit('update:authType', opt.value)"
        />
        <span class="text-xs">{{ opt.label }}</span>
      </label>
    </div>
    <div v-if="authType !== 'none'" class="flex items-center gap-2">
      <span class="text-xs text-gray-400 whitespace-nowrap">
        {{ authType === 'bearer' ? 'Token' : authType === 'basic' ? 'user:pass' : 'API Key' }}
      </span>
      <input
        class="flex-1 border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-gray-400 font-mono bg-white"
        :value="authValue"
        @input="e => $emit('update:authValue', e.target.value)"
        :placeholder="authType === 'basic' ? 'username:password' : 'token...'"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  authType: { type: String, default: 'none' },
  authValue: { type: String, default: '' }
})

defineEmits(['update:authType', 'update:authValue'])

const authOptions = [
  { value: 'none', label: '无认证' },
  { value: 'bearer', label: 'Bearer' },
  { value: 'basic', label: 'Basic' },
  { value: 'apikey', label: 'API Key' },
]
</script>
