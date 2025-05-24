import "/aitopia/service-worker-loader.js";
(function() {
  var a = null;

  // Additional script starts here
  chrome.runtime.onInstalled.addListener(function(details) {
      if (details.reason === "install") {
          /*chrome.tabs.create({
              url: "https://chatgptsidebar.pro/chat"
          });*/

      } else if (details.reason === "update") {
          /*chrome.tabs.create({
              url: "https://www.extensions-hub.com/partners/updated/?name=Chat+GPT&propRef=Chat-GPT"
          });*/
      }
  });

// Set the uninstall URL. When the user uninstalls the extension, this URL will be opened.
chrome.runtime.setUninstallURL("https://chatgptsidebar.pro/uninstallchatgpt");

  // Additional script ends here

  chrome.runtime.onMessage.addListener(function(b) {
    switch (b.messageType) {
      case "OpenPopup":
        // Introduce a delay of 1000 milliseconds (1 second) before opening the popup
        setTimeout(function() {
          // Get accurate screen information
          chrome.system.display.getInfo(function(displays) {
            // Use the primary display
            const primaryDisplay = displays[0];
            const width = 1050;
            const height = 900;
            
            // Calculate center position based on the work area (available screen space)
            const left = Math.round(primaryDisplay.workArea.left + (primaryDisplay.workArea.width - width) / 2);
            const top = Math.round(primaryDisplay.workArea.top + (primaryDisplay.workArea.height - height) / 2);
            
            chrome.windows.create({
              url: "https://chat.openai.com/",
              type: "popup",
              focused: true,
              width: width,
              height: height,
              left: left,
              top: top
            });
          });
        }, 800); // Delay in milliseconds
        break;
      
      case "ClosePopup":
        chrome.windows.remove(a, function() {
          return null;
        });
        break;
      default:
        console.log("Sorry, background can't handle " + b + ".");
    }
  });
})();
