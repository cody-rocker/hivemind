var storage = chrome.storage.local;

// Store tab operations in a Global scope variable
// This is effectively the public interface for the gallery tab functionality.
var GalleryOptions = {
    initialize: function() {
        loadFilters();
    },
    addEventListeners: function() {
        $('#submit').on('click', saveFilters);
        $('#reset').on('click', resetFilters);
        $('#toggle-detail').on('click', showExtraInfo);
        $('#toggle-example').on('click', showExtraInfo);
    }
}

function showExtraInfo() {
    var extraInfo;
    var reminder = $('#reminder');

    switch (this.id) {

        case 'toggle-detail':
            extraInfo = $('#detail');
            break

        case 'toggle-example':
            extraInfo = $('#example');
            break

        default:
            break
    }
    reminder.siblings().hide();
    reminder.slideUp(100);
    extraInfo.slideDown(200, function() {
        setTimeout(function() {
            extraInfo.hide();
            reminder.slideDown(200);
        }, 5000);
    });
}

function saveFilters() {
    // TODO: validate and clean user input
    // Get the current data from the form.
    var textAreaData = $('#filters').val();
    // Make sure it's not empty.
    if (!textAreaData) {
        alert('Error :: No Filter(s) Specified!', true);
        return;
    }
    // TODO: deprecate this call, we only really need the array.
    // Save the data using the Chrome Extension API
    storage.set({'filterKeywords': textAreaData}, function() {
        //Notify that we saved successfully
        alert('Filter(s) saved');
    });
    var filterArray = textAreaData.split(',');
    // TODO: ensure object to be saved is a valid object
    storage.set({'filterArray': filterArray}, function() {
        // console.log('filterArray saved with ' + filterArray.length + ' element(s).');
        alert('Filter(s) saved');
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