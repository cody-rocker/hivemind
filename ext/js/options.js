// fetch references to background page
var backgroundPage = chrome.extension.getBackgroundPage();
// var storage = chrome.storage.local;

function populateTabs() {
    $.get('option-general.html', function(data) {
        $('#options-general').append(data);
    });
    $.get('option-filters.html', function(data) {
        $('#options-filters').append(data);
        FilterOptions.initialize();
        FilterOptions.addEventListeners();
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

function linkToHome() {
    var icon = document.createElement('img');
    icon.src = 'icons/logo.png';
    // TODO: Fetch this url dynamically
    $('#home').click(function() {
        chrome.tabs.create({'url': 'https://cody-rocker.github.io/hivemind'});
    }).append(icon);
}

function displaySocialLinks() {
    // TODO: Make this an xhr request to my server
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

$(document).ready(function () {
    // Activate JQueryUI element(s)
    $('#tabs').tabs().addClass('ui-tabs-vertical ui-helper-clearfix');
    $("#tabs li").removeClass('ui-corner-top').addClass('ui-corner-left');
    $('ul.ui-tabs-nav').addClass('shadow');
    populateTabs();
    linkToHome();
    displaySocialLinks();
    displayVersionNumber();
});