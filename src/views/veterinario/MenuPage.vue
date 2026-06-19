<template>
  <ion-page>
    <ion-content :scroll-y="true">
      <div class="menu-container">

        <div class="hero">
          <div class="hero-overlay"></div>
          <div class="hero-content">
            <div class="hero-top">
              <div class="brand">
                <img src="@/assets/cow-icon.png" alt="BovWeight" class="cow-icon" />
                <div>
                  <div class="brand-name">BovWeight CR</div>
                  <div class="brand-sub">Sistema de Pesaje de Ganado</div>
                </div>
              </div>
              <button class="logout-btn" @click="handleLogout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>Salir</span>
              </button>
            </div>
            <div class="hero-welcome">
              <div class="welcome-avatar">{{ iniciales }}</div>
              <div>
                <div class="welcome-name">Bienvenido/a, {{ auth.usuario?.nombre }}</div>
                <div class="welcome-date">{{ fechaHoy }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="cards-wrapper">

          <div class="card-featured" :class="{ 'card-visible': visible[0] }" @click="router.push(paths.veterinario.fincas)">
            <div class="card-featured-left">
              <div class="featured-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div>
                <div class="featured-title">Mis Fincas</div>
                <div class="featured-desc">Consultá animales, pesos y tratamientos por finca</div>
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          <div class="section-label" :class="{ 'card-visible': visible[1] }">Gestión Clínica</div>

          <div class="card" :class="{ 'card-visible': visible[1] }" @click="router.push(paths.veterinario.fincas)">
            <div class="card-left">
              <div class="card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <div>
                <div class="card-title">Animales y Tratamientos</div>
                <div class="card-desc">Entrá a una finca para ver y registrar tratamientos</div>
              </div>
            </div>
            <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          <div class="footer-note">Estimación de apoyo — no sustituye báscula oficial</div>

        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, onIonViewWillEnter } from '@ionic/vue'
import { useAuthStore } from '../../stores/auth'
import { paths } from '../../router/paths'

const router = useRouter()
const auth = useAuthStore()
const visible = ref([false, false])

const iniciales = computed(() => {
  const nombre = auth.usuario?.nombre || ''
  return nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
})

const fechaHoy = computed(() => {
  return new Date().toLocaleDateString('es-CR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).replace(/^\w/, c => c.toUpperCase())
})

function animarEntrada() {
  visible.value = [false, false]
  visible.value.forEach((_, i) => {
    setTimeout(() => { visible.value[i] = true }, 100 + i * 80)
  })
}

async function handleLogout() {
  await auth.logout()
  router.push(paths.login)
}

onIonViewWillEnter(animarEntrada)
</script>

<style scoped>
ion-content { --background: #0f2318; }

.menu-container {
  min-height: 100%;
  background: #0f2318;
}

.hero {
  position: relative;
  height: 200px;
  background-image: url('@/assets/ganado.jpg');
  background-size: cover;
  background-position: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(15,35,24,0.5) 0%,
    rgba(15,35,24,0.7) 60%,
    rgba(15,35,24,1) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem 1.2rem 1.2rem;
}

.hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand { display: flex; align-items: center; gap: 0.6rem; }

.cow-icon {
  width: 34px;
  height: 34px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  opacity: 0.9;
}

.brand-name {
  color: #ffffff;
  font-weight: 700;
  font-size: 0.95rem;
  font-family: Georgia, serif;
}

.brand-sub {
  color: #1D9E75;
  font-size: 0.67rem;
  margin-top: 1px;
}

.logout-btn {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 9px;
  color: rgba(255,255,255,0.85);
  padding: 0.4rem 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
  transition: background 0.2s;
}
.logout-btn:active { background: rgba(255,255,255,0.2); }

.hero-welcome {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.welcome-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1D9E75, #0d6e50);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(29,158,117,0.3);
}

.welcome-name {
  color: #ffffff;
  font-weight: 600;
  font-size: 1rem;
}

.welcome-date {
  color: rgba(255,255,255,0.45);
  font-size: 0.72rem;
  margin-top: 0.1rem;
  text-transform: capitalize;
}

.cards-wrapper {
  padding: 1.2rem 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.card-featured {
  background: linear-gradient(135deg, #1D9E75 0%, #0d6e50 100%);
  border-radius: 16px;
  padding: 1.1rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(29,158,117,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.4s ease, transform 0.4s ease;
  margin-bottom: 0.3rem;
}
.card-featured.card-visible { opacity: 1; transform: translateY(0); }
.card-featured:active { transform: scale(0.98) !important; }

.card-featured-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex: 1;
}

.featured-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.featured-title {
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 0.2rem;
}

.featured-desc {
  color: rgba(255,255,255,0.75);
  font-size: 0.78rem;
  line-height: 1.3;
}

.section-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: rgba(255,255,255,0.3);
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 0.6rem 0 0.2rem;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.section-label.card-visible { opacity: 1; }

.card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 14px;
  padding: 0.9rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  opacity: 0;
  transform: translateX(-12px);
  transition: opacity 0.35s ease, transform 0.35s ease, background 0.15s;
}
.card.card-visible { opacity: 1; transform: translateX(0); }
.card:active { background: rgba(255,255,255,0.1); transform: scale(0.985) !important; }

.card-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex: 1;
}

.card-icon {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  background: rgba(29,158,117,0.12);
  border: 1px solid rgba(29,158,117,0.2);
  color: #1D9E75;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-title {
  font-weight: 600;
  font-size: 0.92rem;
  color: #ffffff;
  margin-bottom: 0.15rem;
}

.card-desc {
  font-size: 0.77rem;
  color: rgba(255,255,255,0.4);
  line-height: 1.3;
}

.chevron { color: rgba(255,255,255,0.2); flex-shrink: 0; }

.footer-note {
  text-align: center;
  margin-top: 1.5rem;
  color: rgba(255,255,255,0.18);
  font-size: 0.7rem;
}
</style>
