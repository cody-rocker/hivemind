// Register all listeners on the page here
function addListeners() {
    // TODO: Add icon/link to clear hiddenPosts from dropdown.
    $('#options')  // add click listener for options icon
        .on('click', function() {
            chrome.tabs.create({
                'url': chrome.extension.getURL("options.html")
            });
    });
    $('#blocked-posts')  // register listeners for hiddenPost objects
        .on('click', '.post', function() {
            $(this).children('img').slideDown();
        })
        .on('click', 'img', function() {
            chrome.tabs.create({'url': $(this).siblings('span').text()});
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
                throw Error('Bad response from background.js');
            }
    });
}

// Build a hiddenPost div object
// TODO: can this be prototyped?
function hiddenPost(obj) {
    var targetTab = "New Tab"; //TODO: make or link this to a configurable opt
    var _div = document.createElement('div'),
        _title = document.createElement('p'),
        _img = document.createElement('img'),
        _linkUrl = document.createElement('span');
    _div.id = obj.id;
    _img.src = obj.imgUrl;
    _img.style.display = "none";  //TODO: make it an opt to hide by default or not.
    _img.title = "Click to open in " + targetTab;
    _linkUrl.className = "hide";
    _linkUrl.appendChild(document.createTextNode(obj.postUrl));
    _title.appendChild(document.createTextNode(obj.title));
    _div.appendChild(_title);
    _div.appendChild(_img);
    _div.appendChild(_linkUrl);
    _div.className = "post shadow";
    return _div;
}

// Add hidden posts to popup page
function showHidden(blocklist) {
    // Update status text
    document.getElementById('status')
        .textContent = blocklist.length.toString() + " hidden item(s)";
    // Add new divs to DOM
    var blockedPosts = document.getElementById('blocked-posts');
    for ( i in blocklist ) {
        blockedPosts.appendChild(hiddenPost(blocklist[i]));
    }
}

// Triggered when browserAction icon is clicked
document.addEventListener('DOMContentLoaded', function() {
    getHiddenPostsFromBg(function(blocklist) {
        showHidden(blocklist);
        addListeners();
    });
});