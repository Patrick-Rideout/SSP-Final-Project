document.addEventListener("DOMContentLoaded", () => {
    const newButton = document.getElementById("new");
  
    newButton.addEventListener("click", () => {
      fetch("http://localhost:3000/battleship/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({}) // Send empty JSON to trigger defaults
      })
        .then(res => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        })
        .then(data => {
          document.getElementById("response").textContent = JSON.stringify(data, null, 2);
          document.getElementById("message").textContent = data.message || "No message.";
        })
        .catch(err => {
          document.getElementById("response").textContent = "Request failed";
          document.getElementById("message").textContent = err.message;
        });
    });
  });
  