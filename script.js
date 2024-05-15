document.addEventListener('DOMContentLoaded', function() {
    const matchForm = document.getElementById('matchForm');
    const resultsList = document.getElementById('resultsList');
    const player1Select = document.getElementById('player1');
    const player2Select = document.getElementById('player2');
    const newPlayer1Input = document.getElementById('newPlayer1');
    const newPlayer2Input = document.getElementById('newPlayer2');
    const addPlayer1Button = document.getElementById('addPlayer1');
    const addPlayer2Button = document.getElementById('addPlayer2');
  
    const storedMatches = JSON.parse(localStorage.getItem('matches')) || [];
    const storedPlayers = JSON.parse(localStorage.getItem('players')) || [];
  
    storedMatches.forEach((match, index) => addMatchToList(match, index));
    storedPlayers.forEach(player => addPlayerToSelect(player));
  
    matchForm.addEventListener('submit', function(event) {
      event.preventDefault();
  
      const player1 = player1Select.value;
      const player2 = player2Select.value;
      const score = document.getElementById('score').value;
  
      const match = { player1, player2, score };
  
      const index = storedMatches.length;
      addMatchToList(match, index);
      storeMatch(match);
  
      matchForm.reset();
    });
  
    addPlayer1Button.addEventListener('click', function() {
      const newPlayer = newPlayer1Input.value.trim();
      if (newPlayer && !storedPlayers.includes(newPlayer)) {
        storedPlayers.push(newPlayer);
        addPlayerToSelect(newPlayer);
        localStorage.setItem('players', JSON.stringify(storedPlayers));
        newPlayer1Input.value = '';
      }
    });
  
    addPlayer2Button.addEventListener('click', function() {
      const newPlayer = newPlayer2Input.value.trim();
      if (newPlayer && !storedPlayers.includes(newPlayer)) {
        storedPlayers.push(newPlayer);
        addPlayerToSelect(newPlayer);
        localStorage.setItem('players', JSON.stringify(storedPlayers));
        newPlayer2Input.value = '';
      }
    });
  
    function addMatchToList(match, index) {
      const li = document.createElement('li');
      li.dataset.index = index;
      li.innerHTML = `
        <button class="drag-handle">&#x2630;</button>
        ${match.player1} vs ${match.player2} - Score: ${match.score}
        <button class="delete">Delete</button>
      `;
      resultsList.appendChild(li);
  
      li.querySelector('.delete').addEventListener('click', function() {
        li.remove();
        deleteMatch(index);
      });
    }
  
    function storeMatch(match) {
      const matches = JSON.parse(localStorage.getItem('matches')) || [];
      matches.push(match);
      localStorage.setItem('matches', JSON.stringify(matches));
    }
  
    function deleteMatch(index) {
      let matches = JSON.parse(localStorage.getItem('matches')) || [];
      matches.splice(index, 1);
      localStorage.setItem('matches', JSON.stringify(matches));
      updateIndices();
    }
  
    function updateIndices() {
      const items = resultsList.querySelectorAll('li');
      const matches = [];
      items.forEach((item, index) => {
        item.dataset.index = index;
        const text = item.childNodes[2].nodeValue.trim();
        const [players, score] = text.split(' - Score: ');
        const [player1, player2] = players.split(' vs ');
        matches.push({ player1, player2, score });
      });
      localStorage.setItem('matches', JSON.stringify(matches));
    }
  
    function addPlayerToSelect(player) {
      const option1 = document.createElement('option');
      option1.value = player;
      option1.textContent = player;
      player1Select.appendChild(option1);
  
      const option2 = document.createElement('option');
      option2.value = player;
      option2.textContent = player;
      player2Select.appendChild(option2);
    }
  
    // Enable sorting with SortableJS
    new Sortable(resultsList, {
      handle: '.drag-handle',
      onEnd: updateIndices
    });
  });
  