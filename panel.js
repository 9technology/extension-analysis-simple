// Keep a record of content types and their size in bytes.
let contentTypes = {};

// HTML element to output our data.
const output = document.querySelector('.analysis-output');

const getType = (type) => { return type.replace(/.*(javascript|image|html|font|json|css|text).*/g, '$1'); };

const formatBytes = (size) => { return `${parseInt(size / 1000)} KB` }

// Simple render function.
const render = () => {
  output.innerHTML = '';
  for (let type in contentTypes) {
    if (contentTypes[type].size > 0) {
      output.innerHTML += `<div class="table-row"><div class="table-cell">${type}</div><div class="table-cell align-right">${formatBytes(contentTypes[type].size)}</div></div>`;
    }
  }
  output.innerHTML = `<div class="table">${output.innerHTML}</div>`;
};

// When a network request has finished this function will be called.
chrome.devtools.network.onRequestFinished.addListener(request => {
    const response = request.response;
    // Find the Content-Type header.
    const contentHeader = response.headers.find(header => header.name === 'Content-Type');
    if (contentHeader) {
        const contentType = getType(contentHeader.value);
        if (!contentTypes[contentType]) {
            contentTypes[contentType] = { size: 0 };
        }
        // Add the size of the body response to our table.
        contentTypes[contentType].size += response.bodySize;
        render();
    }
});

// Clear the record if the page is refreshed or navigated to another page.
chrome.devtools.network.onNavigated.addListener(() => contentTypes = {});
