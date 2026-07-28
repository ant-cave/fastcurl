<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <antmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<template>
  <div class="flex items-center gap-2">
    <div v-if="store.authLoading" class="text-xs text-gray-400">检查登录...</div>
    <template v-else-if="store.user">
      <span class="text-xs text-gray-500">{{ store.user.username || store.user.sub }}</span>
      <button
        class="text-xs text-gray-400 hover:text-gray-700"
        @click="store.logout()"
      >退出</button>
    </template>
    <template v-else>
      <button
        class="text-xs text-gray-400 hover:text-gray-700"
        @click="store.login()"
      >登录</button>
    </template>
  </div>
</template>

<script setup>
import { useRequestStore } from '../stores/request'

const store = useRequestStore()
</script>
