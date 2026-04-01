<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db_connection.php'; // Ensure this file uses mysqli $conn

// 1. Get the user ID from the URL
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

if (!$user_id) {
    echo json_encode([
        "success" => false, 
        "message" => "User ID is required."
    ]);
    exit();
}

// 2. Prepare the statement using mysqli with the NEW columns
$sql = "SELECT full_name, email, phone, student_id, course, year_level, ojt_hours_required 
        FROM users 
        WHERE id = ? 
        LIMIT 1";

$stmt = $conn->prepare($sql);

if ($stmt) {
    // "i" means the parameter is an integer
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if ($user) {
        // 3. Output the real data from the database
        echo json_encode([
            "success" => true,
            "user" => [
                "full_name"          => $user['full_name'],
                "email"              => $user['email'],
                "phone"              => $user['phone'] ?? '',
                "student_id"         => $user['student_id'] ?? 'N/A',
                "course"             => $user['course'] ?? 'BS Information Technology',
                "year_level"         => $user['year_level'] ?? '4',
                "ojt_hours_required" => (int)($user['ojt_hours_required'] ?? 600)
            ]
        ]);
    } else {
        echo json_encode([
            "success" => false, 
            "message" => "User not found."
        ]);
    }
    $stmt->close();
} else {
    echo json_encode([
        "success" => false, 
        "message" => "Database error: Failed to prepare statement."
    ]);
}

$conn->close();
?>