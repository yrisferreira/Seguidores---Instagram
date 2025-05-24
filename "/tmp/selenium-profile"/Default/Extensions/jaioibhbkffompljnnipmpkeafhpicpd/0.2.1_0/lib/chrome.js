var app = {};

app.error = function () {
  return chrome.runtime.lastError;
};

app.notifications = {
  "id": "tab-auto-refresh-notifications-id",
  "create": function (e, callback) {
    if (chrome.notifications) {
      chrome.notifications.create(app.notifications.id, {
        "type": e.type ? e.type : "basic",
        "message": e.message ? e.message : '',
        "title": e.title ? e.title : "Notifications",
        "iconUrl": e.iconUrl ? chrome.runtime.getURL(e.iconUrl) : chrome.runtime.getURL("data/icons/64.png")
      }, function (e) {
        if (callback) callback(e);
      });
    }
  }
};

app.popup = {
  "port": null,
  "message": {},
  "receive": function (id, callback) {
    if (id) {
      app.popup.message[id] = callback;
    }
  },
  "send": function (id, data) {
    if (id) {
      chrome.runtime.sendMessage({"data": data, "method": id, "path": "background-to-popup"}, app.error);
    }
  },
  "post": function (id, data) {
    if (id) {
      if (app.popup.port) {
        app.popup.port.postMessage({"data": data, "method": id, "path": "background-to-popup"});
      }
    }
  }
};

app.session = {
  "object": {},
  "read": function (id) {
    return app.session.object[id];
  },
  "load": function () {
    chrome.storage.session.get(null, function (e) {
      app.session.object = e;
    });
  },
  "write": async function (id, data, callback) {
    let tmp = {};
    tmp[id] = data;
    app.session.object[id] = data;
    /*  */
    chrome.storage.session.set(tmp, function (e) {
      if (callback) {
        callback(e);
      }
    });
  }
};

app.storage = {
  "local": {},
  "read": function (id) {
    return app.storage.local[id];
  },
  "update": function (callback) {
    if (app.session) app.session.load();
    /*  */
    chrome.storage.local.get(null, function (e) {
      app.storage.local = e;
      if (callback) {
        callback("update");
      }
    });
  },
  "write": function (id, data, callback) {
    let tmp = {};
    tmp[id] = data;
    app.storage.local[id] = data;
    /*  */
    chrome.storage.local.set(tmp, function (e) {
      if (callback) {
        callback(e);
      }
    });
  },
  "load": function (callback) {
    const keys = Object.keys(app.storage.local);
    if (keys && keys.length) {
      if (callback) {
        callback("cache");
      }
    } else {
      app.storage.update(function () {
        if (callback) callback("disk");
      });
    }
  } 
};

app.button = {
  "title": function (tabId, title, callback) {
    if (title) {
      const options = {"title": title};
      if (tabId) options["tabId"] = tabId;
      chrome.action.setTitle(options, function (e) {
        if (callback) callback(e);
      });
    }
  },
  "badge": {
    "text": function (tabId, badge, callback) {
      if (tabId) {
        chrome.action.setBadgeText({
          "tabId": tabId,
          "text": badge + ''
        }, function (e) {
          let tmp = chrome.runtime.lastError;
          if (callback) callback(e);
        });
      } else {
        chrome.action.setBadgeText({"text": badge + ''}, function (e) {
          let tmp = chrome.runtime.lastError;
          if (callback) callback(e);
        });
      }
    }
  },
  "icon": function (tabId, path, imageData, callback) {
    if (path && typeof path === "object") {
      const options = {"path": path};
      if (tabId) options["tabId"] = tabId;
      chrome.action.setIcon(options, function (e) {
        if (callback) callback(e);
      });
    } else if (imageData && typeof imageData === "object") {
      const options = {"imageData": imageData};
      if (tabId) options["tabId"] = tabId;
      chrome.action.setIcon(options, function (e) {
        if (callback) callback(e);
      });
    } else {
      const options = {
        "path": {
          "16": "../data/icons/" + (path ? path + '/' : '') + "16.png",
          "32": "../data/icons/" + (path ? path + '/' : '') + "32.png",
          "48": "../data/icons/" + (path ? path + '/' : '') + "48.png",
          "64": "../data/icons/" + (path ? path + '/' : '') + "64.png"
        }
      };
      /*  */
      if (tabId) options["tabId"] = tabId;
      chrome.action.setIcon(options, function (e) {
        if (callback) callback(e);
      }); 
    }
  }
};

app.on = {
  "management": function (callback) {
    chrome.management.getSelf(callback);
  },
  "uninstalled": function (url) {
    chrome.runtime.setUninstallURL(url, function () {});
  },
  "installed": function (callback) {
    chrome.runtime.onInstalled.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  "startup": function (callback) {
    chrome.runtime.onStartup.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  "message": function (callback) {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      app.storage.load(function () {
        callback(request, sender, sendResponse);
      });
      /*  */
      return true;
    });
  },
  "connect": function (callback) {
    chrome.runtime.onConnect.addListener(function (e) {
      app.storage.load(function () {
        if (callback) callback(e);
      });
    });
  },
  "storage": function (callback) {
    chrome.storage.onChanged.addListener(function (changes, namespace) {
      app.storage.update(function () {
        if (callback) {
          callback(changes, namespace);
        }
      });
    });
  },
  "state": function (callback) {
    if (chrome.idle) {
      chrome.idle.onStateChanged.addListener(function (e) {
        app.storage.load(function () {
          callback(e);
        });
      });
    }
  },
  "alarm": function (callback) {
    if (chrome.alarms) {
      chrome.alarms.onAlarm.addListener(function (e) {
        app.storage.load(function () {
          if (callback) callback(e);
        });
      });
    }
  }
};

app.alarms = {
  "create": function (name, options) {
    if (chrome.alarms) {
      chrome.alarms.create(name, options); 
    }
  },
  "reset": function (callback) {
    if (chrome.alarms) {
      chrome.alarms.clearAll(function (e) {
        if (callback) callback(e);
      });
    }
  },
  "clear": function (name, callback) {
    if (name) {
      if (typeof name === "string") {
        if (chrome.alarms) {
          chrome.alarms.clear(name, function (e) {
            if (callback) callback(e);
          });
        }
      }
    }
  },
  "query": {
    "all": function (callback) {
      if (chrome.alarms) {
        chrome.alarms.getAll(function (e) {
          if (callback) callback(e);
        });
      }
    },
    "by": {
      "name": function (name, callback) {
        if (chrome.alarms) {
          if (name) {
            chrome.alarms.get(name, function (e) {
              if (callback) callback(e);
            });
          }
        }
      }
    }
  },
  "set": {
    "timeout": function (name, timeout) {
      if (chrome.alarms) {
        if (timeout >= 60000) {
          chrome.alarms.create(name, {"delayInMinutes": timeout / 1000 / 60});
        } else {
          chrome.alarms.create(name, {"when": Date.now() + timeout});
        }
      }
    },
    "interval": function (name, interval) {
      if (chrome.alarms) {
        if (interval >= 60000) {
          chrome.alarms.create(name, {"periodInMinutes": interval / 1000 / 60});
        } else {
          chrome.alarms.create(name, {"when": Date.now() + interval});
        }
      }
    },
    "repeat": function (name) {
      const delay = Number(name.substring(0, name.indexOf("-alarms-")));
      /*  */
      if (delay) {
        if (delay < 60000) {
          chrome.alarms.clear(name, function () {
            chrome.alarms.create(name, {"when": Date.now() + delay});
          });
        }
      }
    }
  }
};

app.tab = {
  "options": function () {
    chrome.runtime.openOptionsPage();
  },
  "get": function (tabId, callback) {
    chrome.tabs.get(tabId, function (e) {
      if (callback) callback(e);
    });
  },
  "inject": {
    "js": function (options, callback) {
      if (chrome.scripting) {
        chrome.scripting.executeScript(options, function (e) {
          let tmp = chrome.runtime.lastError;
          if (callback) callback(e);
        });
      }
    }
  },
  "update": function (tabId, options, callback) {
    if (tabId) {
      chrome.tabs.update(tabId, options, function (e) {
        if (callback) callback(e);
      });
    } else {
      chrome.tabs.update(options, function (e) {
        if (callback) callback(e);
      });
    }
  },
  "open": function (url, index, active, callback) {
    const properties = {
      "url": url, 
      "active": active !== undefined ? active : true
    };
    /*  */
    if (index !== undefined) {
      if (typeof index === "number") {
        properties.index = index + 1;
      }
    }
    /*  */
    chrome.tabs.create(properties, function (tab) {
      if (callback) callback(tab);
    }); 
  },
  "query": {
    "index": function (callback) {
      chrome.tabs.query({"active": true, "currentWindow": true}, function (tabs) {
        let tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          callback(tabs[0].index);
        } else callback(undefined);
      });
    },
    "active": function (callback) {
      chrome.tabs.query({"active": true, "currentWindow": true}, function (tabs) {
        let tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          callback(tabs[0]);
        } else callback(undefined);
      });
    },
    "all": function (options, callback) {
      chrome.tabs.query(options ? options : {}, function (tabs) {
        let tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          callback(tabs);
        } else callback(undefined);
      });
    }
  },
  "reload": function (tabId, options, callback) {
    if (tabId) {
      if (options && typeof options === "object") {
        chrome.tabs.reload(tabId, options, function (e) {
          if (callback) callback(e);
        });
      } else {
        chrome.tabs.reload(tabId, {
          "bypassCache": options !== undefined ? options : false
        }, function (e) {
          if (callback) callback(e);
        }); 
      }
    } else {
      chrome.tabs.query({"active": true, "currentWindow": true}, function (tabs) {
        let tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          if (options && typeof options === "object") {
            chrome.tabs.reload(tabs[0].id, options, function (e) {
              if (callback) callback(e);
            });
          } else {
            chrome.tabs.reload(tabs[0].id, {
              "bypassCache": options !== undefined ? options : false
            }, function (e) {
              if (callback) callback(e);
            }); 
          }
        }
      });
    }
  },
  "on": {
    "created": function (callback) {
      chrome.tabs.onCreated.addListener(function (tab) {
        app.storage.load(function () {
          callback(tab);
        }); 
      });
    },
    "removed": function (callback) {
      chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
        app.storage.load(function () {
          callback(tabId);
        }); 
      });
    },
    "updated": function (callback) {
      chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
        app.storage.load(function () {
          if (info && info.status) {
            callback(tab);
          }
        });
      });
    },
    "activated": function (callback) {
      chrome.tabs.onActivated.addListener(function (activeInfo) {
        app.storage.load(function () {
          chrome.tabs.get(activeInfo.tabId, function (tab) {
            let error = chrome.runtime.lastError;
            callback(tab ? tab : {"id": activeInfo.tabId});
          });
        });
      });
    }
  }
};
