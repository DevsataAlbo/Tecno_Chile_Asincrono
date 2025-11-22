class Producto {
    constructor(id, nombre, descripcion, precio, stock, categoria, etiquetas = [], imagen = '') {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.stock = stock;
        this.categoria = categoria;
        this.etiquetas = Array.isArray(etiquetas) ? etiquetas : [];
        this.imagen = imagen || `https://via.placeholder.com/200x200/4A90E2/ffffff?text=${encodeURIComponent(nombre.substring(0, 10))}`;
    }

    // Getters
    get stockDisponible() {
        return this.stock > 0;
    }

    get mensajeStock() {
        if (this.stock === 0) return 'AGOTADO';
        if (this.stock === 1) return 'Ultimo producto en inventario';
        if (this.stock < 4) return `Quedan ${this.stock} unidades`;
        return `Stock: ${this.stock} unidades`;
    }

    get claseStock() {
        if (this.stock === 0) return 'stock-agotado';
        if (this.stock === 1) return 'stock-ultimo';
        if (this.stock < 4) return 'stock-bajo';
        return 'stock-normal';
    }

    // Metodos asincronos
    async reducirStock(cantidad) {
        // Simula verificacion asincrona de stock
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (cantidad > this.stock) {
                    reject(new Error(`Stock insuficiente. Solo quedan ${this.stock} unidades de ${this.nombre}`));
                } else {
                    this.stock -= cantidad;
                    resolve({
                        success: true,
                        mensaje: `Stock actualizado. Quedan ${this.stock} unidades`,
                        productoId: this.id,
                        stockRestante: this.stock
                    });
                }
            }, 500); // Simula latencia de servidor
        });
    }

    async aumentarStock(cantidad) {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.stock += cantidad;
                resolve({
                    success: true,
                    mensaje: `Stock aumentado. Ahora hay ${this.stock} unidades`,
                    productoId: this.id,
                    stockActual: this.stock
                });
            }, 500);
        });
    }

    // Verificacion asincrona de disponibilidad
    async verificarDisponibilidad(cantidadSolicitada) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this.stock === 0) {
                    reject(new Error(`El producto "${this.nombre}" esta agotado`));
                } else if (cantidadSolicitada > this.stock) {
                    reject(new Error(`Stock insuficiente. Solo hay ${this.stock} unidades disponibles`));
                } else {
                    resolve({
                        disponible: true,
                        stockActual: this.stock,
                        cantidadSolicitada: cantidadSolicitada
                    });
                }
            }, 300); // Simula verificacion en servidor
        });
    }

    coincideBusqueda(textoBusqueda) {
        const texto = textoBusqueda.toLowerCase();
        return (
            this.nombre.toLowerCase().includes(texto) ||
            this.descripcion.toLowerCase().includes(texto) ||
            this.categoria.toLowerCase().includes(texto) ||
            this.etiquetas.some(etiqueta => etiqueta.toLowerCase().includes(texto))
        );
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            descripcion: this.descripcion,
            precio: this.precio,
            stock: this.stock,
            categoria: this.categoria,
            etiquetas: this.etiquetas,
            imagen: this.imagen
        };
    }

    static fromJSON(json) {
        return new Producto(
            json.id,
            json.nombre,
            json.descripcion,
            json.precio,
            json.stock,
            json.categoria,
            json.etiquetas,
            json.imagen
        );
    }
}
