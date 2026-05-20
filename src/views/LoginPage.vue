<template>
    <ion-page>
        <ion-content class="ion-padding">
            <div class="login-container">
                <div class="login-logo">
                    <h1>BovWeight CR</h1>
                    <p>Sistema de Pesaje Bovino</p>
                </div>

                <div class="login-form">
                    <ion-item>
                        <ion-label position="floating">Correo</ion-label>
                        <ion-input
                            v-model="correo"
                            type="email"
                            placeholder="correo@ejemplo.com"
                        />
                    </ion-item>

                    <ion-item>
                        <ion-label position="floating">Contraseña</ion-label>
                        <ion-input
                            v-model="clave"
                            type="password"
                            placeholder="••••••••"
                        />
                    </ion-item>

                    <p v-if="error" class="error">{{ error }}</p>

                    <ion-button
                        expand="block"
                        class="login-btn"
                        :disabled="loading"
                        @click="handleLogin"
                    >
                        {{ loading ? 'Ingresando...' : 'Ingresar' }}
                    </ion-button>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
    IonPage, IonContent, IonItem, IonLabel,
    IonInput, IonButton
} from '@ionic/vue'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const correo = ref('')
const clave = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
    error.value = ''
    loading.value = true
    try {
        await auth.login(correo.value, clave.value)
        const rol = auth.usuario?.rol

        if (rol === 2) {
            router.push('/fincas') // veterinario
        } else if (rol === 1) {
            router.push('/ganadero/menu') // ganadero
        } else if (rol === 3) {
            router.push('/ayudante/finca') // ayudante (pendiente)
        } else {
            router.push('/fincas')
        }
    } catch (e) {
        error.value = e.response?.data?.message || 'Error al iniciar sesión.'
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 100%;
    padding: 2rem 0;
}

.login-logo {
    text-align: center;
    margin-bottom: 2rem;
}

.login-logo h1 {
    color: #2d6a4f;
    font-size: 2rem;
    margin: 0;
}

.login-logo p {
    color: #888;
    margin: 0.25rem 0 0;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.login-btn {
    margin-top: 1.5rem;
    --background: #2d6a4f;
}

.error {
    color: red;
    font-size: 0.85rem;
    text-align: center;
    margin: 0.5rem 0;
}
</style>