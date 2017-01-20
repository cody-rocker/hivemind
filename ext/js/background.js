// var storage = chrome.storage.local;
var hiddenPosts = [];

chrome.browserAction.setTitle({ title: "HiveMind" });
chrome.browserAction.setBadgeBackgroundColor({ color: [85, 85, 85, 155] });

// NOTE: right now were just catching a badgeText update or fulfilling a
//       request for the hiddenPosts array.
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.action) {

            case "getHiddenPosts":
                sendResponse({ hiddenPosts: hiddenPosts });
                break;

            case "clearHiddenPostsFromBg":
                hiddenPosts = [];
                chrome.browserAction.setBadgeText({ text: "" });
                sendResponse({hiddenPosts: hiddenPosts});
                break

            case "contentResult":
                if (request.hiddenPosts.length === 0) {
                    hiddenPosts = [];
                    chrome.browserAction.setBadgeText({ text: "" });
                } else {
                    chrome.browserAction.setBadgeText({
                        text: request.hiddenPosts.length.toString()
                    });
                    hiddenPosts = request.hiddenPosts;
                }
                break;

            default:
                break;
        }
    });

// Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-90111337-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();