<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="success">
                <ion-title>BovWeight CR</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="handleLogout">
                        <ion-icon :icon="logOutOutline" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <div class="bienvenida">
                <h2>Bienvenido, {{ auth.usuario?.nombre }}</h2>
                <p>¿Qué deseas hacer hoy?</p>
            </div>

            <div class="menu">
                <div class="menu-card" @click="router.push('/ganadero/fincas')">
                    <ion-icon :icon="homeOutline" class="menu-icon" />
                    <h3>Administrar Fincas</h3>
                    <p>Gestiona tus fincas, veterinarios y ayudantes</p>
                </div>

                <div class="menu-card deshabilitado">
                    <ion-icon :icon="scaleOutline" class="menu-icon" />
                    <h3>Pesaje Rápido</h3>
                    <p>Próximamente disponible</p>
                </div>

                <div class="menu-card" @click="router.push('/ganadero/animales')">
                    <ion-icon :icon="pawOutline" class="menu-icon" />
                    <h3>Administrar Animales</h3>
                    <p>Gestiona tus animales, pesajes y tratamientos</p>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon
} from '@ionic/vue'
import { homeOutline, scaleOutline, pawOutline, logOutOutline } from 'ionicons/icons'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

async function handleLogout() {
    await auth.logout()
    router.push('/login')
}
</script>

<style scoped>
.bienvenida {
    margin-bottom: 2rem;
}

.bienvenida h2 {
    color: #2d6a4f;
    margin: 0;
}

.bienvenida p {
    color: #888;
    margin: 0.25rem 0 0;
}

.menu {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.menu-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    cursor: pointer;
    border-left: 4px solid #2d6a4f;
    transition: transform 0.1s;
}

.menu-card:active {
    transform: scale(0.98);
}

.menu-card.deshabilitado {
    border-left-color: #ccc;
    opacity: 0.6;
    cursor: not-allowed;
}

.menu-icon {
    font-size: 2rem;
    color: #2d6a4f;
    margin-bottom: 0.5rem;
}

.deshabilitado .menu-icon {
    color: #aaa;
}

.menu-card h3 {
    margin: 0 0 0.25rem;
    color: #333;
}

.menu-card p {
    margin: 0;
    color: #888;
    font-size: 0.85rem;
}
</style>