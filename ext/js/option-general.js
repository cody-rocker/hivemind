var storage = chrome.storage.local;
// Store tab operations in a Global scope variable
// This is effectively the public interface for the gallery tab functionality.
var GeneralOptions = {
    initialize: function() {
        loadPopupSettings();
    },
    addEventListeners: function() {
        $('#open-in-tab').on('click', updateTabSettings);
        $('#show-images').on('click', updateImageSettings);
    }
}

function loadPopupSettings() {
    // Load saved options state
    storage.get('newTab', function(items) {
        if (items.newTab) {
            $('#open-in-tab').prop('checked', items.newTab);
        }
    });
    storage.get('showImages', function(items) {
        if (items.showImages) {
            $('#show-images').prop('checked', items.showImages);
        }
    });
}

function updateTabSettings() {
    var checkbox = $(this);
    storage.set({
        'newTab': checkbox.is(':checked')
    }, function() {
        // successful save callback
        // console.log('updateTabSettings completed successfully;');
        return;
    });
}

function updateImageSettings() {
    var checkbox = $(this);
    storage.set({
        'showImages': checkbox.is(':checked')
    }, function() {
        // successful save callback
        // console.log('updateImages completed successfully;');
        return;
    });
}