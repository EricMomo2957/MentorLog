<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db_connection.php'; // Using your mysqli $conn

// 1. Get the user ID from the URL
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "User ID is required."]);
    exit();
}

// 2. Prepare the statement using mysqli
// Note: If 'phone' doesn't exist in your table yet, remove it from the SELECT
$sql = "SELECT fullname, email, role FROM users WHERE id = ? LIMIT 1";
$stmt = $conn->prepare($sql);

if ($stmt) {
    // "i" means the parameter is an integer
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if ($user) {
        // 3. Map the database result to match your React 'UserProfile' interface
        $profileData = [
            "full_name"          => $user['full_name'],
            "email"              => $user['email'],
            "phone"              => isset($user['phone']) ? $user['phone'] : "Not provided",
            "student_id"         => "2025-" . str_pad($user_id, 4, "0", STR_PAD_LEFT),
            "course"             => "BS Information Technology", // Placeholder
            "year_level"         => "4",                         // Placeholder
            "ojt_hours_required" => 600                          // Placeholder
        ];

        echo json_encode([
            "success" => true, 
            "user" => $profileData
        ]);
    } else {
        echo json_encode([
            "success" => false, 
            "message" => "User not found in database."
        ]);
    }
    $stmt->close();
} else {
    echo json_encode([
        "success" => false, 
        "message" => "Failed to prepare the database statement."
    ]);
}

$conn->close();
?>