// fetch references to background page and local storage
var backgroundPage = chrome.extension.getBackgroundPage();
var storage = chrome.storage.local;

// fetch references to DOM elements
var toggleDetail = document.getElementById('toggle-detail');
var toggleExample = document.getElementById('toggle-example');
var detailText = document.getElementById('detail');
var exampleText = document.getElementById('example');
var alertMessage = document.getElementById('alert');
var resetButton = document.querySelector('button.reset');
var submitButton = document.querySelector('button.submit');
var textArea = document.getElementById('filters');

// load any saved data
loadFilters();

var reminderText = $('#reminder');

// add click event listeners
toggleDetail.addEventListener('click', function() {
    reminderText.slideUp(200);
    $(detailText).slideDown(200, function() {
        setTimeout(function() {
            $(detailText).slideUp(200);
            reminderText.slideDown(200);
        }, 5000);
    });
});
toggleExample.addEventListener('click', function() {
    reminderText.slideUp(200);
    $(exampleText).slideDown(200, function() {
        setTimeout(function() {
            $(exampleText).slideUp(200);
            reminderText.slideDown(200);
        }, 5000);
    });
});
submitButton.addEventListener('click', saveFilters);
resetButton.addEventListener('click', resetFilters);

function saveFilters() {
    // TODO: validate and clean user input
    // Get the current data from the form.
    var textAreaData = textArea.value;
    // Make sure it's not empty.
    if (!textAreaData) {
        error('Error: No Filters Specified');
        return;
    }
    // Save the data using the Chrome Extension API
    storage.set({'filterKeywords': textAreaData}, function() {
        //Notify that we saved successfully
        alert('Filter(s) saved');
    });
    var filterArray = textAreaData.split(',');
    // TODO: ensure object to be saved is a valid object
    storage.set({'filterArray': filterArray}, function() {
        // console.log('filterArray saved with ' + filterArray.length + ' element(s).');
        return;
    });
}

function loadFilters() {
    storage.get('filterKeywords', function(items) {
        if (items.filterKeywords) {
            textArea.value = items.filterKeywords;
            alert('Loaded saved Filter(s)');
        }
    });
}

function resetFilters() {
    // Remove the saved value from storage
    storage.remove('filterKeywords', function(items) {
        alert('Cleared saved fliter(s) from local storage');
    });
    // Reset the textArea
    textArea.value = '';
}

function alert(msg) {
    alertMessage.style.color = '#1BB76E';  // green text
    alertMessage.innerText = msg;
    setTimeout(function() {
        alertMessage.innerText = '';
    }, 3000);
}

function error(msg) {
    alertMessage.style.color = '#DB3535';  // red text
    alertMessage.innerText = msg;
    setTimeout(function () {
        alertMessage.innerText = '';
    }, 3000);
}

function displayVersionNumber() {
    try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', chrome.extension.getURL('manifest.json'), true);
        xhr.onreadystatechange = function() {
            if (this.readyState === 4) {
                var theManifest = JSON.parse(this.responseText);
                $('#version').text("HiveMind version " + theManifest.version);
            }
        };
        xhr.send();
    } catch(ex) {}  // silently fail
}

$(document).ready(function () {
    // misc. page setup
    displayVersionNumber();
});