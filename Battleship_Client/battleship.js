function newGame() {
  const payload = {
    grid: [10, 10],
    fleet: [[1, 1], [2, 2], [1, 1], [1, 1]]
  };

  fetch("http://localhost:3000/battleship/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("response").textContent = JSON.stringify(data, null, 2);
      document.getElementById("message").textContent = data.message || data.status;
    })
    .catch(err => {
      document.getElementById("response").textContent = "Error";
      document.getElementById("message").textContent = err.message;
    });
}

function lob() {
  const x = parseInt(document.getElementById("lob-x").value);
  const y = parseInt(document.getElementById("lob-y").value);

  if (isNaN(x) || isNaN(y)) {
    document.getElementById("message").textContent = "Invalid coordinates";
    return;
  }

  fetch("http://localhost:3000/battleship/lob", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ grid: [x, y] })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("response").textContent = JSON.stringify(data, null, 2);
      document.getElementById("message").textContent = data.message || data.status || "No message";
    })
    .catch(err => {
      document.getElementById("response").textContent = "Error";
      document.getElementById("message").textContent = err.message;
    });
}

function hit() {
  fetch("http://localhost:3000/battleship/hit", {
    method: "POST"
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("response").textContent = JSON.stringify(data, null, 2);
      document.getElementById("message").textContent = data.message || data.status || "No message";
    })
    .catch(err => {
      document.getElementById("response").textContent = "Error";
      document.getElementById("message").textContent = err.message;
    });
}

function miss() {
  fetch("http://localhost:3000/battleship/miss", {
    method: "POST"
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("response").textContent = JSON.stringify(data, null, 2);
      document.getElementById("message").textContent = data.message || data.status || "No message";
    })
    .catch(err => {
      document.getElementById("response").textContent = "Error";
      document.getElementById("message").textContent = err.message;
    });
}

function concede() {
  fetch("http://localhost:3000/battleship/concede", {
    method: "POST"
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("response").textContent = JSON.stringify(data, null, 2);
      document.getElementById("message").textContent = data.message || data.status || "No message";
    })
    .catch(err => {
      document.getElementById("response").textContent = "Error";
      document.getElementById("message").textContent = err.message;
    });
}

function cancel() {
  fetch("http://localhost:3000/battleship/cancel", {
    method: "POST"
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("response").textContent = JSON.stringify(data, null, 2);
      document.getElementById("message").textContent = data.message || data.status || "No message";
    })
    .catch(err => {
      document.getElementById("response").textContent = "Error";
      document.getElementById("message").textContent = err.message;
    });
}

function statusGame() {
  fetch("http://localhost:3000/battleship/status")
    .then(res => res.json())
    .then(data => {
      document.getElementById("response").textContent = JSON.stringify(data, null, 2);
      document.getElementById("message").textContent = data.message || data.status || "No message";
    })
    .catch(err => {
      document.getElementById("response").textContent = "Error";
      document.getElementById("message").textContent = err.message;
    });
}
