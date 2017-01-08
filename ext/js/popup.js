// TODO: Add "You haven't defined any filters" message when filter array is empty.
// TODO: Refactor this script with jQuery
var storage = chrome.storage.local;
// Default popupSettings
var newTab = false;
var showImages = false;

// Register all listeners on the page here
function addListeners() {
    // TODO: Add icon/link to clear hiddenPosts from dropdown.
    $('#options')  // add click listener for options icon
        .on('click', function() {
            chrome.tabs.create({'url': chrome.extension.getURL("options.html")});
    });
    $('#blocked-posts')  // register listeners for hiddenPost objects
        .on('click', '.post', function() {
            $(this).children('img').slideDown();
        })
        .on('click', 'img', function() {
            var $this = $(this);
            openHiddenPost(this);

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

// Add hidden posts to popup page
function showHidden(blocklist) {
    // Update status text
    document.getElementById('status')
        .textContent = blocklist.length.toString() + " hidden item(s)";
    // Add new divs to DOM
    var blockedPosts = document.getElementById('blocked-posts');
    for ( i in blocklist ) {
        blockedPosts.appendChild(new HiddenPost(blocklist[i]));
    }
}

function openHiddenPost(image) {
    if (newTab) {
        chrome.tabs.create({'url': image.siblings('span').text()});
    } else {
        chrome.tabs.query({
            active: true, currentWindow: true
        }, function(tabs) {
            var tab = tabs[0];
            chrome.tabs.update(tab.id, {'url': image.siblings('span').text()});
        });
    }
}

// Triggered when browserAction icon is clicked
document.addEventListener('DOMContentLoaded', function() {
    getPopupSettings();
    getHiddenPostsFromBg(function(blocklist) {
        showHidden(blocklist);
    });
    addListeners();
});