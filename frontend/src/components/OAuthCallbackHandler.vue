<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 ant-cave <antmmmmm@outlook.com> -->
<!-- https://github.com/ant-cave -->

<template>
  <div v-if="processing" class="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
    <span class="text-sm text-gray-500">登录中...</span>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRequestStore } from '../stores/request'

const store = useRequestStore()
const processing = ref(false)

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const state = params.get('state')
  if (code && state) {
    processing.value = true
    try {
      const storedState = sessionStorage.getItem('pkce_state')
      if (storedState !== state) {
        console.error('OAuth state mismatch')
        return
      }
      const codeVerifier = sessionStorage.getItem('pkce_code_verifier')
      sessionStorage.removeItem('pkce_code_verifier')
      sessionStorage.removeItem('pkce_state')
      if (!codeVerifier) {
        console.error('Missing code_verifier')
        return
      }
      const data = await store.handleCallback(code, codeVerifier)
      if (data.redirect) {
        window.location.href = data.redirect
      }
    } catch (e) {
      console.error('OAuth callback error:', e)
    } finally {
      processing.value = false
    }
  }
})
</script>
