const sheetUrl = 'https://script.google.com/macros/s/AKfycbyNcXlnQtd2xaX6g8uskSAX6mFCY50FYr9fGLpJA9GCw26SQFB77rORUexIVEpLCQj5/exec'; // Replace with your Apps Script URL
const currentUser = localStorage.getItem('currentUser'); //get the user.
let currentReceiver = null;

document.getElementById('add-friend-button').addEventListener('click', () => {
    const friendUsername = document.getElementById('add-friend').value;
    addFriend(friendUsername);
});

document.getElementById('send-button').addEventListener('click', () => {
    const message = document.getElementById('message-input').value;
    sendMessage(message);
});

async function addFriend(friendUsername) {
    const response = await fetch(sheetUrl, {
        method: 'POST',
        body: new URLSearchParams({
            action: 'addFriend',
            user: currentUser,
            friend: friendUsername,
        }),
    });
    const data = await response.json();
    if (data.success) {
        alert(data.message);
        loadChats();
    } else {
        alert(data.message);
    }
}

async function sendMessage(message) {
    if (!currentReceiver) return; // No receiver selected
    const response = await fetch(sheetUrl, {
        method: 'POST',
        body: new URLSearchParams({
            action: 'sendMessage',
            sender: currentUser,
            receiver: currentReceiver,
            message: message,
        }),
    });
    const data = await response.json();
    if (data.success) {
        document.getElementById('message-input').value = '';
        loadMessages();
    } else {
        alert(data.message);
    }
}

async function loadChats() {
    const response = await fetch(sheetUrl, {
        method: 'POST',
        body: new URLSearchParams({
            action: 'getChats',
            user: currentUser,
        }),
    });
    const data = await response.json();
    const chatsDiv = document.getElementById('chats');
    chatsDiv.innerHTML = ''; // Clear previous chats
    if (data.success) {
        data.chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.classList.add('chat-item');
            chatItem.textContent = chat;

            // Apply initial styling
            styleChatItem(chatItem);

            chatItem.addEventListener('click', () => {
                currentReceiver = chat;
                loadMessages();
                document.getElementById('chat-title').textContent = chat;

                // Reset all chat items and set clicked style
                const allChatItems = document.querySelectorAll('.chat-item');
                allChatItems.forEach(item => {
                    item.classList.remove('clicked');
                    styleChatItem(item); //reset all the other items.
                });

                chatItem.classList.add('clicked');
                styleChatItem(chatItem); //apply clicked style to the one clicked.
            });

            chatsDiv.appendChild(chatItem);
        });
    } else {
        chatsDiv.textContent = data.message;
    }
}

function styleChatItem(chatItem) {
    // Default style
    chatItem.style.backgroundColor = "#f9f9f9";
    chatItem.style.borderRadius = "5px";
    chatItem.style.width = "92%";
    chatItem.style.transition = "background-color 0.3s ease";

    // Hover style
    chatItem.addEventListener("mouseover", () => {
        if (!chatItem.classList.contains("clicked")) { //Only hover if not clicked
            chatItem.style.backgroundColor = "#ccc";
        }
    });

    chatItem.addEventListener("mouseout", () => {
        if (!chatItem.classList.contains("clicked")) {
            chatItem.style.backgroundColor = "#f9f9f9";
        }
    });

    // Clicked style
    if (chatItem.classList.contains("clicked")) {
        chatItem.style.backgroundColor = "#666";
        chatItem.style.color = "white"; // Change text color
    } else {
        chatItem.style.color = "black"; // Black text when not clicked
    }
}

//end

async function loadMessages() {
    if (!currentReceiver) return;
    const response = await fetch(sheetUrl, {
        method: 'POST',
        body: new URLSearchParams({
            action: 'getMessages',
            sender: currentUser,
            receiver: currentReceiver,
        }),
    });
    const data = await response.json();
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';
    if (data.success) {
        data.messages.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.textContent = `${msg.message}`;
            msgDiv.style.padding = '5px';
            msgDiv.style.marginBottom = '5px';
            msgDiv.style.maxWidth = '70%'; // Prevent long messages from taking up the whole width
            msgDiv.style.wordWrap = 'break-word'; // Break long words
            // if (msg.sender === currentUser) {
            //     msgDiv.style.backgroundColor = '#dcf8c6'; // Add background for sent messages
            //     msgDiv.style.alignSelf = 'flex-end'; // Align to the right
            //     msgDiv.style.borderRadius = '10px 10px 0px 10px'; // Border radius for sent messages
            // } else {
            //     msgDiv.style.backgroundColor = '#e6e6e6'; // Add background for received messages
            //     msgDiv.style.alignSelf = 'flex-start'; // Align to the left
            //     msgDiv.style.borderRadius = '0px 10px 10px 10px'; // Border radius for sent messages
            // }
            //new
            if (msg.sender === currentUser) {
    msgDiv.style.backgroundColor = '#dcf8c6'; // Background for sent messages
    msgDiv.style.alignSelf = 'flex-end'; // Align to the right
    msgDiv.style.borderRadius = '8px 8px 8px 8px'; // Border radius for sent messages
    msgDiv.style.position = 'relative'; // Needed for absolute positioning of tail

    // Create the tail
    let tail = document.createElement('div');
    tail.style.position = 'absolute';
    tail.style.top = '50%';
    tail.style.right = '-10px';
    tail.style.width = '0';
    tail.style.height = '0';
    tail.style.border = '10px solid transparent';
    tail.style.borderLeftColor = '#dcf8c6';
    tail.style.borderRight = '0';
    tail.style.marginTop = '-10px';

    msgDiv.appendChild(tail);
} else {
    msgDiv.style.backgroundColor = '#e6e6e6'; // Background for received messages
    msgDiv.style.alignSelf = 'flex-start'; // Align to the left
    msgDiv.style.borderRadius = '8px 8px 8px 8px'; // Border radius for received messages
    msgDiv.style.position = 'relative'; // Needed for absolute positioning of tail

    // Create the tail
    let tail = document.createElement('div');
    tail.style.position = 'absolute';
    tail.style.top = '50%';
    tail.style.left = '-10px';
    tail.style.width = '0';
    tail.style.height = '0';
    tail.style.border = '10px solid transparent';
    tail.style.borderRightColor = '#e6e6e6';
    tail.style.borderLeft = '0';
    tail.style.marginTop = '-10px';

    msgDiv.appendChild(tail);
}
            //end
            messagesDiv.appendChild(msgDiv);
        });
    } else {
        messagesDiv.textContent = data.message;
    }
}

// setInterval(loadMessages, 10000);

//new

// Function to check if the user is logged in
function checkLoginState() {
    const currentUser = localStorage.getItem('currentUser');
    const loginTimestamp = localStorage.getItem('loginTimestamp');

    if (currentUser && loginTimestamp) {
        const expirationTime = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
        if (Date.now() - loginTimestamp < expirationTime) {
            // User is logged in and session is still valid
            return true;
        }
    }
    return false;
}

// Redirect to login page if not logged in
if (!checkLoginState()) {
    window.location.href = 'index.html'; // Redirect to login page
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('loginTimestamp');
    window.location.href = 'index.html'; // Redirect to login page
}

loadChats(); // Load chats on page load
