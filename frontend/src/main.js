/* SPDX-License-Identifier: AGPL-3.0-or-later */
/* Copyright (C) 2026 ant-cave */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
