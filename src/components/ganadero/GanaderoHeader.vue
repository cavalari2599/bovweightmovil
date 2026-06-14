<template>
    <ion-header>
        <ion-toolbar color="success">
            <ion-buttons slot="start" v-if="showBack">
                <ion-back-button :default-href="backHref" />
            </ion-buttons>
            <ion-title>{{ title }}</ion-title>
            <ion-buttons slot="end">
                <slot name="actions" />
                <ion-button v-if="showHome" @click="irMenu">
                    <ion-icon :icon="homeOutline" />
                </ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonBackButton, IonIcon } from '@ionic/vue'
import { homeOutline } from 'ionicons/icons'
import { paths } from '../../router/paths'

defineProps({
    title: { type: String, default: '' },
    backHref: { type: String, default: paths.ganadero.menu },
    showBack: { type: Boolean, default: true },
    showHome: { type: Boolean, default: true },
})

const router = useRouter()
function irMenu() {
    router.push(paths.ganadero.menu)
}
</script>
