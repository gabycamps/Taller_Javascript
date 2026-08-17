// Genera un id único combinando Date.now con un número aleatorio, para evitar que dos tareas coincidan en id

const generarId = () => {
    let a = Date.now()
    let b = Math.random()
    a = a.toString()
    b = b.toString().slice(2)
    return a+b
};

let tareas = [];
let filtro = "todas";

// Crea el objeto que representa una tarea nueva a partir del texto ingresado
const crearTarea = (texto) => ({

    id: generarId(),
    texto: texto,
    completada: false
});

// Agrega una tarea nueva al estado, sin mutar el array original (con spread)
const agregarTarea = (texto) => {
    const tarea = crearTarea(texto);
    tareas = [...tareas, tarea];

};

// Elimina la tarea con el id indicado
const eliminarTarea = (id) => {
    tareas = tareas.filter(i => i.id !== id);
};

// Cambia el estado completada de la tarea con el id indicado
const toggleCompletada = (id) => {
    tareas = tareas.map(i => {
        if (i.id === id){
            return {...i, completada: !i.completada};
        } else{
            return i;
        }
    })
};

// Referencia a donde se dibujan las tareas.
const lista = document.querySelector("#lista-tareas");

// Dibuja en el DOM la lista de tareas a partir del estado actual
const render = () => {
    lista.innerHTML = ""; // limpia la lista antes de redibujar

    const tareasFiltro = filtrarTareas()
    const elementos = tareasFiltro.map((tarea) => {
        const li = document.createElement("li");
        li.textContent = tarea.texto;
        li.dataset.id = tarea.id;

        if (tarea.completada) {
            li.classList.add("completada");
        }

        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "🗑️";
        btnEliminar.classList.add("btn-eliminar");
        btnEliminar.dataset.id = tarea.id;
        li.appendChild(btnEliminar);

        return li;
    });

    lista.append(...elementos);
};

// Revisa si un texto tiene al menos un caracter que no sea espacio en blanco
const tieneContenido = (texto) => {
    for (let i = 0; i < texto.length; i++) {
        if (texto[i] !== " ") {
            return true;
        }
    }
    return false;
};

// Referencias a los elementos del DOM que se usan para agregar tareas y mostrar mensajes de error o contador
const btnAgregar = document.querySelector("#btn-agregar");
const input = document.querySelector("#input-tarea");
const mensajeError = document.querySelector("#mensaje-error");
const contador = document.querySelector("#contador");
const btnEliminarCompl = document.querySelector("#btn-eliminar-completadas");
const filtros = document.querySelector("#filtro");

// Al hacer clic en +: valida el texto, agrega la tarea, vuelve a dibujar, actualiza el contador y persiste el nuevo estado en localStorage
btnAgregar.addEventListener("click", () => {
    const texto = input.value;

    if (!tieneContenido(texto)) {
        mensajeError.textContent = "La tarea no puede estar vacía.";
        mensajeError.classList.remove("oculto");
        return;
    }

    mensajeError.classList.add("oculto");
    agregarTarea(texto);
    input.value = "";
    render();
    actualizarContador();
    guardarTareas(tareas);
    
});

// Delegación de eventos: un solo listener en el <ul> para completar o eliminar cualquier tarea
lista.addEventListener("click", (event) => {
    if (event.target.classList.contains("btn-eliminar")) {
        const id = event.target.dataset.id;
        eliminarTarea(id);
        render();
        actualizarContador();
        guardarTareas(tareas);

    } else if (event.target.tagName === "LI") {
        const id = event.target.dataset.id;
        toggleCompletada(id);
        render();
        actualizarContador();
        guardarTareas(tareas);

    }
});

// Calcula cuántas tareas hay en total y cuántas están completadas y actualiza el texto del contador en pantalla
const actualizarContador = () => {
    const total = tareas.length;
    const completadas = tareas.filter(t => t.completada === true).length;

    contador.textContent = `${completadas} de ${total} completadas`;
};

// Guarda el array de tareas en localStorage como texto JSON
function guardarTareas(listaTareas) {
    try {
        localStorage.setItem("tareas", JSON.stringify(listaTareas));
    } catch (error) {
        console.warn("Error al guardar:", error.message);
    }
};

// Recupera el array de tareas guardado en localStorage
function cargarTareas() {
    try {
        let datos = localStorage.getItem("tareas");
        const resultado = datos ? JSON.parse(datos) : [];
        return Array.isArray(resultado) ? resultado : [];
    } catch (error) {
        console.warn("Error al cargar:", error.message);
        return [];
    }
};

// Elimina todas las tareas marcadas como completadas
const eliminarCompletadas = () => {
    tareas = tareas.filter(i => i.completada !== true);
};

// Botón para eliminarlas
btnEliminarCompl.addEventListener("click", () => {

    eliminarCompletadas();
    render();
    actualizarContador();
    guardarTareas(tareas);
    
});

// Filtra las tareas dependiendo del tipo de filtro
const filtrarTareas = () => {
    if (filtro === "pendientes"){
        return tareas.filter(i => i.completada === false);
    }
    else if (filtro === "completadas"){
        return tareas.filter(i => i.completada === true);
    } else {
        return tareas;
    }
};

// Deslizador del filtro
filtros.addEventListener("change", () => {
    filtro = filtros.value;
    render();
});


// Al abrir/recargar la página, se carga el estado guardado
tareas = cargarTareas();
render();
actualizarContador();