var core = {
  "log": false,
  "start": function () {
    core.load();
  },
  "install": function () {
    core.load();
  },
  "load": function () {
    app.alarms.reset(async function () {
      await core.update.tabs(false);
    });
  },
  "action": {
    "storage": function (changes, namespace) {
      /*  */
    },
    "notifications": function (e) {
      app.notifications.create({
        "message": e.message,
        "title": "Tab Auto Refresh"
      });
    },
    "alarm": async function (alarm) {
      const refresh = config.session.refresh;
      const target = refresh.filter(e => e.name === alarm.name);
      /*  */
      if (target) {
        if (target.length) {
          const tab = target[0].tab;
          const name = target[0].name;
          /*  */
          await core.engine.loop(tab);
          /*  */
          if (name.indexOf("-alarms-timeout-delay-") !== -1) {
            app.alarms.clear(name);
          }
          /*  */
          if (name.indexOf("-alarms-interval-period-") !== -1) {
            app.alarms.set.repeat(name);
          }
        }
      }
    }
  },
  "update": {
    "tab": async function (tab) {
      if (tab) {
        if (tab.url) {
          const valid = core.engine.sync.is.valid(tab.url, 1);
          /*  */
          if (valid) {
            await core.engine.load(tab);
          } else {
            await core.engine.stop(tab, true, 2);
          }
        }
      }
    },
    "tabs": async function (e) {
      if (e) core.update.popup(false);
      /*  */
      app.tab.query.all({}, async function (tabs) {
        if (tabs) {
          if (tabs.length) {
            for (let i = 0; i < tabs.length; i++) {
              const tab = tabs[i];
              if (tab) {
                await core.update.tab(tab);
              }
            }
          }
        }
      });
    },
    "popup": async function (action) {
      await new Promise((resolve, reject) => {
        app.tab.query.active(function (tab) {
          if (tab) {
            const current = {
              "id": tab.id, 
              "url": tab.url
            };
            /*  */
            config.tab.query.options(current, async function (options) {
              if (tab.active) {
                const badge = config.session.badge;
                if (badge[tab.id] !== undefined) {
                  app.popup.send("badge", badge[tab.id]);
                }
              }
              /*  */
              app.popup.send("storage", {
                "action": action,
                "options": options,
                "current": current,
                "color": "#787878",
                "count": config.session.count,
                "reset": config.tab.options.reset,
                "active": config.tab.options.active,
                "bypass": config.tab.options.bypass,
                "interval": config.tab.options.interval
              });
              /*  */
              resolve();
            });
          } else {
            reject();
          }
        });
      });
    }
  },
  "listener": {
    "reset": async function (e) {
      if (e) {
        config.tab.options.reset = e;
        await core.update.tabs(true);
      }
    },
    "active": async function (e) {
      if (e) {
        config.tab.options.active = e;
        await core.update.tabs(true);
      }
    },
    "bypass": async function (e) {
      if (e) {
        config.tab.options.bypass = e;
        await core.update.tabs(true);
      }
    },
    "remove": async function (e) {
      if (e) {
        const url =  e.tab.url;
        const tab = {"url": url};
        const count = config.session.count;
        /*  */
        config.tab.options.reset = {"tab": tab};
        config.tab.options.active = {"tab": tab};
        config.tab.options.bypass = {"tab": tab};
        config.tab.options.interval = {"tab": tab};
        /*  */
        delete count[url];
        /*  */
        await config.session.set.count(count);
        await core.update.tabs(true);
      }
    },
    "url": async function (e) {
      if (e) {
        const url = {};
        const tmp = {};
        /*  */
        url.new = e.tab.url;
        url.old = e.tab._url;
        /*  */
        tmp.reset = config.tab.options.reset[url.old] !== undefined ? config.tab.options.reset[url.old] : false;
        tmp.active = config.tab.options.active[url.old] !== undefined ? config.tab.options.active[url.old] : false;
        tmp.bypass = config.tab.options.bypass[url.old] !== undefined ? config.tab.options.bypass[url.old] : false;
        tmp.interval = config.tab.options.interval[url.old] !== undefined ? config.tab.options.interval[url.old] : 0;
        /*  */
        config.tab.options.reset = {"tab": {"url": url.new}, "options": tmp.reset};
        config.tab.options.active = {"tab": {"url": url.new}, "options": tmp.active};
        config.tab.options.bypass = {"tab": {"url": url.new}, "options": tmp.bypass};
        config.tab.options.interval = {"tab": {"url": url.new}, "options": tmp.interval};
        /*  */
        await new Promise(resolve => setTimeout(resolve, 300));
        await new Promise(async resolve => {
          config.tab.options.reset = {"tab": {"url": url.old}};
          config.tab.options.active = {"tab": {"url": url.old}};
          config.tab.options.bypass = {"tab": {"url": url.old}};
          config.tab.options.interval = {"tab": {"url": url.old}};
          /*  */
          await core.update.tabs(true);
          resolve();
        });
      }
    },
    "interval": async function (e) {
      if (e) {
        if (e.tab) {
          if (e.options) {
            if ("reset" in e.options) {
              config.tab.options.reset = {
                "tab": {"url": e.tab.url},
                "options": {"reset": e.options.reset}
              };
            }
            /*  */
            if ("active" in e.options) {
              config.tab.options.active = {
                "tab": {"url": e.tab.url},
                "options": {"active": e.options.active}
              };
            }
            /*  */
            if ("bypass" in e.options) {
              config.tab.options.bypass = {
                "tab": {"url": e.tab.url},
                "options": {"bypass": e.options.bypass}
              };
            }
            /*  */
            if ("interval" in e.options) {
              config.tab.options.interval = {
                "tab": {"url": e.tab.url},
                "options": {"interval": e.options.interval}
              };
            }
            /*  */
            await core.update.tabs(true);
          }
        }
      }
    }
  },
  "engine": {
    "remove": async function (id) {
      if (id) {
        await core.engine.stop({"id": id}, false, 0);
      }
    },
    "update": async function (tab) {
      if (tab) {
        if (tab.status === "complete") {
          await core.update.tab(tab);
          /*  */
          const badge = config.session.badge;
          if (badge[tab.id] !== undefined) {
            app.button.badge.text(tab.id, badge[tab.id], app.error);
            if (tab.active) {
              app.popup.send("badge", badge[tab.id]);
            }
          }
        }
      }
    },
    "clear": async function () {
      const refresh = config.session.refresh;
      for (let i = 0; i < refresh.length; i++) {
        app.alarms.clear(refresh[i].name);
      }
      /*  */
      await config.session.set.refresh([]);
      config.tab.clear(async function () {
        await core.update.tabs(true);
        /*  */
        app.notifications.create({
          "title": "Tab Auto Refresh",
          "message": "REFRESH is cleared for all tabs"
        });
      });
    },
    "load": async function (tab) {
      await new Promise((resolve, reject) => {
        if (tab) {
          config.tab.query.options(tab, async function (options) {
            const valid = options && options.interval > 0;
            /*  */
            const name = "Tab Auto Refresh";
            const path = valid ? "ON" : "OFF";
            const message = name + ": "  + path;
            const title = valid ? message + " (refresh every " + options.interval + " seconds)" : message;          
            /*  */
            if (valid) {
              await core.engine.start({"tab": tab});
            } else {
              await core.engine.stop(tab, true, 3);
            }
            /*  */
            app.button.icon(tab.id, path, app.error);
            app.button.title(tab.id, title, app.error);
            /*  */
            resolve();
          });
        } else {
          reject();
        }
      });
    },
    "sync": {
      "retrieve": function (tab) {
        if (tab) {
          const refresh = config.session.refresh;
          for (let i = 0; i < refresh.length; i++) {
            if (refresh[i].tab.id === tab.id) {
              return refresh[i];
            }
          }
        }
        /*  */
        return null;
      },
      "is": {
        "on": function (tab, interval) {
          const target = core.engine.sync.retrieve(tab);
          return target && target.interval === interval ? true : false;
        },
        "valid": function (url, loc) {
          if (url) {
            const cond_1 = url.indexOf("ftp") === 0;
            const cond_2 = url.indexOf("http") === 0;
            const cond_3 = url.indexOf("file") === 0;
            /* */
            return cond_1 || cond_2 || cond_3;
          }
          /* */
          return false;
        }
      }
    },
    "stop": async function (tab, flag, loc) {
      const target = core.engine.sync.retrieve(tab);
      if (target) {
        const refresh = config.session.refresh;
        for (let i = 0; i < refresh.length; i++) {
          if (refresh[i].name === target.name) {
            refresh.splice(i, 1);
            break;
          }
        }
        /*  */
        app.alarms.clear(target.name);
        await config.session.set.refresh(refresh);
      }
      /*  */
      if (tab.url) {
        config.tab.delete(tab);
      }
      /*  */
      const badge = config.session.badge;
      if (badge[tab.id] !== undefined) {
        delete badge[tab.id];
        await config.session.set.badge(badge);
      }
      /*  */
      if (flag) {
        app.button.icon(tab.id, "OFF", app.error);
        app.button.badge.text(tab.id, '', app.error);
        app.button.title(tab.id, "Tab Auto Refresh: OFF", app.error);
      }
    },
    "loop": async function (tab) {
      await new Promise((resolve, reject) => {
        if (tab) {
          config.tab.query.options(tab, function (options) {
            if (options) {
              app.tab.get(tab.id, async function (e) {
                if (e) {
                  const action = !options.active || (e.active && options.active === true);
                  if (action) {
                    const badge = config.session.badge;
                    const count = config.session.count;
                    /*  */
                    if (options.reset === true) {
                      app.tab.update(tab.id, {"url": tab.url});
                    } else {
                      app.tab.reload(tab.id, options.bypass);
                    }
                    /*  */
                    const tmp = badge[tab.id];
                    badge[tab.id] = tmp !== undefined ? tmp + 1 : 1;
                    count[tab.url] = badge[tab.id];
                    /*  */
                    await config.session.set.badge(badge);
                    await config.session.set.count(count);
                    app.popup.send("signal", "#6a1ea5");
                    /*  */
                    if (core.log) {
                      console.error('>', "loop", "interval", options.interval, "active", options.active, "reset", options.reset, "bypassCache", options.bypass, "time", (new Date()).toLocaleTimeString(), "url", tab.url);
                    }
                  }
                  /*  */
                  app.popup.send("count", config.session.count);
                  resolve();
                } else {
                  reject();
                }
              });
            } else {
              reject();
            }
          });
        } else {
          reject();
        }
      });
    },
    "start": async function (e) {
      await new Promise(async (resolve, reject) => {
        if (e) {
          let tab = e.tab;
          if (tab) {
            if (core.engine.sync.is.valid(tab.url, 2)) {
              config.tab.query.options(tab, async function (options) {
                if (options && options.interval > 0) {
                  app.button.icon(tab.id, "ON", app.error);
                  app.button.title(tab.id, "Tab Auto Refresh: ON" + " (refresh every " + options.interval + " seconds)", app.error);
                  /*  */
                  const interval = options.interval * 1000;
                  const inactive = core.engine.sync.is.on(tab, interval) === false;
                  const name = interval + "-alarms-interval-period-" + Math.floor(Math.random() * 1e7);
                  const target = {
                    "name": name,
                    "interval": interval,
                    "tab": {
                      "id": tab.id, 
                      "url": tab.url
                    }
                  };
                  /*  */
                  if (inactive) {
                    await core.engine.stop(tab, false, 4);
                    app.button.badge.text(tab.id, '', app.error);
                    config.tab.options.interval = {"tab": target.tab, "options": options};
                    /*  */
                    const refresh = config.session.refresh;
                    refresh.push(target);
                    await config.session.set.refresh(refresh);
                    /*  */
                    app.alarms.set.interval(name, interval);
                    /*  */
                    if (core.log) {
                      console.error('>', "start", "id", tab.id, "url", tab.url);
                    }
                  }
                } else {
                  await core.engine.stop(tab, true, 5);
                }
                /*  */
                resolve();
              });
            } else {
              await core.engine.stop(tab, true, 6);
              reject();
            }
          } else {
            reject();
          }
        } else {
          reject();
        }
      });
    }
  }
};

app.tab.on.removed(core.engine.remove);
app.tab.on.updated(core.engine.update);
app.tab.on.activated(core.engine.update);

app.popup.receive("url", core.listener.url);
app.popup.receive("clear", core.engine.clear);
app.popup.receive("reset", core.listener.reset);
app.popup.receive("remove", core.listener.remove);
app.popup.receive("bypass", core.listener.bypass);
app.popup.receive("active", core.listener.active);
app.popup.receive("interval", core.listener.interval);
app.popup.receive("notifications", core.action.notifications);
app.popup.receive("load", function () {core.update.popup(true)});
app.popup.receive("support", function () {app.tab.open(app.homepage())});
app.popup.receive("donation", function () {app.tab.open(app.homepage() + "?reason=support")});

app.on.startup(core.start);
app.on.installed(core.install);
app.on.alarm(core.action.alarm);
app.on.storage(core.action.storage);
