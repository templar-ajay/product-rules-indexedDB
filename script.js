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

const cardData = [
  {
    title: "Bill",
    text: "bill@company.com",
  },
  {
    title: "Donna",
    text: "donna@home.org",
  },
];
// opening Database
async function getDataBase() {
  const db = await openDB();
  return db;
}

openDB();

function openDB() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("MyTestDatabase", 1);

    request.onerror = (event) => {
      reject(event.target.error);
      console.log("error");
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
      console.log(`success`);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      console.log(`upgradeneeded`);

      const objectStore = db.createObjectStore("cards", {
        autoIncrement: true,
      });
      objectStore.createIndex("text", "text", {
        unique: true,
      });
      objectStore.createIndex("title", "title", {
        unique: true,
      });

      objectStore.transaction.oncomplete = (event) => {
        console.log(`transaction complete`);
      };
    };
  });
}

async function addData(objData) {
  const db = await getDataBase();
  const txn = db.transaction("cards", "readwrite");
  const objectStore = txn.objectStore("cards");

  const request = objectStore.add(objData);
  request.oncomplete = (e) => {
    console.log(`data added to database`);
  };
}

saveNoteBtn.addEventListener("click", () => {
  const title = titleInput.value;
  const text = textInput.value;
  if (!(title?.length && text?.length)) return;

  const cardObj = {
    title: title,
    text: text,
  };
  addData(cardObj);
  clearInputFields();
});

function clearInputFields() {
  titleInput.value = "";
  textInput.value = "";
}

// function populateCards() {
//   const db = await getDataBase();
//   const objectStore = db.transaction("cards").objectStore("cards")
//   const request = objectStore.get("cards")

//   request.onerror = e => {
//     console.log(`error !!! ${e.target.error}`,);
//   }

//   request.onsuccess = e => {
//     console.log(`all cards are`,e.target.result)
//   }
// }

// async function getCardFromDatabase(index) {
//   const db = await getDataBase();
//   const txn = db.transaction("cards");
//   const objectStore = txn.objectStore("cards");
//   const request = objectStore.get(index);

//   request.onerror = (e) => {
//     console.log(`error!!! ${e.target.error}`);
//   };

//   request.onsuccess = (e) => {
//     console.log(`card of index ${index} is `, e.target.result);
//   };
// }
