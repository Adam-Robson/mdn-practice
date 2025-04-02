
const list = document.querySelector("ul") as HTMLUListElement;
const titleInput = document.querySelector("#note-title") as HTMLInputElement;
const bodyInput = document.querySelector("#note-body") as HTMLInputElement;
const form = document.querySelector("form") as HTMLFormElement;
const publish = document.querySelector(".publish") as HTMLButtonElement;

let db: IDBDatabase;

const openReq = window.indexedDB.open("notes", 1);

openReq.addEventListener("error", () => {
  console.error("database fail.");
});

openReq.addEventListener("success", () => {
  console.info("database is open");
  db = openReq.result;
  displayNotes();
});

openReq.addEventListener("upgradeneeded", (e) => {
  const request = e.target as IDBOpenDBRequest;
  db = request.result as IDBDatabase;

  const objStore = db.createObjectStore("notes", {
    keyPath: "id",
    autoIncrement: true,
  });

  objStore.createIndex("title", "title", { unique: false });
  objStore.createIndex("body", "body", { unique: false });

  console.info("db set up");
});

form?.addEventListener("submit", createNote);

function createNote(e: Event) {
  e.preventDefault();

  const newItem = { title: titleInput?.value, body: bodyInput?.value };
  const transaction = db.transaction(["notes"], "readwrite");

  const objectStore = transaction.objectStore("notes");

  const addRequest = objectStore.add(newItem);

  addRequest.addEventListener("success", () => {
    titleInput.value = "";
    bodyInput.value = "";
  });

  transaction.addEventListener("complete", () => {
    console.log("Transaction completed: database modification finished.");

    displayNotes();
  });

  transaction.addEventListener("error", () => console.log("transaction error"));
}

function displayNotes() {
  // empty the contents of the ulist element each time
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  const objectStore = db.transaction("notes").objectStore("notes");
  objectStore.openCursor().addEventListener("success", (e) => {
    const cursor = (e.target as IDBRequest).result as IDBCursorWithValue;

    if (cursor) {
      const listItem = document.createElement("li");
      const h3 = document.createElement("h3");
      const para = document.createElement("p");

      h3.textContent = cursor.value.title;
      para.textContent = cursor.value.body;

      listItem.setAttribute("data-note-id", cursor.value.id);

      listItem.appendChild(h3);
      listItem.appendChild(para);
      list.appendChild(listItem);

      const deleteBtn = document.createElement("button");
      listItem.appendChild(deleteBtn);
      deleteBtn.textContent = "Delete";

      deleteBtn.addEventListener("click", deleteNote);

      cursor.continue();
    } else {
      if (!list.firstChild) {
        const listItem = document.createElement("li");
        listItem.textContent = "No notes stored.";
        list.appendChild(listItem);
      }
      console.log("all notes shown");
    }
  });
}

function deleteNote(e: Event) {
  const targetEl = e.target as Element;
  const noteId = Number(
    (targetEl.parentNode as Element)?.getAttribute("data-note-id")
  );

  const transaction = db.transaction(["notes"], "readwrite");
  const objectStore = transaction.objectStore("notes");
  const deleteRequest = objectStore.delete(noteId);

  transaction.addEventListener("complete", () => {
    if (targetEl.parentNode && targetEl.parentNode.parentNode) {
      targetEl.parentNode.parentNode.removeChild(targetEl.parentNode);
      console.info(`note ${noteId} removed`);
    }
  });

  if (!list.firstChild) {
    const listItem = document.createElement("li");
    listItem.textContent = "No notes stored.";
    list.appendChild(listItem);
  }
}
