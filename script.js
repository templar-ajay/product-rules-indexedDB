function createCard(id, title, text) {
  return `<div id="note-${id}" class="card text-bg-light m-2" style="max-width: 18rem">
    <div class="card-header" >Note ID - ${id}</div>
    <div class="card-body">
    <h5 class="card-title" >${title}</h5>
    <p class="card-text">
    ${text}
    </p>
    </div>
    </div>`;
}

const cardsContainerEl = document.querySelector("#cardsContainer");

// Array.from(Array(10).keys()).forEach((e) => {
//   cardsContainerEl.innerHTML += cardHTML;
// });

const titleInput = document.querySelector("#title");
const textInput = document.querySelector("#text");
const saveNoteBtn = document.querySelector("#saveNoteBtn");
const discardNote = document.querySelector("#discardNoteBtn");

var db;

const requestOpeningNotesDatabase = indexedDB.open("notesDatabase", 1);

requestOpeningNotesDatabase.onerror = (e) => {
  console.log(`Error opening database ${e.target.error}`);
};
requestOpeningNotesDatabase.onsuccess = (e) => {
  console.log(`database "${e.target.result.name}" opened successfully`);
};
requestOpeningNotesDatabase.onupgradeneeded = (e) => {
  console.log(`onupgradeneeded event called on "${e.target.result.name}`);

  db = e.target.result;
  db.onerror = (e) => {
    console.log(`DataBase error !! ${e.target.errorCode}`);
  };

  const objectStore = db.createObjectStore("notes", { keyPath: "id" });
  objectStore.createIndex("title", "title", { unique: true });
  objectStore.createIndex("text", "text", { unique: true });
};

//

saveNoteBtn.addEventListener("click", saveNote);

const idGenerator = onetime();

//// add data

function addData(note) {
  const transaction = db.transaction(["notes"], "readwrite");

  transaction.oncomplete = (e) => {
    console.log(`Data added to the ${e.target}`);
  };
  transaction.onerror = (e) => {
    console.warn(
      `an Error is preventing to add data in ${e.target} Error !!! -> ${e.target.error}`
    );
  };

  const objectStore = transaction.objectStore("notes");
  const request = objectStore.add(note);
  request.onsuccess = (e) => {
    console.log(`${e.target.result} data added successfully`);
  };
}

//
function saveNote(event) {
  if (!(titleInput.value.length && textInput.value.length)) return;
  console.log(`${event.target.innerHTML} button clicked`);

  const noteObj = {};
  noteObj.id = idGenerator();
  noteObj.title = titleInput.value;
  noteObj.text = textInput.value;

  addData(noteObj);
}

////////////////////////  Side Functions  /////////////////////////////////
function onetime() {
  const ids = [];
  let idCount = 0;

  function idGenerator() {
    ids.push(idCount++);
    return idCount;
  }
  return idGenerator;
}
