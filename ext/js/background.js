var storage = chrome.storage.local;
var hiddenPosts = [];

chrome.browserAction.setTitle({ title: "HiveMind" });
chrome.browserAction.setBadgeBackgroundColor({ color: [85, 85, 85, 155] });

// NOTE: right now were just catching a badgeText update or fulfilling a
//       request for the hiddenPosts array.
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.action) {

            // case "getPopupSettings":
            //     var tabSetting, imageSetting;
            //     storage.get('newTab', function(items) {
            //         tabSetting = items.newTab;
            //     });
            //     storage.get('showImage', function(item) {
            //         imageSetting = items.showImage;
            //     });
            //     var popupSettings = {
            //         newTab: tabSetting,
            //         showImage: imageSetting
            //     }
            //     sendResponse({ popupSettings: popupSettings });
            //     break;

            case "getHiddenPosts":
                sendResponse({ hiddenPosts: hiddenPosts });
                break;

            case "contentResult":
                if (request.hiddenPosts.length === 0) {
                    chrome.browserAction.setBadgeText({ text: "" });
                    hiddenPosts = [];
                } else {
                    chrome.browserAction.setBadgeText({
                        text: request.hiddenPosts.length.toString()
                    });
                    hiddenPosts = request.hiddenPosts;
                }
                break;

            default:
                console.error('request.action = ' + request.action);
                throw Error('background.js :: missing/unimplemented action param.');
        }
    });