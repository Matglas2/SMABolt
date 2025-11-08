import { getRandomGreeting } from './greetingService.js';
import './style.css';

const app = document.getElementById('app');

app.innerHTML = `
  <div class="container">
    <h1>Greeting App</h1>
    <div id="greeting" class="greeting-text">Click the button to get a greeting!</div>
    <button id="greetBtn" class="greet-button">Greet Me!</button>
  </div>
`;

const greetBtn = document.getElementById('greetBtn');
const greetingDiv = document.getElementById('greeting');

greetBtn.addEventListener('click', async () => {
  greetBtn.disabled = true;
  greetingDiv.textContent = 'Loading...';

  const greeting = await getRandomGreeting();
  greetingDiv.textContent = greeting;

  greetBtn.disabled = false;
});
