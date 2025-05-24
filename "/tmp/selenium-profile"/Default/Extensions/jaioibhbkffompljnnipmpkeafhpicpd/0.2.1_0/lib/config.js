var config = {};

config.welcome = {
  set lastupdate (val) {app.storage.write("lastupdate", val)},
  get lastupdate () {return app.storage.read("lastupdate") !== undefined ? app.storage.read("lastupdate") : 0}
};

config.session = {
  get badge () {return app.session.read("badge") !== undefined ? app.session.read("badge") : {}},
  get count () {return app.session.read("count") !== undefined ? app.session.read("count") : {}},
  get refresh () {return app.session.read("refresh") !== undefined ? app.session.read("refresh") : []},
  "set": {
    "badge": async function (val) {return new Promise(resolve => {app.session.write("badge", val, resolve)})},
    "count": async function (val) {return new Promise(resolve => {app.session.write("count", val, resolve)})},
    "refresh": async function (val) {return new Promise(resolve => {app.session.write("refresh", val, resolve)})}
  }
};

config.tab = {
  "clear": function (callback) {
    app.storage.write("interval", {}, callback);
  },
  "delete": function (tab) {
    let tmp = config.tab.options.interval;
    delete tmp["undefined"];
    delete tmp[tab.url];
    /*  */
    app.storage.write("interval", tmp);
  },
  "query": {
    "options": function (tab, callback) {
      if (tab && tab.url) {
        app.storage.update(function () {
          const cache = {};
          /*  */
          cache.reset = config.tab.options.reset;
          cache.bypass = config.tab.options.bypass;
          cache.active = config.tab.options.active;
          cache.interval = config.tab.options.interval;
          /*  */       
          callback({
            "reset": cache.reset[tab.url] !== undefined ? cache.reset[tab.url].reset : false,
            "active": cache.active[tab.url] !== undefined ? cache.active[tab.url].active : false,
            "bypass": cache.bypass[tab.url] !== undefined ? cache.bypass[tab.url].bypass : false,
            "interval": cache.interval[tab.url] !== undefined ? cache.interval[tab.url].interval : 0
          });
        });
      }
    }
  },
  "options": {
    get reset () {return app.storage.read("reset")!== undefined ? app.storage.read("reset") : {}},
    get active () {return app.storage.read("active")!== undefined ? app.storage.read("active") : {}},
    get bypass () {return app.storage.read("bypass")!== undefined ? app.storage.read("bypass") : {}},
    get interval () {return app.storage.read("interval") !== undefined ? app.storage.read("interval") : {}},
    //
    set reset (o) {
      if (o) {
        if (o.tab) {
          if (o.tab.url) {
            let tmp = config.tab.options.reset;
            if (o.options) tmp[o.tab.url] = o.options;
            else delete tmp[o.tab.url];
            /*  */
            app.storage.write("reset", tmp);
          }
        }
      }
    },
    set active (o) {
      if (o) {
        if (o.tab) {
          if (o.tab.url) {
            let tmp = config.tab.options.active;
            if (o.options) tmp[o.tab.url] = o.options;
            else delete tmp[o.tab.url];
            /*  */
            app.storage.write("active", tmp);
          }
        }
      }
    },
    set bypass (o) {
      if (o) {
        if (o.tab) {
          if (o.tab.url) {
            let tmp = config.tab.options.bypass;
            if (o.options) tmp[o.tab.url] = o.options;
            else delete tmp[o.tab.url];
            /*  */
            app.storage.write("bypass", tmp);
          }
        }
      }
    },
    set interval (o) {    
      if (o) {
        if (o.tab) {
          if (o.tab.url) {
            let tmp = config.tab.options.interval;
            if (o.options) tmp[o.tab.url] = o.options;
            else delete tmp[o.tab.url];
            /*  */
            app.storage.write("interval", tmp);
          }
        }
      }
    }
  }
};
