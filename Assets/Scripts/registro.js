let btnAdd
let btncancAdd
let arregloPersonas = []
const modal = document.querySelector('#modal-container');
const loader = document.querySelector('#global-loader');

btncancAdd = document.querySelector('#btn-cancAdd');
    btncancAdd.addEventListener('click', cancelEdic);


/*
*   FUNCIONES DEL MODAL Y PANTALLA DE CARGA
*/
function showLoader() {
    loader?.classList.remove('modal-oculto');
}

function hideLoader() {
    loader?.classList.add('modal-oculto');
}

function showModal() {
    modal?.classList.remove('modal-oculto');
}

function hideModal() {
    modal?.classList.add('modal-oculto');
}


//CREATE
async function create(persona) {
    showLoader();
    try {
        const url = `https://fi.jcaguilar.dev/v1/escuela/persona`
        let response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(persona) 
        });

        if (!response.ok) {
            let errorData = await response.json();
            console.error("Error del servidor:", response.status, errorData);
            throw new Error(`Error HTTP: ${response.status}`);
        }
        let data = await response.json();
        console.log("Respuesta del servidor al guardar:", data);
        return true;
    } catch (err) {
        console.error("Error de red o al procesar la respuesta:", err);
        return false;
    } finally {
        hideLoader();
    }
}

//READ
async function read() {
    showLoader();
    try {
        let request = await fetch(`https://fi.jcaguilar.dev/v1/escuela/persona`,{
            method: 'GET'
        });
        let data = await request.json();
        console.log("Datos obtenidos del servidor:", data);
        arregloPersonas = data;
    } catch (err) {
        console.error("Error al obtener los datos:", err);
        arregloPersonas = [];
    } finally {
        hideLoader();
    }
}

//UPDATE
async function update(persona) {
    showLoader();
    try {
        const id = persona.id_persona;
        if (!id || id === 0) {
            console.error("ID de persona requerido para actualizar.");
            return false;
        }

        const url = `https://fi.jcaguilar.dev/v1/escuela/persona`; 
        let response = await fetch(url, {
            method: 'PATCH', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(persona) 
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error al actualizar (HTTP ${response.status}). Respuesta del servidor:`, errorText.substring(0, 100) + '...');
            throw new Error(`Error HTTP: ${response.status}`);
        }
        console.log(`Persona con ID ${id} actualizada exitosamente.`);
        return true;
    } catch (err) {
        console.error("Error al ejecutar la actualización:", err);
        return false;
    } finally {
        hideLoader();
    }
}

//DELETE
async function delet(id) {
    showLoader();
    try {
        if (!id) {
            console.error("ID de persona requerido para eliminar.");
            return false;
        }
        
        const url = `https://fi.jcaguilar.dev/v1/escuela/persona`; 

        let response = await fetch(url, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_persona: parseInt(id) })
        });

        if (!response.ok) {
             const errorText = await response.text();
             console.error(`Error al eliminar (HTTP ${response.status}). Respuesta del servidor:`, errorText.substring(0, 100) + '...');
             throw new Error(`Error HTTP: ${response.status}`);
        }
        
        if (response.status === 204 || response.status === 200) {
            console.log(`Persona con ID ${id} eliminada exitosamente.`);
            return true;
        } else {
            console.warn(`DELETE exitoso con código inesperado: ${response.status}`);
            return true;
        }
    } catch (err) {
        console.error("Error al ejecutar la eliminación:", err);
        return false;
    } finally {
        hideLoader();
    }
}

//Funcion del boton para registrar actualizar personas
async function add(evt) { 
    evt.preventDefault();
    
    const btn = document.querySelector('#btn-add');
    const idParaEditar = btn.dataset.id; 
    
    let nombre = document.querySelector('#Nombre').value;
    let apellido = document.querySelector('#Apellido').value;
    let rol = document.querySelector('#rol').value;

    if (!nombre || !apellido || !rol) {
        return alert("Por favor, complete Nombre, Apellido y seleccione un Rol.");
    }
    
    let persona = {
        id_persona: idParaEditar ? parseInt(idParaEditar, 10) : 0, 
        nombre: nombre,
        apellido: apellido,
        sexo: document.querySelector('input[name=sexo]:checked')?.value || 'h',
        fh_nac: document.querySelector('#fecha_nac').value,
        id_rol: parseInt(rol, 10),
    };

    let success;

    if (idParaEditar) {
        success = await update(persona);
    } else {
        success = await create(persona);
    }

    if (success) {
        await read(); 
        printPersonas(); 
        
        if (typeof cancelEdic === 'function') {
            cancelEdic();
        }
    }
}

/*
*   Obtiene los datos de la persona para editarlos y los muestra
*   en el formulario
*/
function cargarEdicion(id) {
    const persona = arregloPersonas.find(p => (p.id || p.id_persona) == id);

    if (!persona) {
        return alert("No se encontró la persona para editar.");
    }

    document.querySelector('#Nombre').value = persona.nombre || '';
    document.querySelector('#Apellido').value = persona.apellido || '';
    const sexoInput = document.querySelector(`input[name=sexo][value=${persona.sexo}]`);
    if (sexoInput) sexoInput.checked = true;
    document.querySelector('#fecha_nac').value = persona.fh_nac ? persona.fh_nac.substring(0, 10) : '';
    document.querySelector('#rol').value = (persona.id_rol || persona.rol || '').toString(); 
    document.querySelector('#btn-add').dataset.id = id; 
    document.querySelector('#btn-add').textContent = 'Guardar Cambios';
    document.querySelector('h1').textContent = `Editando a ${persona.nombre} (ID: ${id})`;
    
    showModal();
}

//Funcion para cerrar el modal
function cancelEdic() {
    document.querySelector('#registro-form')?.reset();

    const btn = document.querySelector('#btn-add');
    btn.removeAttribute('data-id'); 
    btn.textContent = 'Agregar';
    
    document.querySelector('h1').textContent = 'Registro de estudiantes';

    const btnCancel = document.querySelector('#btn-cancel');
    if (btnCancel) {
        btnCancel.remove();
    }
    
    hideModal();
}

//Acciones para los botones de editar y eliminar
function btnElimEdit() {
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', async (evt) => {
            const id = evt.target.dataset.id;
            if (confirm(`¿Está seguro de eliminar a la persona con ID ${id}? Esta acción es irreversible.`)) { 
                const success = await delet(id);
                
                if (success) {
                    await read();
                    printPersonas();
                } else {
                    alert('Hubo un error al intentar eliminar la persona.');
                }
            }
        });
    });
    
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', (evt) => {
            const id = evt.target.dataset.id;
            cargarEdicion(id);
        });
    });
}

//Mostrar las personas en la tabla
function printPersonas() {
    let table = document.querySelector('table tbody')
    if (!table) return console.error("No se encontró el <tbody> de la tabla.");
    
    table.innerHTML = ''

    for (let persona of arregloPersonas) {
        const personaId = persona.id || persona.id_persona || '';

        let fechaFormateada = persona.fh_nac
            ? new Date(persona.fh_nac).toLocaleDateString('es-MX', { timeZone: 'UTC' })
            : 'N/A'

        const rolDisplay = persona.rol || persona.id_rol || ''; 

        table.innerHTML += `
        <tr>
            <td>${personaId}</td>
            <td>${persona.nombre || ''}</td>
            <td>${persona.apellido || ''}</td>
            <td>${persona.sexo || ''}</td>
            <td>${fechaFormateada}</td>
            <td>${rolDisplay}</td>

            <td>
                <button class="btn-edit" data-id="${personaId}">Editar</button>
                <button class="btn-delete" data-id="${personaId}">Eliminar</button>
            </td>

        </tr>`
    }
    btnElimEdit();
}

//Funcion init de configuración
async function init() {
    await read();
    printPersonas();

    document.querySelector('#btn-show-modal')?.addEventListener('click', () => {
        cancelEdic();
        showModal();
        document.querySelector('h1').textContent = 'Registrar nueva persona';
    });

    btnAdd = document.querySelector('#btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', add);
    } else {
        console.error("El botón #btn-add no se encontró en el DOM.");
    }
}

window.addEventListener('load', init);