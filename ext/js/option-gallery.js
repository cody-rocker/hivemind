var storage = chrome.storage.local;
// TODO: new filter :: strict matching on whole words/tokens

// Store tab operations in a Global scope variable
// This is effectively the public interface for the gallery tab functionality.
var GalleryOptions = {
    initialize: function() {
        loadGallerySettings();
        loadFilters();
    },
    addEventListeners: function() {
        $('#minimun-length').on('change', updateMinLength);
        $('#submit').on('click', saveFilters);
        $('#reset').on('click', resetFilters);
        $('#toggle-detail').on('click', showExtraInfo);
        $('#toggle-example').on('click', showExtraInfo);
    }
}

// Create a new filter html element
function FilterTerm(str) {
    var _parent = document.createElement('span');
    _parent.className = 'filter-card shadow';
    _parent.id = str;
    _parent.appendChild(document.createTextNode(str));
    return _parent;
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
            break  // fail silently
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
    storage.get('filterArray', function(items) {
        if (items.filterArray) {
            var termList = $('#contains-term-list');
            for (var i = items.filterArray.length - 1; i >= 0; i--) {
                termList.append(new FilterTerm(items.filterArray[i]));
            }
        }
    });
}

function resetFilters() {
    // Remove the saved value from storage
    storage.remove('filterKeywords', function(items) {
        alert('Cleared saved filter(s) from local storage');
    });
    storage.remove('filterArray', function(items) {
        // successful operation callback
        return;
    })
    // Reset the textArea
    $('#filters').val('');
}

function loadGallerySettings() {
    var container = $('#minimun-length');
    for (var i = 2; i <= 10; i++) {
        container.append('<option value='+i+'>'+i+'</option>');
    }
    // Load saved options state
    storage.get('minLength', function(items) {
        if (items.minLength) {
            $('#minimun-length option[value='+items.minLength+']')
                .prop('selected',true);
        }
    });
}

function updateMinLength() {
    storage.set({
        'minLength': $(this).val()
    }, function() {
        // successful save callback
        return;
    });
}

function alert(msg, error = false) {
    var container = $('#alert');
    container.css('color', error ? '#DB3535' : '#1BB76E');
    container.text(msg);
    setTimeout(function() {
        container.text('');
    }, 3000);
}