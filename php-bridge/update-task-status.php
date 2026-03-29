<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle Preflight Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = "localhost";
$db_name = "mentorlog_db";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $json = file_get_contents("php://input");
    $data = json_decode($json);

    // Validate JSON parsing
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(["message" => "Invalid JSON format."]);
        exit();
    }

    // Check if required fields exist
    if ($data && isset($data->taskId) && isset($data->status)) {
        
        $status = trim($data->status);
        $allowedStatus = ['Pending', 'In-Progress', 'Completed'];
        
        if (!in_array($status, $allowedStatus)) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid status value: " . $status]);
            exit();
        }

        $id = (int)$data->taskId; 
        $query = "UPDATE tasks SET status = :status WHERE id = :id";
        $stmt = $conn->prepare($query);

        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            // Check if any row was affected
            if ($stmt->rowCount() > 0) {
                echo json_encode([
                    "message" => "Task updated successfully.",
                    "taskId" => $id,
                    "newStatus" => $status
                ]);
            } else {
                // Returns 200 OK because the request was valid, even if no DB change happened
                echo json_encode([
                    "message" => "No changes made. Either task ID not found or status already matches.",
                    "taskId" => $id
                ]);
            }
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to update task database."]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "message" => "Incomplete data. Required: taskId and status.",
            "received" => $data
        ]);
    }

} catch(PDOException $e) {
    // Log $e->getMessage() to your server error log here
    http_response_code(500);
    echo json_encode(["message" => "Internal Server Error"]);
}
?>