// Declare and assign global variables on startup
let cookies, whitelist, delUnsecure;
let openTabs = {};

const optionsPage = this.location.origin + "/options/options.html";
const chromeReg = /^chrome:\/\/.*/;

// Actions when extension gets installed for the first time
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.storage.sync.set({ cookies: true });
    chrome.tabs.create({
      url: optionsPage,
      active: true,
    });
  }
});

// Actions on startup, reload, or when options are saved
// Load properties from storage
chrome.storage.sync.get(["cookies", "whitelist", "delUnsecure"], (store) => {
  // console.log("storage: ", store);
  cookies = store.cookies;

  if (store.whitelist) {
    whitelist = store.whitelist;
  }
  delUnsecure = store.delUnsecure;

  // Load all domains from open tabs in urls or clear urls
  if (cookies) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (!chromeReg.test(tab.url) && tab.url !== optionsPage) {
          openTabs[tab.id] = getDomain(tab);
        }
      });
    });
  } else {
    openTabs = {};
  }
  // console.log("openTabs:", openTabs);
});

// Actions when a tab gets updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Set badge text and color only on changes in optionsPage
  if (tab.url === optionsPage) {
    if (!cookies) {
      chrome.browserAction.setBadgeBackgroundColor({ color: "#ff8000" });
      chrome.browserAction.setBadgeText({ text: "OFF" });
    } else {
      chrome.browserAction.setBadgeBackgroundColor({ color: "#00FFFFFF" });
      chrome.browserAction.setBadgeText({ text: "" });
    }
  } else {
    // Get domain and add to urls or update urls to new domain
    if (cookies && tab.status === "complete" && !chromeReg.test(tab.url)) {
      // set prevdomain from urls then get new domain;
      const prevDomain = openTabs[tab.id];
      const domain = getDomain(tab);

      // console.log("prev domain:", prevDomain, " current domain:", domain);

      // Inject find-and-push-button-script to allow for cookies
      if (
        (prevDomain === undefined || prevDomain !== domain) &&
        !whitelist.includes(domain)
      ) {
        pushButton();
      }

      // Delete cookies
      if (
        prevDomain !== undefined &&
        prevDomain !== domain &&
        (!whitelist.includes(prevDomain) || delUnsecure)
      ) {
        deleteCookies(prevDomain, delUnsecure);
      }

      // Update urls object
      openTabs[tab.id] = domain;
      // console.log("openTabs:", openTabs);
    }
  }
});

// Actions at tab close
chrome.tabs.onRemoved.addListener((tabId, info) => {
  // console.log("removed tab with id", tabId);
  // Delete cookies if not in whitelist, and update urls
  if (
    cookies &&
    tabId in openTabs &&
    (!whitelist.includes(openTabs[tabId]) || delUnsecure)
  ) {
    deleteCookies(openTabs[tabId], delUnsecure);
    delete openTabs[tabId];
    // console.log("openTabs", openTabs);
  }
});

// Actions on messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Add domain to whitelist (message from popup)
  if (message === "add") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
      tabId = tab[0].id;
      if (tabId in openTabs && !whitelist.includes(openTabs[tabId])) {
        // console.log("adding domain:", openTabs[tabId]);
        whitelist.push(openTabs[tabId]);
        chrome.storage.sync.set({ whitelist });
        // console.log("update whitelist:", whitelist);
      }
    });

    // and reload optionsPage if open
    chrome.tabs.query({ url: optionsPage }, (tab) => {
      if (tab[0]) chrome.tabs.reload(tab[0].id);
    });
  }

  // Reload extension (message from options)
  if (message === "save") {
    location.reload();
  }
});

// Helper functions
// function pushButton injects script to find the confirmation button
function pushButton() {
  // console.log("bg injected find-and-push-button script");
  chrome.tabs.executeScript(
    null,
    { file: "scripts/pushConfirmationButton.js" },
    () => {
      const lastErr = chrome.runtime.lastError;
      if (lastErr) console.log("lastError: " + JSON.stringify(lastErr));
    }
  );
}

// Function deletecookies deletes cookies from certain url
function deleteCookies(domain, delUnsecure) {
  chrome.cookies.getAll({ domain }, (store) => {
    // console.log("cookieStore before:", store);
    store.forEach((cookie) => {
      if (
        (delUnsecure && whitelist.includes(domain)) ||
        (!delUnsecure && !whitelist.includes(domain))
      ) {
        if (!cookie.secure) {
          // delete only non secure cookies
          // console.log(
          //   "del cookie (from whitelist if secure flag = false)",
          //   cookie
          // );
          removeCookie(cookie);
        }
      } else {
        // delete all cookies
        // console.log("del cookie (all cookies)", cookie);
        removeCookie(cookie);
      }
    });
  });

  // /* Uncomment if you want prove in the console: */
  setTimeout(() => {
    chrome.cookies.getAll({ domain }, (store) => {
      // console.log("cookieStore after:", store);
    });
  }, 100);

  function removeCookie(cookie) {
    const url =
      "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
    chrome.cookies.remove({ url: url, name: cookie.name });
  }
}

// Function getDomain returns the domain name used to find cookies in a cookieStore
function getDomain(tab) {
  domain = tab.url;
  domain = domain.slice(domain.indexOf("/") + 2);
  domain = domain.slice(0, domain.indexOf("/"));

  while (countPeriods(domain) > 1) {
    domain = domain.slice(domain.indexOf(".") + 1);
  }

  domain = "." + domain;
  return domain;

  function countPeriods(string) {
    let count = 0;
    for (let char of string) {
      if (char === ".") count++;
    }
    return count;
  }
}
