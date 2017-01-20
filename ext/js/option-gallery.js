var storage = chrome.storage.local;
// TODO: implement feature :: make unchecked options disabled
// TODO: new filter :: strict matching on whole words/tokens

// Store tab operations in a Global scope variable
// This is effectively the public interface for the gallery tab functionality.
var GalleryOptions = {
    initialize: function() {
        loadGallerySettings();
        loadFiltersContains();
    },
    addEventListeners: function() {
        $('#filter-by-length').on('click', updateFilterByLength);
        $('#filter-by-contains').on('click', updateFilterByContains);
        $('#minimun-length').on('change', updateMinLength);
        $('#submit-contains').on('click', saveFiltersContains);
        $('#reset-contains').on('click', resetFiltersContains);
        $('#toggle-detail').on('click', showExtraInfo);
    }
}

Array.prototype.unique = function() {
    var a = this.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
};

// Create a new filter html element
function FilterCard(str) {
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

function saveFiltersContains() {
    // TODO: validate and clean user input
    // Get the current data from the form.
    var textInput = $('#add-term-contains');
    var textAreaData = textInput.val();
    // Make sure it's not empty.
    if (!textAreaData) {
        alert('No Filter(s) Specified!', true);
        return;
    }
    var newTerms = textAreaData.split(',');
    // TODO: ensure object to be saved is a valid object
    storage.get('filterArrayContains', function(items) {
        if (items.filterArrayContains) {
            var uniqueTerms = items.filterArrayContains.concat(newTerms).unique();
            storage.set({'filterArrayContains': uniqueTerms}, function() {
                textInput.val('');
                updateContainsCards();
                alert('Filter(s) saved');
                return;
            });
        } else {
            storage.set({'filterArrayContains': newTerms}, function() {
                textInput.val('');
                updateContainsCards();
                alert('Filter(s) saved');
                return;
            });
        }
    });
}

function loadFiltersContains() {
    storage.get('filterArrayContains', function(items) {
        if (items.filterArrayContains) {
            // Update DOM container
            updateContainsCards();
            // Notify user
            alert('Loaded saved Filter(s)');
            return;
        }
    });
}

function resetFiltersContains() {
    storage.remove('filterArrayContains', function(items) {
        // Empty the filter cards div
        $('#contains-term-list').empty();
        // Reset the textArea
        $('#add-term-contains').val('');
        // Notify user
        alert('All filters removed');
        return;
    });
}

function updateContainsCards() {
    var termList = $('#contains-term-list');
    storage.get('filterArrayContains', function(items) {
        if (items.filterArrayContains) {
            termList.empty();
            for (var i = items.filterArrayContains.length - 1; i >= 0; i--) {
                termList.append(new FilterCard(items.filterArrayContains[i]));
            }
            return;
        }
    });
}

function loadGallerySettings() {
    // Populate dropdown select menu(s)
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
    storage.get('filterByLength', function(items) {
        if (items.filterByLength) {
            $('#filter-by-length').prop('checked', items.filterByLength);
        }
    });
    storage.get('filterByContains', function(items) {
        if (items.filterByContains) {
            $('#filter-by-contains').prop('checked', items.filterByContains);
        }
    });
}

function updateFilterByLength() {
    var checkbox = $(this);
    storage.set({
        'filterByLength': checkbox.is(':checked')
    }, function() {
        // successful save callback
        return;
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

function updateFilterByContains() {
    var checkbox = $(this);
    storage.set({
        'filterByContains': checkbox.is(':checked')
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