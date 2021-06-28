// database variable
let db;
// establish indexdb database called budget
const request = indexedDB.open('budget', 1);

// event will occur if database changes
request.onupgradeneeded = function(event) {
    // save to database
    const db = event.target.result;
    // create object called new_budget with increment
    db.createObjectStore('new_budget', { autoIncrement: true });
};

// request goes through 
request.onsuccess = function(event) {
    // save reference to global varibale on success
    db = event.target.result;
  
    // check if app is online
    if (navigator.onLine) {
      // update budget on online connection
      uploadBudget();
    }
};
  // on failed request
request.onerror = function(event) {
    // log error
    console.log(event.target.errorCode);
};

// save a record of new budget if no internet connection
function saveRecord(record) {
    // new database transaction with read/write ability
    const transaction = db.transaction(['new_budget'], 'readwrite');
  
    // access object store of "new_budget"
    const budgetObjectStore = transaction.objectStore('new_budget');
  
    // add record
    budgetObjectStore.add(record);
}

// upload the new budget
function uploadBudget() {
    // db transaction
    const transaction = db.transaction(['new_budget'], 'readwrite');
  
    // access object store
    const budgetObjectStore = transaction.objectStore('new_budget');
  
    // get and set all records
    const getAll = budgetObjectStore.getAll();
  
    // if successful function runs
    getAll.onsuccess = function() {
    // if there was offline data, it will get sent with internet connection to transaction api
    if (getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
          method: 'POST',
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          }
        })
          .then(response => response.json())
          .then(serverResponse => {
            if (serverResponse.message) {
              throw new Error(serverResponse);
            }
            const transaction = db.transaction(['new_budget'], 'readwrite');
            // access new_budget object
            const budgetObjectStore = transaction.objectStore('new_budget');
            // clear all stored items
            budgetObjectStore.clear();
            // alert users that their offline transactions have been submitted
            // when they connect to internet
            alert('Offline transaction have been submitted!');
          })
          .catch(err => {
            console.log(err);
        });
      }
  };
}

// run uploadBudget function upon internet connection
window.addEventListener('online', uploadBudget);