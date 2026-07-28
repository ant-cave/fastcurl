<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <antmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶栏 -->
    <header class="bg-white border-b border-gray-200 px-6 py-3">
      <div class="max-w-7xl mx-auto flex items-center gap-2">
        <a href="https://me.011420.xyz" class="text-gray-400 hover:text-gray-700 text-lg leading-none mr-1">&larr;</a>
        <span class="text-lg font-mono font-bold text-gray-900">fastcurl</span>
        <span class="text-xs text-gray-400">图形化 curl 工具</span>
        <div class="ml-auto">
          <LoginButton />
        </div>
      </div>
    </header>

    <!-- OAuth 回调处理 -->
    <OAuthCallbackHandler />

    <!-- 主内容 -->
    <main class="max-w-7xl mx-auto p-6">
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- 左侧：请求构建 -->
        <div class="lg:col-span-3 space-y-4">
          <RequestPanel />
          <CurlCommand :command="store.curlCommand" />
        </div>

        <!-- 右侧：响应 + 历史 -->
        <div class="lg:col-span-2 space-y-4">
          <ResponsePanel />
          <HistoryPanel />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRequestStore } from './stores/request'
import RequestPanel from './components/RequestPanel.vue'
import ResponsePanel from './components/ResponsePanel.vue'
import CurlCommand from './components/CurlCommand.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import LoginButton from './components/LoginButton.vue'
import OAuthCallbackHandler from './components/OAuthCallbackHandler.vue'

const store = useRequestStore()

onMounted(() => {
  store.checkAuth()
})
</script>
