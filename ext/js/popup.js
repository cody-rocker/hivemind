var storage = chrome.storage.local;
// Default popupSettings
var newTab = false;
var showImages = false;

// Register all listeners on the page here
function addListeners() {
    $('#clear') // add listener for clear button
        .on('click', function() {
            $this = $(this);
            clearAllClicked(function() {
                $this.hide();
            });
        });
    $('#options')  // add click listener for options icon
        .on('click', function() {
            chrome.tabs.create({'url': chrome.extension.getURL("options.html")});
        });
    $('#blocked-posts')  // register listeners for hiddenPost objects
        .on('click', '.post', function() {
            $(this).children('img').slideDown();
        })
        .on('click', 'img', function() {
            var url = $(this).siblings('span').text();
            openHiddenPost(url);

        })
        .on('mouseleave', '.post', function() {
            $(this).children('img').delay(1000).slideUp();
    });
}

// Fetch the current blockList from background page
function getHiddenPostsFromBg(callback) {
    chrome.runtime.sendMessage({
            action: "getHiddenPosts"
        }, function(response) {
            var blocklist = response.hiddenPosts;
            if (blocklist !== undefined) {
                callback(blocklist);
            } else {
                console.log.error(response);
                throw Error('Bad response from background.js');
            }
    });
}

// Clear the current blockList from background page
function clearHiddenPostsFromBg() {
    chrome.runtime.sendMessage({
        action: "clearHiddenPostsFromBg"
    }, function(response) {
        if (response.hiddenPosts.length === 0) {
            // NOTE: Successful operation callback
        } else {
            console.log.error(response);
            throw Error('Bad response from background.js');
        }
    });
    return true;
}

// Clear the current blocklist from background page
function clearHiddenPostsFromCs() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "clearHiddenPostsFromCs"
        }, function(response) {
            if (response.hiddenPosts.length === 0) {
                // NOTE: Successful operation callback
            } else {
                console.log.error(reponse);
                throw Error('Bad response from gallery-content-script.js');
            }
        });
    });
    return true;
}

// Clear all references to the current blockList and remove DOM elements
function clearAllClicked(callback) {
    if ( clearHiddenPostsFromBg() && clearHiddenPostsFromCs() ) {
        $('.post').remove();
        displayStatus([]);
        callback();
    }
}

// Fetch the current popup settings from background page
function getPopupSettings() {
    storage.get('newTab', function(items) {
        if (items.newTab) {
            newTab = items.newTab;
        }
    });
    storage.get('showImages', function(items) {
        if (items.showImages) {
            showImages = items.showImages;
        }
    });
}

// Build a new HiddenPost div from object
function HiddenPost(obj) {
    var _targetTab = newTab ? 'New Tab' : 'Current Tab';
    var _title = document.createElement('p');
    var _img = document.createElement('img');
    var _postUrl = document.createElement('span');

    _img.title = 'Click to open in ' + _targetTab;
    _img.src = obj.imgUrl;
    _img.style.display = showImages ? 'block' : 'none';
    _postUrl.hidden = true;
    _postUrl.appendChild(document.createTextNode(obj.postUrl));
    _title.appendChild(document.createTextNode(obj.title));

    this.container = document.createElement('div');
    this.container.id = obj.id;
    this.container.className = 'post shadow';

    this.container.appendChild(_title);
    this.container.appendChild(_img);
    this.container.appendChild(_postUrl);

    return this.container;
}

function displayStatus(blocklist) {
    $('#status').text(blocklist.length.toString() + " hidden item(s)");
}

// Add hidden posts to popup page
function showHidden(blocklist) {
    var clearAllIcon = $('#clear')
    displayStatus(blocklist);
    if (blocklist.length > 0) {
        clearAllIcon.show();
    } else {
        clearAllIcon.hide();
    }
    // Add new divs to DOM
    var blockedPosts = document.getElementById('blocked-posts');
    for ( i in blocklist ) {
        blockedPosts.appendChild(new HiddenPost(blocklist[i]));
    }
}

function openHiddenPost(url) {
    if (newTab) {
        chrome.tabs.create({'url': url});
    } else {
        chrome.tabs.query({
            active: true, currentWindow: true
        }, function(tabs) {
            var tab = tabs[0];
            chrome.tabs.update(tab.id, {'url': url});
        });
    }
}

function displayNoFilterWarning() {
    var container = $('#no-filter-warning');
    container.on('click', function() {
        var targetUrl = chrome.extension.getURL("options.html") + '#options-gallery';
        chrome.tabs.create({'url': targetUrl});
    });
    container.show();
}

function displayVersionNumber() {
    try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', chrome.extension.getURL('manifest.json'), true);
        xhr.onreadystatechange = function() {
            if (this.readyState === 4) {
                var theManifest = JSON.parse(this.responseText);
                $('#version').text("HiveMind v" + theManifest.version);
            }
        };
        xhr.send();
    } catch(ex) {}  // silently fail
}

// Triggered when browserAction icon is clicked
$(document).ready(function() {
    getPopupSettings();
    // Check that the user has defined some filters
    storage.get('filterArray', function(items) {
        if (items.filterArray) {
            getHiddenPostsFromBg(function(blocklist) {
                showHidden(blocklist);
            });
        } else {
            displayNoFilterWarning();
        }
    });
    addListeners();
    displayVersionNumber();
});