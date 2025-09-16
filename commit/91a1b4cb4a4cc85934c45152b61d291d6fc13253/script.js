const response = await fetch("./error-log.txt");
document.getElementById("error-log").textContent = await response.text();
