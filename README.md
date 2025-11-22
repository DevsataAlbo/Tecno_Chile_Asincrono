# Tecno Chile - Sistema de Gestion de Inventario Asincrono

Sistema de tienda en linea con programacion asincrona para gestion de inventario, procesamiento de compras y notificaciones.

## Instalacion

Clona el repositorio:

```bash
git clone https://github.com/DevsataAlbo/Tecno_Chile_Asincrono.git
cd "Tecno_Chile_Asincrono"
```

## Ejecutar en local

Abre el archivo `index.html` en tu navegador con un servidor local.

Recomendado usar Live Server u otro servidor HTTP local debido al uso de fetch() para cargar el archivo JSON.

## Implementacion de Programacion Asincrona

### 1. Lectura de productos con fetch()
- Carga asincrona del archivo `productos.json` usando fetch()
- Inicializacion de la tienda con datos del servidor
- Manejo de errores en la carga de datos

### 2. Actualizacion de stock asincrona
- Reduccion de stock simulando operacion en servidor
- Uso de setTimeout() para simular latencia de red
- Guardado de cambios en localStorage como servidor

### 3. Verificacion de stock asincrona
- Verificacion previa antes de agregar al carrito
- Mensaje de error cuando no hay stock disponible
- Validacion asincrona antes de finalizar compra

### 4. Notificacion por correo asincrona
- Simulacion de envio de correo al responsable de inventario
- Peticion asincrona a servidor de correo (simulado)
- Detalles de compra en notificacion

## Funcionalidades

- Carga de productos desde JSON con fetch()
- Filtrado por categoria, precio y texto
- Carrito de compras con validacion de stock
- Proceso de compra asincrono completo
- Notificaciones automaticas por correo
- Indicadores de carga durante operaciones asincronas
- Manejo de errores en todas las operaciones

## Tecnologias

- JavaScript ES6+ (Async/Await, Promises)
- Fetch API
- Bootstrap 5.3.0
- LocalStorage (simulando servidor)
- CSS3
