// Función para generar un color aleatorio para avatares
function getRandomColor() {
    const colors = [
        '#4285f4', // Azul
        '#ea4335', // Rojo
        '#fbbc05', // Amarillo
        '#34a853', // Verde
        '#8a4fbf', // Morado
        '#f25022', // Rojo anaranjado
        '#00a4ef', // Azul claro
        '#7fba00', // Verde claro
        '#ff9900'  // Naranja
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Función para obtener iniciales del nombre
function getInitials(name) {
    if (!name) return 'UN'; // Usuario No identificado
    
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}// Inicializar grupos
const groupItems = document.querySelectorAll('.group-list .group-item');
const chats = {};
// Guardar colores de avatar por usuario para consistencia durante toda la sesión
const userColors = {};

// Crear objeto para almacenar mensajes por grupo
groupItems.forEach(item => {
    const id = item.getAttribute('data-id');
    const name = item.querySelector('.group-name').textContent;
    const initials = item.querySelector('.avatar').textContent;
    
    chats[id] = {
        name: name,
        initials: initials,
        messages: []
    };
});

// Elementos del DOM
const chatArea = document.getElementById('chat-area');
const emptyState = document.getElementById('empty-state');
const chatBody = document.getElementById('chat-body');
const chatName = document.getElementById('chat-name');
const chatAvatar = document.getElementById('chat-avatar');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

let activeChat = null;

// Función para mostrar mensajes de un chat
function showChat(chatId) {
    // Actualizar chat activo
    activeChat = chatId;
    
    // Actualizar encabezado
    chatName.textContent = chats[chatId].name;
    chatAvatar.textContent = chats[chatId].initials;
    
    // Ocultar estado vacío y mostrar área de chat
    emptyState.style.display = 'none';
    chatArea.style.display = 'flex';
    
    // Renderizar mensajes
    renderMessages(chatId);
}

// Renderizar mensajes de un chat
function renderMessages(chatId) {
    chatBody.innerHTML = '';
    
    chats[chatId].messages.forEach(msg => {
        if (msg.sent) {
            // Mensajes enviados - sin avatar
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'message-sent');
            
            const textElement = document.createElement('div');
            textElement.classList.add('message-text');
            textElement.textContent = msg.text;
            
            const timeElement = document.createElement('div');
            timeElement.classList.add('message-time');
            timeElement.textContent = msg.time;
            
            messageElement.appendChild(textElement);
            messageElement.appendChild(timeElement);
            
            chatBody.appendChild(messageElement);
        } else {
            // Mensajes recibidos - con avatar
            const containerElement = document.createElement('div');
            containerElement.classList.add('message-received-container');
            
            // Generar o recuperar color consistente para este usuario
            if (!userColors[msg.sender]) {
                userColors[msg.sender] = getRandomColor();
            }
            const userColor = userColors[msg.sender];
            
            // Crear avatar
            const avatarElement = document.createElement('div');
            avatarElement.classList.add('message-avatar');
            avatarElement.style.backgroundColor = userColor;
            avatarElement.textContent = getInitials(msg.sender);
            
            // Crear mensaje
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'message-received');
            
            // Añadir información del remitente para mensajes recibidos
            const senderElement = document.createElement('div');
            senderElement.classList.add('message-sender');
            senderElement.textContent = msg.sender || 'Usuario';
            
            const textElement = document.createElement('div');
            textElement.classList.add('message-text');
            textElement.textContent = msg.text;
            
            const timeElement = document.createElement('div');
            timeElement.classList.add('message-time');
            timeElement.textContent = msg.time;
            
            messageElement.appendChild(senderElement);
            messageElement.appendChild(textElement);
            messageElement.appendChild(timeElement);
            
            // Añadir avatar y mensaje al contenedor
            containerElement.appendChild(avatarElement);
            containerElement.appendChild(messageElement);
            
            chatBody.appendChild(containerElement);
        }
    });
    
    // Scroll al último mensaje
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Función para enviar un mensaje
function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !activeChat) return;
    
    // Crear objeto de mensaje
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const message = {
        text: text,
        time: time,
        sent: true
    };
    
    // Añadir mensaje a la lista
    chats[activeChat].messages.push(message);
    
    // Renderizar mensajes
    renderMessages(activeChat);
    
    // Limpiar entrada
    messageInput.value = '';
    
    // Generar respuesta automática después de un delay aleatorio
    setTimeout(() => {
        const autoResponses = [
            "¡Gracias por tu mensaje!",
            "El profesor revisará esto pronto.",
            "Recuerda entregar la tarea antes del viernes.",
            "¿Alguien más tiene la misma pregunta?",
            "Vamos a revisar esto en la próxima clase."
        ];
        
        const senders = [
            "Profesor García",
            "María Rodríguez",
            "Juan Carlos",
            "Ana Martínez",
            "Luis Mendoza"
        ];
        
        const randomResponse = autoResponses[Math.floor(Math.random() * autoResponses.length)];
        const randomSender = senders[Math.floor(Math.random() * senders.length)];
        
        const response = {
            text: randomResponse,
            time: `${now.getHours()}:${String(now.getMinutes() + 1).padStart(2, '0')}`,
            sent: false,
            sender: randomSender
        };
        
        chats[activeChat].messages.push(response);
        renderMessages(activeChat);
    }, Math.random() * 2000 + 1000);
}

// Event listeners
groupItems.forEach(item => {
    item.addEventListener('click', function() {
        // Actualizar clase activa
        groupItems.forEach(el => el.classList.remove('active'));
        this.classList.add('active');
        
        // Mostrar chat
        const chatId = this.getAttribute('data-id');
        showChat(chatId);
    });
});

// Implementar funcionalidad de búsqueda
const searchInput = document.querySelector('.search-input');
searchInput.setAttribute('placeholder', 'Buscar chat');

searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    
    groupItems.forEach(item => {
        const groupName = item.querySelector('.group-name').textContent.toLowerCase();
        
        if (searchTerm === '' || groupName.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
});

// Enviar mensaje con botón
sendButton.addEventListener('click', sendMessage);

// Enviar mensaje con Enter
messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Datos de ejemplo
const exampleChatId = 'is';
chats[exampleChatId].messages = [
    {
        text: "Hola chicos, ¿alguien tiene los apuntes de la clase pasada?",
        time: "10:30",
        sent: false,
        sender: "María Rodríguez"
    },
    {
        text: "Yo los tengo, los comparto en un momento",
        time: "10:32",
        sent: true
    },
    {
        text: "Gracias! Los necesito para el examen del viernes",
        time: "10:33",
        sent: false,
        sender: "Juan Carlos"
    }
];