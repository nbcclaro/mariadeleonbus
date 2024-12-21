const seatLayoutData = [
    ["1", "2", "Aisle", "3"],
    ["4", "5", "Aisle", "6"],
    ["7", "8", "Aisle", "9"],
    ["10", "11", "Aisle", "12"],
    ["13", "14", "Aisle", "CR"],
    ["15", "16", "Aisle", "Door"],
    ["17", "18", "Aisle", "19"],
    ["20", "21", "Aisle", "22"],
    ["23", "24", "Aisle", "25"],
    ["26", "27", "Aisle", "28"],
    ["29", "30", "31", "32"]
];

document.addEventListener("DOMContentLoaded", () => {
    const travelDateInput = document.getElementById("travel-date");
    const travelTimeSelect = document.getElementById("travel-time");
    const checkSeatButton = document.getElementById("check-seat");
    const confirmButton = document.getElementById("confirm");
    const seatLayoutContainer = document.getElementById("seat-layout");

    checkSeatButton.addEventListener("click", () => {
        const travelDate = travelDateInput.value;
        const travelTime = travelTimeSelect.value;
        if (!travelDate || !travelTime) {
            alert("Please select a travel date and time.");
            return;
        }
        fetchSeatLayout(travelDate, travelTime);
    });

    confirmButton.addEventListener("click", () => {
        const travelDate = travelDateInput.value;
        const travelTime = travelTimeSelect.value;
        const selectedSeats = getSelectedSeats(); // Function to get selected seats
        if (selectedSeats.length === 0) {
            alert("Please select at least one seat to confirm.");
            return;
        }
        sendReservationData(travelDate, travelTime, selectedSeats);
    });

    function fetchSeatLayout(travelDate, travelTime) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost/mdlreserve/bus-seat-reservation-app/src/get_seat_layout.php", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.status === "success") {
                    displaySeatLayout(response.seatLayout);
                } else {
                    alert("Error: " + response.message);
                }
            }
        };
        const data = `travelDate=${encodeURIComponent(travelDate)}&travelTime=${encodeURIComponent(travelTime)}`;
        xhr.send(data);
    }

    function displaySeatLayout(seatLayout) {
        seatLayoutContainer.innerHTML = ""; // Clear previous layout
        seatLayoutData.forEach(row => {
            const rowDiv = document.createElement("div");
            rowDiv.className = "seat-row";
            row.forEach(seat => {
                if (seat !== "Aisle") {
                    const seatDiv = document.createElement("div");
                    seatDiv.className = "seat";
                    seatDiv.textContent = seat;
                    if (["CR", "Door", "12", "29", "30", "31", "32"].includes(seat)) {
                        seatDiv.classList.add("non-clickable");
                    } else if (seatLayout[seat] === "reserved") {
                        seatDiv.classList.add("reserved");
                    } else {
                        seatDiv.addEventListener("click", () => {
                            seatDiv.classList.toggle("selected");
                        });
                    }
                    rowDiv.appendChild(seatDiv);
                } else {
                    const aisleDiv = document.createElement("div");
                    aisleDiv.className = "aisle";
                    rowDiv.appendChild(aisleDiv);
                }
            });
            seatLayoutContainer.appendChild(rowDiv);
        });
    }

    function getSelectedSeats() {
        const selectedSeats = [];
        document.querySelectorAll(".seat.selected").forEach(seat => {
            selectedSeats.push(seat.textContent);
        });
        return selectedSeats;
    }

    function sendReservationData(travelDate, travelTime, selectedSeats) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost/mdlreserve/bus-seat-reservation-app/src/reserve.php", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.status === "success") {
                    alert("Reservation confirmed!");
                } else {
                    alert("Error: " + response.message);
                }
            }
        };
        const data = `travelDate=${encodeURIComponent(travelDate)}&travelTime=${encodeURIComponent(travelTime)}&selectedSeats[]=${selectedSeats.map(seat => encodeURIComponent(seat)).join("&selectedSeats[]=")}`;
        console.log("Sending data:", data); // Debugging log
        xhr.send(data);
    }
});