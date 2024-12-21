<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "bus_reservation";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}

// Get data from POST request
$travelDate = $_POST['travelDate'];
$travelTime = $_POST['travelTime'];

// Fetch seat layout data from the database
$sql = "SELECT seat_number, status FROM reservations WHERE travel_date = '$travelDate' AND travel_time = '$travelTime'";
$result = $conn->query($sql);

$seatLayout = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $seatLayout[$row['seat_number']] = $row['status'];
    }
}

$conn->close();
echo json_encode(["status" => "success", "seatLayout" => $seatLayout]);
?>