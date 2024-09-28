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
  let appScriptCode = `// Function to handle GET requests (fetch data from the sheet)
function doGet(e) {
  try {
    const spreadsheetId = '1JSR_fgvbNULsClVPMJGMjb_Ea2Dmr6NSle94lj1hK30'; // Replace with your Spreadsheet ID
    const sheetName = 'data'; // Replace with your sheet name

    const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
    const [headers, ...rows] = sheet.getDataRange().getValues();

    // Map rows to JSON objects with headers as keys
    const data = rows.map(row => Object.fromEntries(headers.map((header, index) => [header, row[index]])));

    // Set up CORS headers for GET request
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
    const spreadsheetId = '1JSR_fgvbNULsClVPMJGMjb_Ea2Dmr6NSle94lj1hK30'; // Replace with your Spreadsheet ID
    const sheetName = 'data'; // Replace with your sheet name

    const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);

    // Extract parameters from the POST request
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]; // Get the headers
    const row = headers.map(header => e.parameter[header] || ''); // Map the headers to incoming parameters

    // Append the new row to the sheet
    sheet.appendRow(row);

    // Set up CORS headers for POST request
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

  function generateStorylineCode() {
    if (!webAppUrlInput.value) return;
    let storylineCode = `var player = GetPlayer();

var form = document.createElement("form");
form.method = "POST";
form.action = "${webAppUrlInput.value}";
form.style.display = "none";

${variableNames.map(name => `var input_${name} = document.createElement("input");
input_${name}.type = "hidden";
input_${name}.name = "${name}";
input_${name}.value = player.GetVar("${name}");
form.appendChild(input_${name});`).join('\n')}

// Add today's date when the form is submitted if the checkbox is checked
${includeDateCheckbox.checked ? `
var dateInput = document.createElement("input");
dateInput.type = "hidden";
dateInput.name = "Date";
dateInput.value = new Date().toLocaleDateString('he-IL');
form.appendChild(dateInput);` : ''}

document.body.appendChild(form);

var xhr = new XMLHttpRequest();
xhr.open(form.method, form.action, true);
xhr.onload = function() {
  if (xhr.status >= 200 && xhr.status < 300) {
    var notificationElement = document.getElementById('storyline-notification');
    if (notificationElement) {
      notificationElement.innerHTML = 'הנתונים הועברו בהצלחה!';
      notificationElement.style.display = 'block';
    }
    console.log('Data submitted successfully');
  }
};
xhr.send(new FormData(form));`;
    storylineCodeTextarea.value = storylineCode;
  }

  function copyToClipboard(textarea, notificationElement) {
    textarea.select();
    document.execCommand('copy');
    notificationElement.innerHTML = 'הטקסט הועתק ללוח!';
    notificationElement.style.display = 'block';

    // Hide the notification after 2.5 seconds
    setTimeout(function() {
      notificationElement.style.display = 'none';
    }, 2500);
  }

  copyAppScriptButton.addEventListener('click', function() {
    copyToClipboard(appScriptCodeTextarea, appScriptNotification);
  });

  copyStorylineCodeButton.addEventListener('click', function() {
    copyToClipboard(storylineCodeTextarea, storylineNotification);
  });

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

  updateVariableNames();
});
