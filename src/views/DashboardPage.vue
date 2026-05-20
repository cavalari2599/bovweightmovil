<template>
    <ion-page>
        <ion-tabs>
            <ion-router-outlet />
            <ion-tab-bar slot="bottom">
                <ion-tab-button tab="fincas" href="/fincas">
                    <ion-icon :icon="homeOutline" />
                    <ion-label>Fincas</ion-label>
                </ion-tab-button>
            </ion-tab-bar>
        </ion-tabs>
    </ion-page>
</template>

<script setup>
import {
    IonPage, IonTabs, IonRouterOutlet,
    IonTabBar, IonTabButton, IonIcon, IonLabel
} from '@ionic/vue'
import { homeOutline } from 'ionicons/icons'
</script>