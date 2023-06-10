import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
  element.textContent = '';
  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300)
}

let index = 0;

function typeText(element, text) {
  interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index)
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
}

const generateUniqueId = () => {
  const timeStamp = Date.now();
  const randomNumber = Math.random();
  const hexaDecimalString = randomNumber.toString(16);

  return `id${timeStamp}-${hexaDecimalString}`
}

function chatStripe(isAi, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img
            src="${isAi ? bot : user}"
            alt="${isAi ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id="${uniqueId}">${value}</div>
        </div>
      </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // User stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  console.log(data.get('prompt'))

  form.reset();

  // Bot stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId)

  loader(messageDiv);

  // fetch data from API -> bot turn
  const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    console.log(data);
    const parsedData = data.bot.trim();
    console.log({parsedData});

    typeText(messageDiv, parsedData)
  } else {
    const err = await response.text();
    messageDiv.innerHTML = 'Something went wrong...!'

    console.log(err)

  }
} 



form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
})