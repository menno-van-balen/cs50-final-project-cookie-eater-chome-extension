let whitelist = [];
const saveButton = document.getElementById("save");

document.addEventListener("DOMContentLoaded", restore_options);
saveButton.addEventListener("click", save_options);

// Saves options to chrome.storage
function save_options() {
  const cookies = document.getElementById("delete").checked;
  const deleteNot = document.getElementById("delete-not").checked;
  const list = document.getElementsByClassName("whitelist");

  if (whitelist.length === 0) {
    for (domain of list) {
      domain.checked && whitelist.push(domain.value);
    }
  } else {
    for (domain of list) {
      if (domain.checked && !whitelist.includes(domain.value)) {
        whitelist.push(domain.value);
      }
    }
  }

  const delUnsecure = document.getElementById("save-secure").checked;

  const findButton = document.getElementById("button").checked;

  chrome.storage.sync.set(
    {
      cookies,
      deleteNot,
      delUnsecure,
      whitelist,
      findButton,
    },
    () => {
      // Update status to let user know options were saved.
      let status = document.getElementById("status");
      status.textContent = "Options saved.";
      setTimeout(() => {
        status.textContent = "";
        location.reload();
      }, 1000);
    }
  );

  // Send message to background
  chrome.runtime.sendMessage("save");
}

// Restores options stored in chrome.storage
function restore_options() {
  chrome.storage.sync.get(
    ["cookies", "deleteNot", "delUnsecure", "whitelist", "findButton"],
    (items) => {
      document.getElementById("delete").checked = items.cookies;
      document.getElementById("delete-not").checked = items.deleteNot;
      document.getElementById("save-secure").checked = items.delUnsecure;

      if (items.whitelist) whitelist = items.whitelist;
      if (whitelist.length > 0) {
        const list = document.getElementById("list");

        whitelist.forEach((item, i) => {
          const li = document.createElement("li");
          li.textContent = item + " ";
          // li.setAttribute("id", i);
          const button = document.createElement("button");
          button.setAttribute("id", item);
          button.setAttribute("class", "del-button");
          button.textContent = "x";
          button.addEventListener("click", del_item);
          li.append(button);
          list.append(li);
        });
      }

      document.getElementById("button").checked = items.findButton;
    }
  );
}

function del_item() {
  whitelist.splice(whitelist.indexOf(this.id), 1);
  // console.log(whitelist);
  saveButton.click();
}
