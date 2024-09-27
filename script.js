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

  function getCurrentDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = today.getFullYear();
    return day + '/' + month + '/' + year;
  }

  function generateAppScriptCode() {
    let appScriptCode = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  ${variableNames.map(name => `var ${name} = e.parameter.${name};`).join('\n  ')}

  // Get today's date if the checkbox is checked
  ${includeDateCheckbox.checked ? `var date = '${getCurrentDate()}';` : ''}

  // Append a row with the variables ${includeDateCheckbox.checked ? 'and the date' : ''}
  sheet.appendRow([${variableNames.join(', ')}${includeDateCheckbox.checked ? ', date' : ''}]);
  return ContentService.createTextOutput("Success");
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

// Add today's date if the checkbox is checked
${includeDateCheckbox.checked ? `
var dateInput = document.createElement("input");
dateInput.type = "hidden";
dateInput.name = "Date";
dateInput.value = "${getCurrentDate()}";
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
