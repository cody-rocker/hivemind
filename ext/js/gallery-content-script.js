// NOTE: this script started as an adaption of a simple js snippet I wrote in
//       the chrome dev console one day. It needs a lot of work to improve
//       robustness, reliability and forward compatibility.
var storage = chrome.storage.local;
var hiddenPosts = [];
var activeFilters = [];

// load filters from storage (maybe background page in the future?)
function loadFilterArray() {
    // NOTE: this is a VERY alpha/prototype approach to filter handling/storage
    //       meant simply to get the basic functinality working.
    // TODO: prototype filter classes for more complex processing.
    //       for example "strict" matching where term and title (or word?)
    //       must match exactly.
    // TODO: I would REALLY like user based filtering (might need API access).
    //       both blacklist and whitelist, to filter or perhaps call additional
    //       attention to select users. perhaps with a content-script alert for
    //       either or both.
    var filterStorage = storage.get('filterArray', function(items) {
        if (items.filterArray)
            activeFilters = items.filterArray;
            filterPage(activeFilters);
    });
}

// pass the filterArray to the appropriate DOM function
function filterPage(filterArray) {
    // TODO: this seems like a really dumb way to go about routing the logic.
    //       for a host of reasons, need stronger references to what page we're
    //       operating on.
    var postTitle = $('.post-title');  // will return empty array on Gallery
    if (postTitle.length === 0) {
        filterGallery(filterArray);
    } else {
        // filterPost(filterArray); // Just leave this disabled for now.
    }
    updateBackgroundPage();
    addDOMUpdateListener(); // Add listener AFTER gallery modification.
}

// filter a gallery DOM
function filterGallery(filterArray) {
    var newPosts = $('div.post');

    // Iterate over each post in the gallery
    newPosts.each(function(i) {
        var $this = this;  // get references to current post in loop
        var postTitle = this.lastElementChild.firstElementChild.innerHTML;
        var postUrl = this.firstElementChild.href;
        var imgUrl = this.firstElementChild.firstElementChild.src;
        if (postTitle === undefined || postUrl === undefined || imgUrl === undefined) {
            // We're getting to this call before the pages async elements have
            // finished. Or Imgur has changed the page layout.
            console.error($this);
            throw Error("Failed to fetch post metadata");
        }

        // does this title match any of the filter keywords?
        if (matchTitle(filterArray, postTitle)) {
            // Make sure this item wasn't already hidden in a previous scan
            if ($this.style.display !== "none") {
                // Hide the matched post div
                $this.style.display = "none";
                // NOTE: object schema is used to create the div objects in popup.
                // Add matched post to the hiddenPosts array
                hiddenPosts.push({
                    id: $this.id,
                    title: postTitle,
                    postUrl: postUrl,
                    imgUrl: imgUrl
                });
            }
        }
    });
}

// ======[  EXPERIMENTAL!!!  ]======
// NOTE: This goes against my better judgement in DontRepeatYourself practice,
//       because the function structure is so similar but the DOM references
//       and async function timing are completely different (and broken),
//       for now, i'll keep the functionality completely separate and port in any
//       abstraction/refactoring in parallel. :(

// filter a post detail DOM
function filterPost(filterArray) {
    // FIXME: Fails on gif/video posts.
    // TODO: Make this "auto-advance" a configuration option.
    var postTitle = $('.post-title').text();
    var postUrl = $('.post-container').prop('baseURI');
    var imgUrl = $('.post-image').find('img').first().prop('src');
    if (postTitle === undefined || postUrl === undefined || imgUrl === undefined) {
        // We're getting to this call before the pages async elements have
        // finished. Or Imgur has changed the page layout.
        // NOTE: old fallback reference; probably unneeded.
        // imgUrl = $('.post-image-placeholder').first().prop('src');
        console.error('postTitle::' + postTitle + ';postUrl::' + postUrl + ';imgUrl::' + imgUrl + ';');
        throw Error("Failed to fetch post metadata");
    }

    if (matchTitle(filterArray, postTitle)) {
        // NOTE: object schema is used to create the div objects in popup.
        // Add matched post to the hiddenPosts array
        hiddenPosts.push({
            // id: ,  //FIXME: need a reference to the imgurpost hash/id?
            title: postTitle,
            postUrl: postUrl,
            imgUrl: imgUrl
        });
        // Increment the counter for badge update
        hiddenPostCounter++;
        // FIXME: make sure this reference/call isn't undefined.
        $('.btn-action.navNext').trigger('click');
    }
}

// compare a title(string) to an array of filter(strings)
function matchTitle(filterArray, postTitle) {
    // NOTE: lazy/fuzzy comparison allows partial matches of words containing
    //       substrings. eg: "." matches "..."
    for (i in filterArray) {
        if (postTitle.toLowerCase().includes(filterArray[i].toLowerCase()))
            return true;
    }
    return false;
}

// make extension background aware of results
function updateBackgroundPage() {
    // this is probably going to get (at least slightly) more complex but
    // for now this will handle all content-script => background exchanges.
    chrome.runtime.sendMessage({
        action: "contentResult",
        hiddenPosts: hiddenPosts
    });
}

function DOMModificationHandler() {
    $(this).unbind('DOMSubtreeModified');
    setTimeout(function() {
        catchDOMUpdates();
        $(this).bind('DOMSubtreeModified', DOMModificationHandler);
    }, 1000);
}

function catchDOMUpdates() {
    // console.log("The DOM has been modified");
    removeDOMUpdateListener();
    filterPage(activeFilters);
}

function addDOMUpdateListener() {
    $(this).bind('DOMSubtreeModified', DOMModificationHandler);
}

function removeDOMUpdateListener() {
    $(this).unbind('DOMSubtreeModified', DOMModificationHandler);
}

// TODO: I can probably handle fetching the active filters from storage
//       and other module communication while the DOM is loading and Imgur
//       is running it's async routines
$(document).ready(function (jQuery) {
    // TODO: & THEN begin processing on page content after the DOM is populated.
    loadFilterArray();
});