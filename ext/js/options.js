// fetch references to background page and local storage
var backgroundPage = chrome.extension.getBackgroundPage();
var storage = chrome.storage.local;

function populateTabs() {
    $.get('option-general.html', function(data) {
        $('#options-general').append(data);
    });
    $.get('option-filters.html', function(data) {
        $('#options-filters').append(data);
    });
}

function SocialLink(xmlElement) {
    var _link = document.createElement('a');
    var _icon = document.createElement('span');

    // Parse xml element
    this.name = xmlElement.getAttribute('Name');
    this.url = xmlElement.getAttribute('Url');
    this.icon = xmlElement.getAttribute('Icon');

    // Create html element
    _link.href = this.url;
    _link.dataset.toggle = 'tooltip';
    _link.dataset.placement = 'bottom';
    _icon.className = this.icon;
    _icon.title = this.name;
    _icon.setAttribute('aria-hidden', true);
    _link.appendChild(_icon);

    this.li = document.createElement('li');
    this.li.className = 'social';
    this.li.appendChild(_link);
    return this.li;
}

function displaySocialLinks() {
    var parser = new DOMParser();
    $.get('social-metadata.xml', function(data) {
        var xmlDoc = parser.parseFromString(data, 'text/xml');
        var socialLinks =  xmlDoc.getElementsByTagName('Link');
        for (i = 0; i < socialLinks.length; i++ ) {
            $('#social-links').append(new SocialLink(socialLinks[i]));
        }
    });

}

function displayVersionNumber() {
    try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', chrome.extension.getURL('manifest.json'), true);
        xhr.onreadystatechange = function() {
            if (this.readyState === 4) {
                var theManifest = JSON.parse(this.responseText);
                $('#version').text("HiveMind version " + theManifest.version);
            }
        };
        xhr.send();
    } catch(ex) {}  // silently fail
}

$('#tabs').tabs();

$(document).ready(function () {
    // misc. page setup
    populateTabs();
    displaySocialLinks();
    displayVersionNumber();
});