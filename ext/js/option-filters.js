// fetch references to background page and local storage
// var backgroundPage = chrome.extension.getBackgroundPage();
// var storage = chrome.storage.local;

// fetch references to DOM elements
// var toggleDetail = document.getElementById('toggle-detail');
// var toggleExample = document.getElementById('toggle-example');
// var detailText = document.getElementById('detail');
// var exampleText = document.getElementById('example');
// var alertMessage = document.getElementById('alert');
// var resetButton = document.querySelector('button.reset');
// var submitButton = document.querySelector('button.submit');
// var textArea = document.getElementById('filters');

// var reminderText = $('#reminder');

// add event listeners
// $('#toggle-detail').click(showExtraInfo);
// $('#toggle-example').click(showExtraInfo);
// $('button.submit').click(saveFilters);
// $('button.reset').click(resetFilters);

// toggleDetail.addEventListener('click', function() {
//     reminderText.slideUp(200);
//     $(detailText).slideDown(200, function() {
//         setTimeout(function() {
//             $(detailText).slideUp(200);
//             reminderText.slideDown(200);
//         }, 5000);
//     });
// });
// toggleExample.addEventListener('click', function() {
//     reminderText.slideUp(200);
//     $(exampleText).slideDown(200, function() {
//         setTimeout(function() {
//             $(exampleText).slideUp(200);
//             reminderText.slideDown(200);
//         }, 5000);
//     });
// });

// submitButton.addEventListener('click', saveFilters);
// resetButton.addEventListener('click', resetFilters);

// function showExtraInfo() {
//     // var container = $(this);
//     var content = $('#reminder');

//     content.siblings.slideUp(200);
//     container.slideDown(200, function() {
//         setTimeout(function() {
//             container.slideUp(200);
//             $('#reminder').slideDown(200);
//         }, 5000);
//     });
// }

var storage = chrome.storage.local;

function saveFilters() {
    // TODO: validate and clean user input
    // Get the current data from the form.
    var textAreaData = $('#filters').val();
    // Make sure it's not empty.
    if (!textAreaData) {
        alert('Error :: No Filter(s) Specified!', true);
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
            $('#filters').val(items.filterKeywords);
            alert('Loaded saved Filter(s)');
        }
    });
}

function resetFilters() {
    console.log('reset button clicked.');
    // Remove the saved value from storage
    storage.remove('filterKeywords', function(items) {
        alert('Cleared saved filter(s) from local storage');
    });
    // Reset the textArea
    $('#filters').val('');
}

function alert(msg, error = false) {
    var container = $('#alert');
    container.css('color', error ? '#DB3535' : '#1BB76E');
    container.text(msg);
    setTimeout(function() {
        container.text('');
    }, 3000);
}

// function alert(msg) {
//     var alertMessage = $('#alert');
//     alertMessage.css('color', '#1BB76E');  // green text
//     alertMessage.text(msg);
//     setTimeout(function() {
//         alertMessage.text('');
//     }, 3000);
// }

// function error(msg) {
//     var alertMessage = $('#alert');
//     alertMessage.css('color', '#DB3535');  // red text
//     alertMessage.text(msg);
//     setTimeout(function () {
//         alertMessage.text('');
//     }, 3000);
// }

$(document).ready(function () {
    loadFilters();

    $('#submit').on('click', saveFilters);
    $('#reset').on('click', resetFilters);
});