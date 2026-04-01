<?php
// 1. SET HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'db_connection.php'; // Uses your mysqli $conn

// 2. GET JSON INPUT
$data = json_decode(file_get_contents("php://input"));

// Check if basic required fields are present
if (
    !empty($data->user_id) && 
    !empty($data->full_name) && 
    !empty($data->email)
) {
    // 3. PREPARE THE SQL STATEMENT
    // Note: If you haven't added the 'phone' column to your table yet, 
    // run: ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER email;
    $sql = "UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?";
    
    $stmt = $conn->prepare($sql);

    if ($stmt) {
        // "sssi" means string, string, string, integer
        $phone = isset($data->phone) ? $data->phone : "";
        $stmt->bind_param("sssi", $data->full_name, $data->email, $phone, $data->user_id);

        if ($stmt->execute()) {
            echo json_encode([
                "success" => true, 
                "message" => "Profile updated successfully."
            ]);
        } else {
            echo json_encode([
                "success" => false, 
                "message" => "Failed to update record: " . $stmt->error
            ]);
        }
        $stmt->close();
    } else {
        echo json_encode([
            "success" => false, 
            "message" => "Database prepare error: " . $conn->error
        ]);
    }
} else {
    echo json_encode([
        "success" => false, 
        "message" => "Incomplete data. User ID, Name, and Email are required."
    ]);
}

$conn->close();
?>