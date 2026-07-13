# Second Brain OS

Tu sistema personal de claridad mental. Todo el diseño y la lógica ya están listos —
esto son los pasos para que quede online y lo tengas en el celular como una app más.

## 1. Subir el proyecto a GitHub

1. Creá un repositorio nuevo en GitHub (puede ser privado).
2. Desde esta carpeta, en una terminal:
   ```
   git init
   git add .
   git commit -m "Second Brain OS"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
   git push -u origin main
   ```

## 2. Conseguir tu API key de Anthropic

1. Entrá a [console.anthropic.com](https://console.anthropic.com).
2. Creá una API key (sección "API Keys").
3. Guardala — la vas a necesitar en el paso siguiente. **Nunca la pegues dentro del código ni la subas a GitHub.**

> Nota: esta key es de la API de pago de Anthropic (consumo por uso), separada de tu cuenta normal de Claude.ai. Sin esto, todo el resto de la app funciona igual — solo las funciones con IA (Brain Dump, Preguntar a la IA, Resumen semanal) van a fallar de forma controlada.

## 3. Desplegar en Vercel

1. Entrá a [vercel.com](https://vercel.com) e iniciá sesión con tu cuenta de GitHub.
2. "Add New… → Project" y elegí el repositorio que acabás de subir.
3. Framework Preset: dejalo en **Other** (no hace falta build, es HTML + funciones serverless).
4. Antes de darle a "Deploy", abrí **Environment Variables** y agregá:
   - Name: `ANTHROPIC_API_KEY`
   - Value: la key que copiaste en el paso 2
5. Deploy. En un minuto te da una URL tipo `https://second-brain-os-tuusuario.vercel.app`.

Esa URL ya es tu app, funcionando de verdad, con IA incluida.

## 4. Tenerlo en el celular

**iPhone (Safari):**
1. Abrí la URL de Vercel en Safari.
2. Tocá el ícono de compartir (el cuadrado con la flecha hacia arriba).
3. "Agregar a pantalla de inicio".

**Android (Chrome):**
1. Abrí la URL en Chrome.
2. Tocá los tres puntos (⋮) arriba a la derecha.
3. "Instalar app" o "Agregar a pantalla de inicio".

Queda como un ícono más en tu celular, abre en pantalla completa (sin la barra del navegador) y funciona offline para todo lo que no sea IA, gracias al service worker incluido.

## Notas técnicas

- **Guardado de datos:** todo se guarda en el almacenamiento local del navegador (`localStorage`). Vive en tu celular/computadora, no en un servidor — si borrás datos del navegador o cambiás de dispositivo, no se sincroniza solo. Si más adelante querés que tus notas viajen entre el celular y la compu, el siguiente paso natural es sumar una base de datos (Vercel Postgres o Supabase son las opciones más simples) — avisame si querés que lo preparemos.
- **La IA corre en el servidor:** las 3 funciones de IA (`/api/ai` con `type: classify | ask | review`) viven en `/api/ai.js` y corren en Vercel, no en el navegador — así tu API key nunca queda expuesta.
- **Costo:** cada vez que usás Brain Dump, Preguntar a la IA o el Resumen semanal, consume créditos de tu cuenta de la API de Anthropic (son montos muy chicos por uso normal, pero es bueno saberlo).
