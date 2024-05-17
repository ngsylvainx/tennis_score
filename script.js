document.addEventListener('DOMContentLoaded', function() {
  const matchForm = document.getElementById('matchForm');
  const resultsList = document.getElementById('resultsList');
  const player1Select = document.getElementById('player1');
  const player2Select = document.getElementById('player2');
  const newPlayer1Input = document.getElementById('newPlayer1');
  const newPlayer2Input = document.getElementById('newPlayer2');
  const addPlayer1Button = document.getElementById('addPlayer1');
  const addPlayer2Button = document.getElementById('addPlayer2');

  let fileHandle;
  let fileData = [];

  // Initialize the app by reading the CSV file
  async function initialize() {
    try {
      fileHandle = await getFileHandle('tennis_matches.csv');
      await readCSVFile();
      fileData.forEach((match, index) => addMatchToList(match, index));
      updatePlayerSelect();
    } catch (err) {
      console.error('Failed to initialize:', err);
    }
  }

  async function getFileHandle(fileName) {
    const opts = {
      type: 'openFile',
      accepts: [{
        description: 'CSV Files',
        extensions: ['csv'],
        mimeTypes: ['text/csv']
      }]
    };
    [fileHandle] = await window.showOpenFilePicker(opts);
    return fileHandle;
  }

  async function readCSVFile() {
    const file = await fileHandle.getFile();
    const text = await file.text();
    fileData = parseCSV(text);
  }

  async function writeCSVFile() {
    const writable = await fileHandle.createWritable();
    const csvContent = convertArrayToCSV(fileData);
    await writable.write(csvContent);
    await writable.close();
  }

  function parseCSV(text) {
    const rows = text.split('\n').filter(row => row.trim() !== '');
    return rows.map(row => {
      const [player1, player2, score] = row.split(',');
      return { player1, player2, score };
    });
  }

  function convertArrayToCSV(data) {
    return data.map(row => `${row.player1},${row.player2},${row.score}`).join('\n');
  }

  function addMatchToList(match, index) {
    const li = document.createElement('li');
    li.dataset.index = index;
    li.innerHTML = `
      <button class="drag-handle">&#x2630;</button>
      ${match.player1} vs ${match.player2} - Score: ${match.score}
      <button class="delete">Delete</button>
    `;
    resultsList.appendChild(li);

    li.querySelector('.delete').addEventListener('click', async function() {
      li.remove();
      await deleteMatch(index);
    });
  }

  function updatePlayerSelect() {
    const players = new Set(fileData.flatMap(match => [match.player1, match.player2]));
    players.forEach(player => addPlayerToSelect(player));
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

  matchForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const player1 = player1Select.value;
    const player2 = player2Select.value;
    const score = document.getElementById('score').value;

    const match = { player1, player2, score };

    const index = fileData.length;
    fileData.push(match);
    addMatchToList(match, index);
    await writeCSVFile();

    matchForm.reset();
  });

  addPlayer1Button.addEventListener('click', function() {
    const newPlayer = newPlayer1Input.value.trim();
    if (newPlayer && !Array.from(player1Select.options).map(option => option.value).includes(newPlayer)) {
      addPlayerToSelect(newPlayer);
      newPlayer1Input.value = '';
    }
  });

  addPlayer2Button.addEventListener('click', function() {
    const newPlayer = newPlayer2Input.value.trim();
    if (newPlayer && !Array.from(player2Select.options).map(option => option.value).includes(newPlayer)) {
      addPlayerToSelect(newPlayer);
      newPlayer2Input.value = '';
    }
  });

  async function deleteMatch(index) {
    fileData.splice(index, 1);
    await writeCSVFile();
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
    fileData = matches;
  }

  // Enable sorting with SortableJS
  new Sortable(resultsList, {
    handle: '.drag-handle',
    onEnd: updateIndices
  });

  // Initialize the app
  initialize();
});
