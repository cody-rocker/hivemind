// fetch references to background page and local storage
var backgroundPage = chrome.extension.getBackgroundPage();
var storage = chrome.storage.local;



function populateTabs() {
    $.get('option-general.html', function(data) {
        $('#options-general').append(data);
    });
    $.get('option-filters.html', function(data) {
        $('#options-filters').append(data);
    });
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

$('#tabs').tabs();

$(document).ready(function () {
    // misc. page setup
    populateTabs();
    displayVersionNumber();
});