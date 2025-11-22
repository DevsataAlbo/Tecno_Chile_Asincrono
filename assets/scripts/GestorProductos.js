class GestorProductos {
    constructor() {
        this.productos = [];
        this.cargando = false;
    }

    // Metodo asincrono para cargar productos desde JSON usando fetch()
    async cargarProductosDesdeJSON() {
        this.cargando = true;
        console.log("Iniciando carga de productos desde JSON...");

        try {
            // Usar fetch() para leer el archivo JSON de forma asincrona
            const response = await fetch('assets/data/productos.json');

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const productosJSON = await response.json();

            // Convertir los datos JSON a instancias de Producto
            this.productos = productosJSON.map(p => Producto.fromJSON(p));

            console.log(`${this.productos.length} productos cargados exitosamente`);

            this.cargando = false;

            return {
                success: true,
                mensaje: 'Productos cargados correctamente',
                cantidad: this.productos.length
            };
        } catch (error) {
            this.cargando = false;
            console.error("Error al cargar productos:", error);

            throw new Error(`Error al cargar productos: ${error.message}`);
        }
    }

    // Metodo asincrono para guardar en localStorage (simula guardado en servidor)
    async guardarEnServidor() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const productosJSON = this.productos.map(p => p.toJSON());
                localStorage.setItem('tecnochile_productos', JSON.stringify(productosJSON));

                console.log("Datos guardados en el servidor (localStorage)");

                resolve({
                    success: true,
                    mensaje: 'Datos guardados correctamente',
                    timestamp: new Date().toISOString()
                });
            }, 500); // Simula latencia de servidor
        });
    }

    // Metodo asincrono para actualizar stock en el servidor
    async actualizarStockEnServidor(productoId, nuevoStock) {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                const producto = this.obtenerPorId(productoId);

                if (!producto) {
                    reject(new Error('Producto no encontrado'));
                    return;
                }

                producto.stock = nuevoStock;

                try {
                    await this.guardarEnServidor();
                    resolve({
                        success: true,
                        mensaje: 'Stock actualizado en el servidor',
                        productoId: productoId,
                        nuevoStock: nuevoStock
                    });
                } catch (error) {
                    reject(error);
                }
            }, 800); // Simula latencia de servidor
        });
    }

    obtenerTodos() {
        return [...this.productos];
    }

    obtenerPorId(id) {
        return this.productos.find(p => p.id === parseInt(id));
    }

    agregar(producto) {
        const nuevoId = this.productos.length > 0
            ? Math.max(...this.productos.map(p => p.id)) + 1
            : 1;
        producto.id = nuevoId;
        this.productos.push(producto);
        return producto;
    }

    actualizar(id, datosActualizados) {
        const index = this.productos.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            this.productos[index] = { ...this.productos[index], ...datosActualizados };
            return true;
        }
        return false;
    }

    eliminar(id) {
        const index = this.productos.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            this.productos.splice(index, 1);
            return true;
        }
        return false;
    }

    filtrar({ categoria, precioMin, precioMax, textoBusqueda }) {
        let resultados = [...this.productos];

        if (categoria && categoria !== 'todas') {
            resultados = resultados.filter(p => p.categoria === categoria);
        }

        if (precioMin !== undefined && precioMin !== '') {
            resultados = resultados.filter(p => p.precio >= parseFloat(precioMin));
        }

        if (precioMax !== undefined && precioMax !== '') {
            resultados = resultados.filter(p => p.precio <= parseFloat(precioMax));
        }

        if (textoBusqueda && textoBusqueda.trim() !== '') {
            resultados = resultados.filter(p => p.coincideBusqueda(textoBusqueda));
        }

        return resultados;
    }

    obtenerCategorias() {
        const categorias = [...new Set(this.productos.map(p => p.categoria))];
        return categorias.sort();
    }

    obtenerRangoPrecio() {
        if (this.productos.length === 0) return { min: 0, max: 0 };
        const precios = this.productos.map(p => p.precio);
        return {
            min: Math.min(...precios),
            max: Math.max(...precios)
        };
    }
}
