var background = {
  "port": null,
  "message": {},
  "receive": function (id, callback) {
    if (id) {
      background.message[id] = callback;
    }
  },
  "send": function (id, data) {
    if (id) {
      chrome.runtime.sendMessage({
        "method": id,
        "data": data,
        "path": "popup-to-background"
      }, function () {
        return chrome.runtime.lastError;
      });
    }
  },
  "connect": function (port) {
    chrome.runtime.onMessage.addListener(background.listener); 
    /*  */
    if (port) {
      background.port = port;
      background.port.onMessage.addListener(background.listener);
      background.port.onDisconnect.addListener(function () {
        background.port = null;
      });
    }
  },
  "post": function (id, data) {
    if (id) {
      if (background.port) {
        background.port.postMessage({
          "method": id,
          "data": data,
          "path": "popup-to-background",
          "port": background.port.name
        });
      }
    }
  },
  "listener": function (e) {
    if (e) {
      for (let id in background.message) {
        if (background.message[id]) {
          if ((typeof background.message[id]) === "function") {
            if (e.path === "background-to-popup") {
              if (e.method === id) {
                background.message[id](e.data);
              }
            }
          }
        }
      }
    }
  }
};

var config = {
  "badge": function (e) {
    document.querySelector(".badge").textContent = '#' + e + " - ";
  },
  "signal": function (color) {
    if (color) {
      const signal = document.querySelector(".sidebar .signal");
      signal.style.backgroundColor = color;
      window.setTimeout(function () {
        signal.style.backgroundColor = "#00000017";
      }, 300);
    }
  },
  "current": {
    "tab": null,
    "count": {},
    "is": {
      "valid": function () {
        const cond_1 = config.current.tab.url.indexOf("ftp") === 0;
        const cond_2 = config.current.tab.url.indexOf("http") === 0;
        const cond_3 = config.current.tab.url.indexOf("file") === 0;
        /*  */
        return cond_1 || cond_2 || cond_3;
      }
    }
  },
  "status": {
    "update": function (e) {
      const status = document.getElementById("status");
      /*  */
      status.setAttribute("busy", '');
      status.textContent = e.target.title;
    },
    "reset": function () {
      const status = document.getElementById("status");
      /*  */
      status.removeAttribute("busy");
      status.textContent = "Tab Auto Refresh";
    }
  },
  "count": function (e) {
    if (e) {
      config.current.count = e;
      /*  */
      for (const key in config.current.count) {
        const panel = document.getElementById("panel");
        const tbody = panel.querySelector("table tbody");
        /*  */
        const tr = tbody.querySelector("tr[url='" + key + "']");
        if (tr) {
          const count = tr.querySelector(".count");
          if (count) {
            count.textContent = config.current.count[key] !== undefined ? config.current.count[key] : 0;
          }
        }
      }
    }
  },
  "load": function () {
    const task = document.getElementById("task");
    const stop = document.getElementById("stop");
    const reset = document.getElementById("reset");
    const clear = document.getElementById("clear");
    const bypass = document.getElementById("bypass");
    const active = document.getElementById("active");
    const explore = document.getElementById("explore");
    const support = document.getElementById("support");
    const donation = document.getElementById("donation");
    const interval = document.getElementById("interval");
    const elements = [...document.querySelectorAll("*[title]")];
    /*  */
    task.addEventListener("click", config.listener.task);
    clear.addEventListener("click", config.listener.clear);
    reset.addEventListener("change", config.listener.settings);
    bypass.addEventListener("change", config.listener.settings);
    active.addEventListener("change", config.listener.settings);
    interval.addEventListener("change", config.listener.interval);
    stop.addEventListener("click", function () {config.action(0)});
    support.addEventListener("click", function () {background.send("support")});
    donation.addEventListener("click", function () {background.send("donation")});
    /*  */
    interval.focus();
    if (navigator.userAgent.indexOf("Edg") !== -1) explore.style.display = "none";
    /*  */
    if (elements) {
      for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener("mouseleave", config.status.reset);
        elements[i].addEventListener("mouseenter", config.status.update);
      }
    }
    /*  */
    background.send("load");
    window.removeEventListener("load", config.load, false);
  },
  "action": function (e) {
    if (e > -1) {
      const tab = document.getElementById("tab");
      const reset = document.getElementById("reset");
      const bypass = document.getElementById("bypass");
      const active = document.getElementById("active");
      const interval = document.getElementById("interval");
      /*  */
      interval.value = e;
      /*  */
      if (config.current.tab) {
        const cond_1 = e > 0;
        const cond_2 = config.current.tab.url.indexOf("mybrowseraddon.com") !== -1;
        if (cond_1 && cond_2) {
          background.send("notifications", {
            "message": "Note: Tab Auto Refresh is not active for MyBrowserAddon.com"
          });
          /*  */
          return;
        }
        /*  */
        const valid = config.current.is.valid();
        tab.textContent = valid ? config.current.tab.url : "Invalid tab: " + config.current.tab.url;
        /*  */
        if (valid) {
          background.send("interval", {
            "tab": config.current.tab,
            "options": {
              "reset": reset.checked,
              "bypass": bypass.checked,
              "active": active.checked,
              "interval": Number(interval.value)
            }
          });
        } else {
          background.send("notifications", {
            "message": "Tab Auto Refresh is not working for " + config.current.tab.url
          });
        }
      }
    }
  },
  "listener": {
    "task": function () {
      const sidebar = document.querySelector(".sidebar");
      const state = sidebar.getAttribute("state");
      /*  */
      sidebar.setAttribute("state", state === "show" ? "hide" : "show");
    },
    "clear": function () {
      const flag = window.confirm("Are you sure you want to clear refresh for all tabs?");
      if (flag) {
        interval.value = 0;
        background.send("clear");
      }
    },
    "interval": function (e) {
      const value = parseInt(e.target.value);
      /*  */
      if (value > 0 && value <= 24 * 60 * 60) {
        return config.action(value);
      }
      /*  */
      e.target.value = 0;
      config.action(e.target.value);
    },
    "window": function (e) {
      if (e) {
        if (e.target) {
          const closest = e.target.closest("#explore");
          if (closest) {
            const sidebar = document.querySelector(".sidebar");
            sidebar.setAttribute("state", "hide");
          }
        }
      }
    },
    "remove": function (e) {
      if (e) {
        if (e.target) {
          const tr = e.target.closest("tr");
          const url = tr.querySelector(".url input");
          /*  */
          background.send("remove", {
            "tab": {
              "url": url.value
            }
          });
        }
      }
    },
    "input": function (e) {
      if (e) {
        if (e.target) {
          const tr = e.target.closest("tr");
          const td = e.target.closest("td");
          const type = e.target.type;
          const id = td.className;
          /*  */
          if (id) {
            const options = {};
            const _url = tr.getAttribute("url");
            const url = tr.querySelector(".url input");
            options[id] = type === "checkbox" ? e.target.checked : Number(e.target.value);
            /*  */
            background.send(id, {
              "options": options,
              "tab": {
                "url": url.value,
                ...(id === "url") && ({"_url": _url})
              }
            });
          }
        }
      }
    },
    "settings": function (e) {
      if (e) {
        if (e.target) {
          const id = e.target.id;
          /*  */
          if (id) {
            if (config.current.tab) {
              const valid = config.current.is.valid();
              if (valid) {
                const options = {};
                options[id] = e.target.checked;
                /*  */
                const label = document.querySelector("label[for='" + id + "']");
                if (label) {
                  label.setAttribute("checked", e.target.checked);
                }
                /*  */
                background.send(id, {
                  "options": options,
                  "tab": config.current.tab
                });
              }
            }
          }
        }
      }
    }
  },
  "render": function (e) {
    if (e) {
      config.signal(e.color);
      /*  */
      if (e.current) {
        config.current.tab = e.current;
        /*  */
        const valid = config.current.is.valid();
        const interval = document.getElementById("interval");
        /*  */
        valid ? interval.removeAttribute("disabled") : interval.disabled = true;
      }
      /*  */
      if (e.options) {
        document.getElementById("reset").checked = e.options.reset;
        document.getElementById("bypass").checked = e.options.bypass;
        document.getElementById("active").checked = e.options.active;
        document.querySelector("label[for='reset']").setAttribute("checked", e.options.reset);
        document.querySelector("label[for='bypass']").setAttribute("checked", e.options.bypass);
        document.querySelector("label[for='active']").setAttribute("checked", e.options.active);
        /*  */
        if (e.action) {
          config.action(e.options.interval);
        } else {
          interval.value = e.options.interval;
        }
      }
      /*  */
      const panel = document.getElementById("panel");
      const tbody = panel.querySelector("table tbody");
      /*  */
      tbody.textContent = '';
      for (const key in e.interval) {
        if (key) {
          const input = {};
          /*  */
          const tr = document.createElement("tr");
          const url = document.createElement("td");
          const count = document.createElement("td");
          const reset = document.createElement("td");
          const remove = document.createElement("td");
          const bypass = document.createElement("td");
          const active = document.createElement("td");
          const interval = document.createElement("td");
          /*  */
          input.url = document.createElement("input");
          input.reset = document.createElement("input");
          input.remove = document.createElement("input");
          input.bypass = document.createElement("input");
          input.active = document.createElement("input");
          input.interval = document.createElement("input");
          /*  */
          input.url.value = key;
          input.remove.value = '✖';
          count.textContent = e.count[key] !== undefined ? e.count[key] : 0;
          input.reset.checked = e.reset[key] !== undefined ? e.reset[key].reset : false;
          input.bypass.checked = e.bypass[key] !== undefined ? e.bypass[key].bypass : false;
          input.active.checked = e.active[key] !== undefined ? e.active[key].active : false;
          input.interval.value = e.interval[key] !== undefined ? e.interval[key].interval : 0;
          /*  */
          remove.addEventListener("click", config.listener.remove);
          input.url.addEventListener("change", config.listener.input);
          input.reset.addEventListener("change", config.listener.input);
          input.bypass.addEventListener("change", config.listener.input);
          input.active.addEventListener("change", config.listener.input);
          input.interval.addEventListener("change", config.listener.input);
          /*  */
          tr.setAttribute("url", key);
          url.setAttribute("class", "url");
          count.setAttribute("class", "count");
          reset.setAttribute("class", "reset");
          remove.setAttribute("class", "remove");
          bypass.setAttribute("class", "bypass");
          active.setAttribute("class", "active");
          interval.setAttribute("class", "interval");
          if (!e.interval[key].interval) tr.setAttribute("inactive", '');
          /*  */
          input.url.setAttribute("type", "text");
          input.interval.setAttribute("min", '0');
          input.remove.setAttribute("type", "text");
          input.reset.setAttribute("type", "checkbox");
          input.bypass.setAttribute("type", "checkbox");
          input.active.setAttribute("type", "checkbox");
          input.interval.setAttribute("type", "number");
          /*  */
          url.appendChild(input.url);
          reset.appendChild(input.reset);
          bypass.appendChild(input.bypass);
          active.appendChild(input.active);
          remove.appendChild(input.remove);
          interval.appendChild(input.interval);
          /*  */
          tr.appendChild(url);
          tr.appendChild(count);
          tr.appendChild(active);
          tr.appendChild(bypass);
          tr.appendChild(reset);
          tr.appendChild(interval);
          tr.appendChild(remove);
          /*  */
          tbody.appendChild(tr);
        }
      }
    }
  }
};

background.receive("count", config.count);
background.receive("badge", config.badge);
background.receive("signal", config.signal);
background.receive("storage", config.render);
background.connect(chrome.runtime.connect({"name": "popup"}));

window.addEventListener("load", config.load, false);
window.addEventListener("click", config.listener.window, false);
