<?php
// 1. HEADERS - Essential for React/Vite communication
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. DATABASE CONNECTION
$host = "localhost";
$db_name = "mentorlog_db"; // Ensure this matches your actual DB name
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Connection failed: " . $e->getMessage()]);
    exit();
}

// 3. GET JSON INPUT
$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->user_id) &&
    !empty($data->full_name) &&
    !empty($data->email)
) {
    try {
        // 4. PREPARE SQL
        // We update full_name and email (from users table) and phone (if it exists in your profile/users table)
        $query = "UPDATE users 
                  SET full_name = :full_name, 
                      email = :email, 
                      phone = :phone 
                  WHERE id = :id";

        $stmt = $conn->prepare($query);

        // Sanitize and Bind
        $stmt->bindParam(':full_name', $data->full_name);
        $stmt->bindParam(':email', $data->email);
        $stmt->bindParam(':phone', $data->phone);
        $stmt->bindParam(':id', $data->user_id);

        if ($stmt->execute()) {
            echo json_encode([
                "success" => true, 
                "message" => "Profile updated successfully."
            ]);
        } else {
            echo json_encode([
                "success" => false, 
                "message" => "Unable to update profile."
            ]);
        }
    } catch(Exception $e) {
        echo json_encode([
            "success" => false, 
            "message" => "Error: " . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        "success" => false, 
        "message" => "Incomplete data. Required: user_id, full_name, email."
    ]);
}
?>