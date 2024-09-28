document.addEventListener('DOMContentLoaded', function() {
  const variableCountInput = document.getElementById('variable-count');
  const variableNamesContainer = document.getElementById('variable-names');
  const webAppUrlInput = document.getElementById('web-app-url');
  const appScriptCodeTextarea = document.getElementById('app-script-code');
  const storylineCodeTextarea = document.getElementById('storyline-code');
  const copyAppScriptButton = document.getElementById('copy-app-script');
  const copyStorylineCodeButton = document.getElementById('copy-storyline-code');
  const appScriptNotification = document.getElementById('app-script-notification');
  const storylineNotification = document.getElementById('storyline-notification');
  const includeDateCheckbox = document.getElementById('include-date');
  const spreadsheetIdInput = document.getElementById('spreadsheet-id'); // New input
  const sheetNameInput = document.getElementById('sheet-name'); // New input

  let variableCount = 0;
  let variableNames = [];

  function updateVariableNames() {
    variableNamesContainer.innerHTML = '';
    for (let i = 0; i < variableCount; i++) {
      const inputGroup = document.createElement('div');
      inputGroup.className = 'input-group';

      const label = document.createElement('label');
      label.textContent = `שם משתנה ${i + 1}:`;

      const input = document.createElement('input');
      input.type = 'text';
      input.value = variableNames[i] || '';
      input.addEventListener('input', function(e) {
        variableNames[i] = e.target.value;
        generateAppScriptCode();
        generateStorylineCode();
      });

      inputGroup.appendChild(label);
      inputGroup.appendChild(input);
      variableNamesContainer.appendChild(inputGroup);
    }
  }

  function generateAppScriptCode() {
    const spreadsheetId = spreadsheetIdInput.value.trim();
    const sheetName = sheetNameInput.value.trim();

    let appScriptCode = `// Function to handle GET requests (fetch data from the sheet)
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById('${spreadsheetId}').getSheetByName('${sheetName}');
    const [headers, ...rows] = sheet.getDataRange().getValues();
    const data = rows.map(row => Object.fromEntries(headers.map((h, i) => [h, row[i]])));
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  } catch (error) {
    Logger.log(error);
    return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  }
}

// Function to handle POST requests (add data to the sheet)
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById('${spreadsheetId}').getSheetByName('${sheetName}');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(header => e.parameter[header] || '');
    sheet.appendRow(row);
    return ContentService.createTextOutput('Success')
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  } catch (error) {
    Logger.log(error);
    return ContentService.createTextOutput('Error: ' + error.message)
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}`;
    appScriptCodeTextarea.value = appScriptCode;
  }

  // Other event listeners and functions remain the same...

  variableCountInput.addEventListener('input', function(e) {
    variableCount = parseInt(e.target.value, 10) || 0;
    variableNames = Array(variableCount).fill('');
    updateVariableNames();
    generateAppScriptCode();
    generateStorylineCode();
  });

  webAppUrlInput.addEventListener('input', generateStorylineCode);
  includeDateCheckbox.addEventListener('change', function() {
    generateAppScriptCode();
    generateStorylineCode();
  });

  spreadsheetIdInput.addEventListener('input', generateAppScriptCode); // Trigger generation on spreadsheet ID change
  sheetNameInput.addEventListener('input', generateAppScriptCode); // Trigger generation on sheet name change

  updateVariableNames();
});
