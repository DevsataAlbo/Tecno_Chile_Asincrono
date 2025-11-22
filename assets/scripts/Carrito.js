class Carrito {
    constructor() {
        this.items = [];
    }

    agregar(producto, cantidad) {
        const itemExistente = this.items.find(item => item.producto.id === producto.id);

        if (itemExistente) {
            itemExistente.cantidad += cantidad;
        } else {
            this.items.push({ producto, cantidad });
        }
    }

    eliminar(productoId) {
        this.items = this.items.filter(item => item.producto.id !== productoId);
    }

    modificarCantidad(productoId, nuevaCantidad) {
        const item = this.items.find(item => item.producto.id === productoId);
        if (item) {
            item.cantidad = nuevaCantidad;
        }
    }

    limpiar() {
        this.items = [];
    }

    get total() {
        return this.items.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);
    }

    get cantidadTotal() {
        return this.items.reduce((sum, item) => sum + item.cantidad, 0);
    }

    get vacio() {
        return this.items.length === 0;
    }

    // Validacion asincrona de stock
    async validarStock() {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    for (const item of this.items) {
                        // Verifica cada producto de forma asincrona
                        await item.producto.verificarDisponibilidad(item.cantidad);
                    }
                    resolve({ valido: true, mensaje: 'Stock validado correctamente' });
                } catch (error) {
                    reject({ valido: false, mensaje: error.message });
                }
            }, 500);
        });
    }

    // Proceso de compra asincrono
    async procesarCompra() {
        return new Promise(async (resolve, reject) => {
            try {
                // Paso 1: Validar stock
                await this.validarStock();

                // Paso 2: Reducir stock de cada producto
                const actualizaciones = [];
                for (const item of this.items) {
                    const resultado = await item.producto.reducirStock(item.cantidad);
                    actualizaciones.push(resultado);
                }

                // Paso 3: Enviar notificacion
                await this.enviarNotificacionCompra();

                resolve({
                    success: true,
                    mensaje: 'Compra procesada exitosamente',
                    total: this.total,
                    cantidadProductos: this.cantidadTotal,
                    actualizaciones: actualizaciones
                });
            } catch (error) {
                reject({
                    success: false,
                    mensaje: error.message || 'Error al procesar la compra'
                });
            }
        });
    }

    // Simulacion de notificacion asincrona por correo
    async enviarNotificacionCompra() {
        return new Promise((resolve, reject) => {
            console.log("Enviando notificacion por correo...");

            setTimeout(() => {
                const notificacion = {
                    destinatario: "inventario@tecnochile.cl",
                    asunto: "Nueva compra realizada",
                    mensaje: `Se ha procesado una compra por un total de $${this.total.toLocaleString('es-CL')}`,
                    productos: this.items.map(item => ({
                        nombre: item.producto.nombre,
                        cantidad: item.cantidad,
                        subtotal: item.producto.precio * item.cantidad
                    })),
                    timestamp: new Date().toISOString()
                };

                console.log("Notificacion enviada:", notificacion);
                resolve({
                    success: true,
                    mensaje: 'Notificacion enviada al responsable de inventario',
                    detalles: notificacion
                });
            }, 1000); // Simula latencia de servidor de correo
        });
    }

    toJSON() {
        return this.items.map(item => ({
            productoId: item.producto.id,
            cantidad: item.cantidad
        }));
    }

    static fromJSON(json, productos) {
        const carrito = new Carrito();
        json.forEach(item => {
            const producto = productos.find(p => p.id === item.productoId);
            if (producto) {
                carrito.agregar(producto, item.cantidad);
            }
        });
        return carrito;
    }
}
