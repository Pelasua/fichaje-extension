# Fichaje Frappe HR

Extensión de Chrome (Manifest V3) para fichar en una instancia de [Frappe HR](https://github.com/frappe/hrms), por ejemplo `https://fichaje.tuempresa.com`.

- Pide dominio y credenciales, inicia sesión y se sincroniza con tu empleado.
- Botón de **Entrada** / **Salida** según tu último fichaje y reloj con el tiempo que llevas dentro.
- Pestaña **Semana** con las horas trabajadas cada día de la semana actual (lunes a domingo).
- Si la instancia exige geolocalización (`HR Settings → Allow Geolocation Tracking`), la envía al fichar.

## Instalación

1. `chrome://extensions` → activar **Modo de desarrollador**.
2. **Cargar extensión sin empaquetar** → seleccionar esta carpeta.
3. Abrir el popup, introducir dominio, usuario y contraseña, y aceptar el permiso de acceso al dominio.

## Notas

- Usa la cookie de sesión del navegador: al conectar, también quedas logueado en la web, y viceversa.
- Las credenciales se guardan en `chrome.storage.local` (sin cifrar) para volver a iniciar sesión cuando caduca. «Desconectar» las borra.
- Las horas se interpretan en la zona horaria del navegador, que debe coincidir con la del servidor.

## Tests

```bash
npm test
```
