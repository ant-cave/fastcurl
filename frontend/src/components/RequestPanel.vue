<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <antmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<template>
  <div class="space-y-4">
    <!-- URL 和方法 -->
    <div class="flex gap-2 items-center">
      <select
        class="w-24 border border-gray-200 rounded px-2 py-2 text-sm outline-none bg-white focus:border-gray-400"
        v-model="store.method"
      >
        <option>GET</option>
        <option>POST</option>
        <option>PUT</option>
        <option>PATCH</option>
        <option>DELETE</option>
        <option>HEAD</option>
        <option>OPTIONS</option>
      </select>
      <input
        class="flex-1 border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400 bg-white font-mono"
        v-model="store.url"
        placeholder="https://api.example.com/endpoint"
      />
    </div>

    <!-- LLM 预设 -->
    <LlmPresets @select="store.applyPreset" />

    <!-- 发包方式切换 -->
    <div class="flex gap-4">
      <label class="flex items-center gap-1.5 cursor-pointer">
        <input type="radio" v-model="store.mode" value="browser" class="text-gray-700" />
        <span class="text-xs text-gray-600">浏览器端 (fetch)</span>
      </label>
      <label class="flex items-center gap-1.5 cursor-pointer">
        <input type="radio" v-model="store.mode" value="server" class="text-gray-700" />
        <span class="text-xs text-gray-600">服务端 (代理)</span>
      </label>
    </div>

    <!-- 认证 -->
    <AuthSection
      :authType="store.authType"
      :authValue="store.authValue"
      @update:authType="store.authType = $event"
      @update:authValue="store.authValue = $event"
    />

    <!-- 请求头 -->
    <HeadersEditor v-model="store.headers" />

    <!-- 请求体类型 -->
    <div>
      <div class="flex gap-2 mb-2">
        <label
          v-for="opt in bodyTypeOptions"
          :key="opt.value"
          class="flex items-center gap-1 cursor-pointer"
        >
          <input
            type="radio"
            :value="opt.value"
            v-model="store.bodyType"
            class="text-gray-700"
          />
          <span class="text-xs">{{ opt.label }}</span>
        </label>
      </div>

      <!-- JSON 树形编辑器 -->
      <div v-if="store.bodyType === 'json'">
        <JsonTreeEditor v-model="store.bodyJson" />
      </div>

      <!-- Form Data -->
      <div v-if="store.bodyType === 'form'">
        <FormDataEditor v-model="store.bodyForm" />
      </div>
    </div>

    <!-- 服务端模式未登录提示 -->
    <div v-if="store.mode === 'server' && !store.user && !store.authLoading"
      class="border border-dashed border-gray-300 rounded p-4 text-center text-xs text-gray-400"
    >
      服务端模式需要登录，<button class="text-gray-700 underline" @click="store.login()">点击登录</button>
    </div>

    <!-- 发送按钮 -->
    <button
      class="w-full py-2 rounded text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="!store.url || store.loading || (store.mode === 'server' && !store.user)"
      @click="store.send()"
    >
      {{ store.loading ? '发送中...' : '发送请求' }}
    </button>
  </div>
</template>

<script setup>
import { useRequestStore } from '../stores/request'
import LlmPresets from './LlmPresets.vue'
import AuthSection from './AuthSection.vue'
import HeadersEditor from './HeadersEditor.vue'
import JsonTreeEditor from './JsonTreeEditor.vue'
import FormDataEditor from './FormDataEditor.vue'

const store = useRequestStore()

const bodyTypeOptions = [
  { value: 'none', label: '无请求体' },
  { value: 'json', label: 'JSON' },
  { value: 'form', label: 'Form Data' },
]
</script>
