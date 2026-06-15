<template>
  <ion-page>
    <ion-content :scroll-y="false">
      <div class="login-container">

        <div class="background-scene">
          <div class="sun"></div>
          <div class="cloud cloud-1"></div>
          <div class="cloud cloud-2"></div>
          <div class="cloud cloud-3"></div>

          <!-- Vacas -->
          <svg
            v-for="(cow, index) in cows"
            :key="cow.id"
            :ref="el => { if (el) cowEls[index] = el }"
            class="cow"
            :style="{
              left: cow.left,
              bottom: cow.bottom,
              width: cow.size + 'px',
              transform: cow.flip ? 'scaleX(-1)' : 'none'
            }"
            :width="cow.size"
            :height="cow.size * 0.85"
            viewBox="0 0 100 85"
          >
            <ellipse cx="50" cy="48" rx="28" ry="18" fill="#f5f5f5" stroke="#333" stroke-width="0.5" />
            <path d="M 35 38 Q 40 32 48 36 Q 52 42 45 46 Q 38 44 35 38" fill="#2d2d2d" />
            <path d="M 55 40 Q 62 35 68 40 Q 70 48 63 50 Q 56 48 55 40" fill="#2d2d2d" />
            <path d="M 42 50 Q 48 48 52 52 Q 50 58 44 56 Q 40 54 42 50" fill="#2d2d2d" />
            <rect x="32" y="60" width="5" height="16" rx="2" fill="#f5f5f5" stroke="#333" stroke-width="0.3" />
            <rect x="40" y="60" width="5" height="16" rx="2" fill="#f5f5f5" stroke="#333" stroke-width="0.3" />
            <rect x="55" y="60" width="5" height="16" rx="2" fill="#f5f5f5" stroke="#333" stroke-width="0.3" />
            <rect x="63" y="60" width="5" height="16" rx="2" fill="#f5f5f5" stroke="#333" stroke-width="0.3" />
            <rect x="31" y="74" width="7" height="4" rx="2" fill="#5d4037" />
            <rect x="39" y="74" width="7" height="4" rx="2" fill="#5d4037" />
            <rect x="54" y="74" width="7" height="4" rx="2" fill="#5d4037" />
            <rect x="62" y="74" width="7" height="4" rx="2" fill="#5d4037" />
            <ellipse cx="48" cy="62" rx="6" ry="4" fill="#ffcdd2" />
            <path d="M 78 44 Q 88 40 86 48 Q 90 52 88 56" fill="none" stroke="#333" stroke-width="1.2" stroke-linecap="round" />
            <ellipse cx="88" cy="57" rx="2" ry="3" fill="#2d2d2d" />

            <g
              :style="{
                transform: `rotate(${headAngles[cow.id]}deg)`,
                transformOrigin: '28px 40px',
                transition: 'transform 0.5s ease-in-out'
              }"
            >
              <path d="M 25 42 Q 20 38 18 32 Q 22 28 28 30 L 30 42 Z" fill="#f5f5f5" stroke="#333" stroke-width="0.3" />
              <ellipse cx="16" cy="28" rx="12" ry="10" fill="#f5f5f5" stroke="#333" stroke-width="0.5" />
              <path d="M 10 22 Q 14 18 20 20 Q 22 26 18 28 Q 12 28 10 22" fill="#2d2d2d" />
              <ellipse cx="6" cy="20" rx="4" ry="2.5" fill="#ffcdd2" stroke="#333" stroke-width="0.3" transform="rotate(-30 6 20)" />
              <ellipse cx="26" cy="20" rx="4" ry="2.5" fill="#ffcdd2" stroke="#333" stroke-width="0.3" transform="rotate(30 26 20)" />
              <path d="M 10 18 Q 8 12 10 10" fill="none" stroke="#f5f5dc" stroke-width="2" stroke-linecap="round" />
              <path d="M 22 18 Q 24 12 22 10" fill="none" stroke="#f5f5dc" stroke-width="2" stroke-linecap="round" />

              <circle cx="11" cy="26" r="3" fill="white" stroke="#333" stroke-width="0.3" />
              <circle cx="21" cy="26" r="3" fill="white" stroke="#333" stroke-width="0.3" />

              <template v-if="!passwordFocused">
                <circle cx="11" cy="26" r="1.5" fill="#1a1a1a"
                  :style="{ transform: `translate(${eyeOffsets[cow.id].x}px, ${eyeOffsets[cow.id].y}px)`, transition: 'transform 0.08s ease-out' }" />
                <circle cx="21" cy="26" r="1.5" fill="#1a1a1a"
                  :style="{ transform: `translate(${eyeOffsets[cow.id].x}px, ${eyeOffsets[cow.id].y}px)`, transition: 'transform 0.08s ease-out' }" />
                <circle cx="10" cy="25" r="0.6" fill="white"
                  :style="{ transform: `translate(${eyeOffsets[cow.id].x * 0.5}px, ${eyeOffsets[cow.id].y * 0.5}px)` }" />
                <circle cx="20" cy="25" r="0.6" fill="white"
                  :style="{ transform: `translate(${eyeOffsets[cow.id].x * 0.5}px, ${eyeOffsets[cow.id].y * 0.5}px)` }" />
              </template>

              <template v-else>
                <line x1="8.5" y1="26" x2="13.5" y2="26" stroke="#333" stroke-width="1.5" stroke-linecap="round" />
                <line x1="18.5" y1="26" x2="23.5" y2="26" stroke="#333" stroke-width="1.5" stroke-linecap="round" />
              </template>

              <ellipse cx="16" cy="34" rx="6" ry="4" fill="#ffcdd2" stroke="#333" stroke-width="0.3" />
              <circle cx="14" cy="34" r="1" fill="#333" />
              <circle cx="18" cy="34" r="1" fill="#333" />
              <path d="M 13 37 Q 16 39 19 37" fill="none" stroke="#333" stroke-width="0.5" stroke-linecap="round" />
            </g>
          </svg>

          <!-- Valla -->
          <div class="fence-area">
            <svg viewBox="0 0 1000 60" preserveAspectRatio="none" class="fence-svg">
              <rect x="0"   y="15" width="1000" height="6" rx="2" fill="#8B6914" />
              <rect x="0"   y="34" width="1000" height="6" rx="2" fill="#7a5c10" />
              <rect x="10"  y="2" width="12" height="58" rx="3" fill="#a07820" />
              <rect x="90"  y="2" width="12" height="58" rx="3" fill="#a07820" />
              <rect x="170" y="2" width="12" height="58" rx="3" fill="#a07820" />
              <rect x="250" y="2" width="12" height="58" rx="3" fill="#a07820" />
              <rect x="330" y="2" width="12" height="58" rx="3" fill="#a07820" />
              <rect x="410" y="2" width="12" height="58" rx="3" fill="#a07820" />
              <rect x="490" y="2" width="12" height="58" rx="3" fill="#a07820" />
              <rect x="570" y="2" width="12" height="58" rx="3" fill="#a07820" />
              <rect x="650" y="2" width="12" height="58" rx="3" fill="#a07820" />
              <rect x="730" y="2" width="12" height="58" rx="3" fill="#a07820" />
              <rect x="810" y="2" width="12" height="58" rx="3" fill="#a07820" />
              <rect x="890" y="2" width="12" height="58" rx="3" fill="#a07820" />
              <rect x="978" y="2" width="12" height="58" rx="3" fill="#a07820" />
            </svg>
          </div>

          <div class="ground-flat"></div>
        </div>

        <div class="login-box">
          <div class="login-box__header">
            <h1>BovWeight CR</h1>
            <h2>Iniciar Sesión</h2>
          </div>

          <div class="form-group">
            <label>Correo</label>
            <input v-model="correo" type="email" placeholder="ganadero@bovweight.com" />
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <div class="password-wrapper">
              <input
                v-model="clave"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                @focus="passwordFocused = true"
                @blur="passwordFocused = false"
              />
              <button type="button" class="toggle-pw" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <p v-if="error" class="error">{{ error }}</p>

          <button class="submit-btn" :disabled="loading" @click="handleLogin">
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>

          <div class="link-container">
            <span class="forgot-link">¿Olvidaste tu contraseña?</span>
          </div>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent } from '@ionic/vue'
import { useAuthStore } from '../../stores/auth'
import { paths } from '../../router/paths'

const router = useRouter()
const auth = useAuthStore()

const correo = ref('')
const clave = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)
const passwordFocused = ref(false)
const screenWidth = ref(window.innerWidth)

const allCows = [
  { id: 0, left: '2%',  bottom: '70px', size: 72,  flip: false },
  { id: 1, left: '22%', bottom: '70px', size: 80,  flip: true  },
  { id: 2, left: '42%', bottom: '70px', size: 68,  flip: false },
  { id: 3, left: '62%', bottom: '70px', size: 76,  flip: true  },
  { id: 4, left: '80%', bottom: '70px', size: 65,  flip: false },
]

const cows = computed(() => {
  if (screenWidth.value < 360) return [allCows[0], allCows[4]]
  if (screenWidth.value < 480) return [allCows[0], allCows[2], allCows[4]]
  return allCows
})

const cowEls = []
const eyeOffsets = reactive(allCows.map(() => ({ x: 0, y: 0 })))
const headAngles = reactive(allCows.map(() => 0))

watch(passwordFocused, (focused) => {
  if (!focused) {
    allCows.forEach((cow) => {
      eyeOffsets[cow.id].x = 0
      eyeOffsets[cow.id].y = 0
      headAngles[cow.id] = 0
    })
  }
})

function handlePointerMove(clientX, clientY) {
  if (passwordFocused.value) {
    allCows.forEach((cow) => { headAngles[cow.id] = 15 })
    return
  }
  cows.value.forEach((cow, index) => {
    const el = cowEls[index]
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cowCenterX = rect.left + rect.width / 2
    const cowCenterY = rect.top + rect.height / 3
    const dx = clientX - cowCenterX
    const dy = clientY - cowCenterY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const maxOffset = 2.5
    const normalizedX = (dx / Math.max(distance, 1)) * maxOffset
    const normalizedY = (dy / Math.max(distance, 1)) * maxOffset
    eyeOffsets[cow.id].x = cow.flip ? -normalizedX : normalizedX
    eyeOffsets[cow.id].y = normalizedY
    const effectiveDx = cow.flip ? -dx : dx
    const angle = Math.atan2(dy, effectiveDx) * (180 / Math.PI)
    headAngles[cow.id] = Math.max(-18, Math.min(18, angle * 0.25))
  })
}

function handleMouseMove(e) { handlePointerMove(e.clientX, e.clientY) }
function handleTouchMove(e) {
  const t = e.touches[0]
  if (t) handlePointerMove(t.clientX, t.clientY)
}
function onResize() { screenWidth.value = window.innerWidth; cowEls.length = 0 }

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('touchmove', handleTouchMove, { passive: true })
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('touchmove', handleTouchMove)
  window.removeEventListener('resize', onResize)
})

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(correo.value, clave.value)
    const rol = auth.usuario?.rol
    if (rol === 2) router.push(paths.veterinario.fincas)
    else if (rol === 1) router.push(paths.ganadero.menu)
    else if (rol === 3) router.push(paths.ayudante.menu)
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al iniciar sesión.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
ion-content { --background: transparent; }

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #87ceeb 0%, #5ba8d4 30%, #3a8fbf 60%, #4a9c6e 80%, #3a7d4a 100%);
}

.cloud { position: absolute; background: rgba(255,255,255,0.85); border-radius: 50px; pointer-events: none; }
.cloud::before, .cloud::after { content: ''; position: absolute; background: rgba(255,255,255,0.85); border-radius: 50%; }
.cloud-1 { width: 90px; height: 28px; top: 40px; left: 6%; animation: cloud-drift 18s linear infinite; }
.cloud-1::before { width: 46px; height: 42px; top: -22px; left: 14px; }
.cloud-1::after  { width: 34px; height: 32px; top: -16px; left: 42px; }
.cloud-2 { width: 70px; height: 22px; top: 80px; left: 55%; animation: cloud-drift 24s linear infinite 4s; opacity: 0.75; }
.cloud-2::before { width: 34px; height: 32px; top: -16px; left: 10px; }
.cloud-2::after  { width: 26px; height: 24px; top: -12px; left: 32px; }
.cloud-3 { width: 60px; height: 18px; top: 30px; right: 10%; animation: cloud-drift 20s linear infinite 8s; opacity: 0.8; }
.cloud-3::before { width: 30px; height: 28px; top: -14px; left: 8px; }
.cloud-3::after  { width: 22px; height: 20px; top: -10px; left: 26px; }

@keyframes cloud-drift {
  0%, 100% { transform: translateX(0); }
  50%       { transform: translateX(20px); }
}

.background-scene { position: absolute; inset: 0; pointer-events: none; }

.sun {
  position: absolute; top: 32px; right: 12%;
  width: 58px; height: 58px; border-radius: 50%;
  background: radial-gradient(circle, #fff9c4 40%, #ffe566 70%, #ffcc00 100%);
  box-shadow: 0 0 30px 10px rgba(255,220,50,0.5);
  animation: sun-pulse 4s ease-in-out infinite;
}
@keyframes sun-pulse {
  0%, 100% { box-shadow: 0 0 30px 10px rgba(255,220,50,0.5); }
  50%       { box-shadow: 0 0 55px 20px rgba(255,220,50,0.7); }
}

.cow { position: absolute; pointer-events: all; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.2)); z-index: 4; }

.fence-area { position: absolute; bottom: 88px; left: 0; right: 0; height: 50px; z-index: 3; pointer-events: none; }
.fence-svg { width: 100%; height: 100%; }

.ground-flat {
  position: absolute; bottom: 0; left: 0; right: 0; height: 100px;
  background: linear-gradient(to top, #2d5a1b 0%, #3a7d22 50%, #4a9c2a 100%);
  z-index: 2;
}

.login-box {
  position: relative; z-index: 10;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.35);
  padding: 2rem 1.6rem 1.5rem;
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4);
  width: 88%; max-width: 360px;
  margin-bottom: 130px;
}

.login-box__header { text-align: center; margin-bottom: 1.6rem; }

h1 {
  color: #ffffff; font-size: 1.75rem; font-weight: 700;
  margin: 0 0 0.2rem; letter-spacing: -0.5px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.25);
  font-family: Georgia, serif;
}
h2 { color: rgba(255,255,255,0.85); font-size: 0.9rem; font-weight: 400; margin: 0; }

.form-group { margin-bottom: 1.1rem; }

label { display: block; margin-bottom: 0.3rem; color: rgba(255,255,255,0.9); font-size: 0.85rem; font-weight: 600; }

input[type="email"], input[type="password"], input[type="text"] {
  width: 100%; padding: 0.72rem 1rem;
  background: rgba(255,255,255,0.25);
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 10px; font-size: 1rem;
  box-sizing: border-box; color: #ffffff;
  transition: border-color 0.2s, background 0.2s;
  -webkit-appearance: none;
}
input::placeholder { color: rgba(255,255,255,0.6); }
input:focus { outline: none; border-color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.32); }

.password-wrapper { position: relative; }
.password-wrapper input { padding-right: 2.5rem; }

.toggle-pw {
  position: absolute; right: 0.7rem; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,0.75); padding: 0; display: flex; align-items: center;
}

.error { color: #ffe0e0; font-size: 0.82rem; text-align: center; margin: 0 0 0.4rem; }

.submit-btn {
  width: 100%; padding: 0.82rem;
  background: rgba(255,255,255,0.92); color: #1b4332;
  border: none; border-radius: 10px;
  font-size: 1rem; font-weight: 700; cursor: pointer;
  margin-top: 0.4rem;
  transition: background 0.2s, transform 0.1s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}
.submit-btn:active:not(:disabled) { background: #ffffff; transform: scale(0.98); }
.submit-btn:disabled { background: rgba(255,255,255,0.35); color: rgba(255,255,255,0.6); cursor: not-allowed; }

.link-container { text-align: center; margin-top: 1rem; }
.forgot-link { color: rgba(255,255,255,0.85); font-size: 0.82rem; font-weight: 500; cursor: pointer; }
</style>