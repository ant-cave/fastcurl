/* SPDX-License-Identifier: AGPL-3.0-or-later */
/* Copyright (C) 2026 ant-cave <antmmmmm@outlook.com> */
/* https://github.com/ant-cave */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const HISTORY_KEY = 'fastcurl_history'
const FAVORITES_KEY = 'fastcurl_favorites'

function loadArray(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

// LLM API 预设
const LLM_PRESETS = [
  {
    name: 'OpenAI Chat',
    url: 'https://api.openai.com/v1/chat/completions',
    method: 'POST',
    headers: { 'Authorization': 'Bearer ', 'Content-Type': 'application/json' },
    body: { model: 'gpt-4o', messages: [{ role: 'user', content: '' }] }
  },
  {
    name: 'OpenAI Embedding',
    url: 'https://api.openai.com/v1/embeddings',
    method: 'POST',
    headers: { 'Authorization': 'Bearer ', 'Content-Type': 'application/json' },
    body: { model: 'text-embedding-3-small', input: '' }
  },
  {
    name: 'Anthropic Claude',
    url: 'https://api.anthropic.com/v1/messages',
    method: 'POST',
    headers: { 'x-api-key': '', 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: { model: 'claude-sonnet-4-20250514', max_tokens: 1024, messages: [{ role: 'user', content: '' }] }
  },
  {
    name: '通义千问',
    url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    method: 'POST',
    headers: { 'Authorization': 'Bearer ', 'Content-Type': 'application/json' },
    body: { model: 'qwen-plus', input: { messages: [{ role: 'user', content: '' }] } }
  },
  {
    name: 'DeepSeek Chat',
    url: 'https://api.deepseek.com/v1/chat/completions',
    method: 'POST',
    headers: { 'Authorization': 'Bearer ', 'Content-Type': 'application/json' },
    body: { model: 'deepseek-chat', messages: [{ role: 'user', content: '' }] }
  }
]

const DEV = typeof location !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
const API_BASE = DEV ? '' : 'https://backend.api.011420.xyz'
const AUTH_BASE = DEV ? '/api/auth' : 'https://backend.api.011420.xyz/api/auth'

export const useRequestStore = defineStore('request', () => {
  // 认证
  const user = ref(null)
  const authLoading = ref(true)

  async function checkAuth() {
    try {
      const res = await fetch(`${AUTH_BASE}/me`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        user.value = data.authenticated ? data : null
      } else {
        user.value = null
      }
    } catch {
      user.value = null
    } finally {
      authLoading.value = false
    }
  }

  async function login() {
    try {
      const redirect = encodeURIComponent('/fastcurl/')
      const res = await fetch(`${AUTH_BASE}/login?redirect=${redirect}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Login failed')
      const data = await res.json()
      if (data.authorize_url) {
        sessionStorage.setItem('pkce_code_verifier', data.code_verifier)
        sessionStorage.setItem('pkce_state', data.state)
        window.location.href = data.authorize_url
      }
    } catch (e) {
      console.error('Login error:', e)
    }
  }

  async function handleCallback(code, codeVerifier) {
    const state = sessionStorage.getItem('pkce_state') || ''
    sessionStorage.removeItem('pkce_state')
    const res = await fetch(`${AUTH_BASE}/token`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, code_verifier: codeVerifier, state }),
    })
    if (!res.ok) throw new Error('Token exchange failed')
    const data = await res.json()
    user.value = { authenticated: true }
    return data
  }

  async function logout() {
    try {
      await fetch(`${AUTH_BASE}/logout`, { method: 'POST', credentials: 'include' })
    } catch { /* ignore */ }
    user.value = null
  }

  // 请求参数
  const url = ref('')
  const method = ref('GET')
  const mode = ref('browser')
  const headers = ref([])
  const authType = ref('none')
  const authValue = ref('')
  const bodyType = ref('none')
  const bodyJson = ref({})
  const bodyForm = ref([])

  // 响应
  const response = ref(null)
  const loading = ref(false)

  // 历史
  const history = ref(loadArray(HISTORY_KEY))
  const favorites = ref(loadArray(FAVORITES_KEY))

  // 用于 JsonTreeEditor 的响应式 JSON
  const bodyJsonRaw = computed({
    get: () => bodyJson.value,
    set: (val) => { bodyJson.value = val }
  })

  // 生成当前请求的快照（用于历史/收藏/curl命令）
  const snapshot = computed(() => {
    const hdrs = getEffectiveHeaders()
    return {
      url: url.value,
      method: method.value,
      mode: mode.value,
      headers: hdrs,
      bodyType: bodyType.value,
      body: bodyType.value === 'json' ? bodyJson.value : bodyForm.value,
      timestamp: Date.now()
    }
  })

  // 生成 curl 命令
  const curlCommand = computed(() => {
    const snap = snapshot.value
    const parts = [`curl -X ${snap.method}`]
    for (const [k, v] of Object.entries(snap.headers)) {
      if (v) parts.push(`-H '${k}: ${v}'`)
    }
    if (snap.bodyType === 'json' && Object.keys(snap.body).length > 0) {
      const bodyStr = JSON.stringify(snap.body, null, 2)
      parts.push(`-d '${bodyStr}'`)
    }
    parts.push(`'${snap.url}'`)
    return parts.join(' \\\n  ')
  })

  // 获取有效请求头（含认证头）
  function getEffectiveHeaders() {
    const hdrs = {}
    for (const h of headers.value) {
      if (h.key) hdrs[h.key] = h.value
    }
    if (authType.value === 'bearer' && authValue.value) {
      hdrs['Authorization'] = `Bearer ${authValue.value}`
    } else if (authType.value === 'basic' && authValue.value) {
      hdrs['Authorization'] = `Basic ${btoa(authValue.value)}`
    } else if (authType.value === 'apikey' && authValue.value) {
      hdrs['Authorization'] = `Bearer ${authValue.value}`
    }
    return hdrs
  }

  // 应用 LLM 预设
  function applyPreset(preset) {
    url.value = preset.url
    method.value = preset.method
    headers.value = Object.entries(preset.headers).map(([key, value]) => ({ key, value }))
    bodyJson.value = preset.body
    bodyType.value = 'json'
    response.value = null
  }

  // 发送请求
  async function send() {
    loading.value = true
    response.value = null
    const hdrs = getEffectiveHeaders()

    try {
      let resp
      if (mode.value === 'browser') {
        const fetchOpts = { method: method.value, headers: hdrs }
        if (method.value !== 'GET' && bodyType.value === 'json' && Object.keys(bodyJson.value).length > 0) {
          fetchOpts.body = JSON.stringify(JSON.parse(JSON.stringify(bodyJson.value)))
          if (!hdrs['Content-Type']) hdrs['Content-Type'] = 'application/json'
        }
        const start = performance.now()
        const fetchResp = await fetch(url.value, fetchOpts)
        const elapsed = Math.round(performance.now() - start)
        const respHeaders = {}
        fetchResp.headers.forEach((v, k) => { respHeaders[k] = v })
        const text = await fetchResp.text()
        resp = { status_code: fetchResp.status, headers: respHeaders, body: text, elapsed_ms: elapsed }
      } else {
        const payload = { url: url.value, method: method.value, headers: { ...hdrs }, body_type: bodyType.value }
        if (bodyType.value === 'json') payload.body = JSON.parse(JSON.stringify(bodyJson.value))
        else if (bodyType.value === 'form') payload.body = Object.fromEntries(bodyForm.value.map(f => [f.key, f.value]))
        const proxyResp = await fetch(`${API_BASE}/api/proxy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        resp = await proxyResp.json()
      }
      response.value = resp

      // 存入历史
      const snap = { ...snapshot.value, response: { status_code: resp.status_code, elapsed_ms: resp.elapsed_ms } }
      history.value.unshift(snap)
      if (history.value.length > 100) history.value = history.value.slice(0, 100)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
    } catch (e) {
      response.value = { status_code: 0, headers: {}, body: String(e), elapsed_ms: 0 }
    } finally {
      loading.value = false
    }
  }

  function loadFromHistory(item) {
    url.value = item.url
    method.value = item.method
    mode.value = item.mode || 'browser'
    authType.value = 'none'
    authValue.value = ''
    headers.value = []
    if (item.headers) {
      headers.value = Object.entries(item.headers).map(([k, v]) => ({ key: k, value: v }))
    }
    if (item.bodyType === 'json' && item.body && typeof item.body === 'object') {
      bodyJson.value = item.body
      bodyType.value = 'json'
    } else {
      bodyType.value = item.bodyType || 'none'
      bodyJson.value = {}
    }
    response.value = null
  }

  function toggleFavorite(item) {
    const idx = favorites.value.findIndex(f => f.url === item.url && f.timestamp === item.timestamp)
    if (idx >= 0) {
      favorites.value.splice(idx, 1)
    } else {
      favorites.value.unshift(item)
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value))
  }

  function clearHistory() {
    history.value = []
    localStorage.removeItem(HISTORY_KEY)
  }

  return {
    url, method, mode, headers, authType, authValue,
    bodyType, bodyJson, bodyForm, bodyJsonRaw,
    response, loading, history, favorites,
    snapshot, curlCommand, LLM_PRESETS,
    applyPreset, send, loadFromHistory, toggleFavorite, clearHistory, getEffectiveHeaders,
    user, authLoading, checkAuth, login, handleCallback, logout
  }
})
