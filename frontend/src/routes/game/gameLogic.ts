const gameImage = document.getElementById('game-image');
const imageLoading = document.getElementById('image-loading');
const optionsContainer = document.getElementById('options-container');
const inventoryList = document.getElementById('inventory-list');
const chatContainer = document.querySelector('.chat-container')
const chatMessages = document.getElementById('chat-messages');
const observer = new MutationObserver(() => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
});

observer.observe(chatMessages, { childList: true, subtree: true });

export async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

export async function sendMessage(option = null) {
    const messageInput = document.getElementById('user-input');
    const actionSelect = document.getElementById('action-select');
    let message = option;
    let action = actionSelect.value;

    if (!option) {
        message = messageInput.value.trim();
    }
    messageInput.value = '';
    actionSelect.value = '';

    if (message) {
        chatMessages.innerHTML += `<div class="message user"><div class="message-content">${escapeHtml(message)}</div></div>`;
    }
    try {
        const response = await fetchWithTimeout('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message, action: action })
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        if (data.content) {
            const aiMessageDiv = document.createElement('div');
            aiMessageDiv.className = 'message assistant';
            chatMessages.appendChild(aiMessageDiv);
            typeWriter(aiMessageDiv, data.content, 0);
        }
        if (data.inventory) {
            console.log("Received inventory:", data.inventory);
            updateInventoryUI(data.inventory);
        }
        if (data.image_url) {
            updateGameScene(data.image_url);
        }
        if (data.options && data.options.length > 0) {
            updateOptions(data.options);
        } else {
            optionsContainer.innerHTML = '';
        }
    } catch (error) {
        console.error('Error:', error);
        chatMessages.innerHTML += `<div class="message error"><div class="message-content">Error: ${escapeHtml(error.message)}</div></div>`;
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

export function typeWriter(element, text, i) {
    if (i < text.length) {
        element.innerHTML += text.charAt(i);
        setTimeout(() => typeWriter(element, text, i + 1), 30);
    }
}

export function updateGameScene(imageUrl) {
    if (imageUrl) {
        const newImage = new Image();
        newImage.onload = function () {
            gameImage.src = imageUrl;
            gameImage.style.display = 'block';
            imageLoading.style.display = 'none';
        };
        newImage.onerror = function () {
            imageLoading.textContent = 'Failed to load image';
        };
        newImage.src = imageUrl;
    }
}

export function escapeHtml(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

export function updateOptions(options) {
    optionsContainer.innerHTML = '';
    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const optionButton = document.createElement('button');
        optionButton.className = 'option-button';
        optionButton.style.backgroundColor = 'transparent';
        optionButton.style.color = '#fff';
        optionButton.style.border = '2px solid #fff';
        optionButton.style.borderRadius = '0';
        optionButton.style.cursor = 'pointer';
        optionButton.style.marginBottom = '5px';
        optionButton.style.textAlign = 'left';
        optionButton.style.whiteSpace = 'normal';
        optionButton.addEventListener('mouseover', () => {
            optionButton.style.backgroundColor = '#555';
        });
        optionButton.addEventListener('mouseleave', () => {
            optionButton.style.backgroundColor = 'transparent';
        });
        optionButton.textContent = option;
        optionButton.onclick = function () { sendMessage(option); };
        optionsContainer.appendChild(optionButton);
    }
}

export function updateInventoryUI(inventory) {
    console.log("Updating Inventory UI:", inventory);
    inventoryList.innerHTML = '';  // Clear existing list
    if (inventory && inventory.length > 0) {
        inventory.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.name}: ${item.description}`;
            inventoryList.appendChild(listItem);
        });
    }
}