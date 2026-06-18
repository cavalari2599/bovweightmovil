import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'BovweightMovil',
  webDir: 'dist',
  server: {
    // App servida como http://localhost para que las llamadas al API local
    // (http://<IP>:8000) NO se bloqueen por "mixed content" (https -> http).
    androidScheme: 'http'
  }
};

export default config;
