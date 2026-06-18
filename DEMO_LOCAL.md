# Demo local en Android (APK que hace pesaje) — sin producción

Todo corre en tu PC. El celular solo habla con **Laravel (:8000)** por Wi-Fi.
Laravel internamente llama al **ML (:8001)** y a **MySQL**, que nunca salen de la PC.

```
[ Celular Android ]  --Wi-Fi-->  [ Tu PC :8000 Laravel ] --localhost--> [ ML :8001 ] + [ MySQL ]
```

## 0. Requisito de red
- El **celular y la PC en la MISMA Wi-Fi**.
- IP LAN de tu PC ahora: **192.168.0.x** (ya quedó puesta en `.env.production`).
  - Si cambia (otra red/reinicio), corré `ipconfig`, mirá la "Dirección IPv4" del adaptador Wi-Fi, actualizá `.env.production` y recompilá.

## 1. Levantar los 3 servicios en la PC

**MySQL** — encendé tu MySQL (XAMPP / Laragon / servicio).

**ML (FastAPI, puerto 8001):**
```powershell
cd C:\Users\danis\Desktop\ProyectoBovweight\BovweightML
# activar venv si aplica:  .\venv\Scripts\Activate.ps1
uvicorn main:app --host 127.0.0.1 --port 8001
```

**Laravel (API, escuchando en toda la red, puerto 8000):**
```powershell
cd C:\Users\danis\Desktop\ProyectoBovweight\BovweightBackend
php artisan serve --host=0.0.0.0 --port=8000
```
> `--host=0.0.0.0` es la clave: sin eso el celular NO alcanza el API.

## 2. Permitir el puerto 8000 en el Firewall de Windows (una sola vez)
PowerShell **como administrador**:
```powershell
New-NetFirewallRule -DisplayName "Laravel 8000 LAN" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
```

## 3. Compilar el APK

> El paso `vite build + cap sync` ya está hecho (`android/` está lista). Para
> generar el `.apk` necesitás el **SDK de Android + JDK 17**, que esta máquina
> aún NO tiene. Elegí UN camino:

### Camino fácil — Android Studio (recomendado)
1. Instalá **Android Studio** (trae SDK + JDK juntos): https://developer.android.com/studio
2. Abrí la carpeta `C:\Users\danis\Desktop\ProyectoBovweight\BovweightMovil\android`.
   - Android Studio crea `local.properties` y descarga el SDK solo.
3. Menú **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
4. Cuando termine, click en **locate** → te lleva al `app-debug.apk`.

### Camino consola (si preferís sin IDE)
1. Instalá **JDK 17** (Temurin/Adoptium) y los **Android command-line tools**.
2. Seteá variables y la ruta del SDK:
   ```powershell
   $env:JAVA_HOME = "C:\ruta\al\jdk-17"
   $env:ANDROID_HOME = "C:\ruta\al\Android\Sdk"
   # crear android\local.properties con: sdk.dir=C:\\ruta\\al\\Android\\Sdk
   ```
3. Compilá:
   ```powershell
   cd C:\Users\danis\Desktop\ProyectoBovweight\BovweightMovil
   pnpm run apk:build          # vite build (prod, usa .env.production) + cap sync android
   cd android
   .\gradlew.bat assembleDebug
   ```

APK generado en:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

> Cada vez que cambies código de la app, reejecutá `pnpm run apk:build` antes
> de volver a compilar en Android Studio / gradlew.

## 4. Instalar en el celular
- Pasá el `app-debug.apk` al teléfono (USB, WhatsApp Web, Drive, etc.) e instalalo
  (activá "instalar apps de orígenes desconocidos").
- O por cable con USB debugging:
  ```powershell
  adb install -r android\app\build\outputs\apk\debug\app-debug.apk
  ```

## 5. Probar el pesaje
1. Abrí la app, login.
2. Captura Rápida → tomá foto lateral de la vaca → "Estimar peso".
3. La foto viaja al API (192.168.0.6:8000) → Laravel → ML → devuelve el peso.

## Si algo falla
- **"No se pudo conectar con el servidor"** → el cel no llega al API:
  - ¿Misma Wi-Fi? ¿`php artisan serve --host=0.0.0.0`? ¿Regla de firewall? ¿IP correcta en `.env.production` y recompilaste?
  - Probá desde el navegador del celular: `http://192.168.0.6:8000/api` debe responder algo (no "sin conexión").
- **Estima pero da error de peso** → el ML (8001) no está corriendo en la PC.
- **Sin internet en el potrero** → la app encola la foto (modo offline) y la estima al reconectar; eso también se puede demostrar.

## Notas
- Es un **APK debug** (sin firmar para tienda). Suficiente para la demo; no es para producción.
- Cleartext HTTP habilitado solo para esta demo local (`usesCleartextTraffic`).
- La app se sirve como `http://localhost` (`androidScheme: 'http'` en `capacitor.config.ts`)
  para que las llamadas al API local no se bloqueen por "mixed content".

---

## Re-correr en otra Wi-Fi (paso a paso)

1. **Misma red**: PC y celular en la nueva Wi-Fi.
2. **IP nueva de la PC**: `ipconfig` → IPv4 del adaptador **"Wi-Fi"** (la `192.168.x.x`,
   nunca la `169.254.x.x`).
3. **¿Cambió la IP?**
   - Misma → no recompilás, el APK actual sirve. Saltá al paso 5.
   - Distinta → editá `.env.production`:
     ```
     notepad C:\Users\danis\Desktop\ProyectoBovweight\BovweightMovil\.env.production
     ```
     ```
     VITE_API_HOST=http://LA-IP-NUEVA:8000
     ```
4. **Recompilar APK** (solo si cambió la IP):
   ```powershell
   cd C:\Users\danis\Desktop\ProyectoBovweight\BovweightMovil
   pnpm run apk:build
   ```
   Android Studio → **Build → Generate App Bundles or APKs → Generate APKs** → reinstalar el `app-debug.apk`.
5. **Levantar servicios** en la PC: MySQL + ML (`uvicorn main:app --host 127.0.0.1 --port 8001`)
   + Laravel (`php artisan serve --host=0.0.0.0 --port=8000`).
6. **Probar** desde el navegador del cel: `http://LA-IP-NUEVA:8000/api` → 404 = bien.
7. Abrir app → login → Captura Rápida → foto → Estimar.

> El firewall (puerto 8000) ya quedó configurado, no se repite.
