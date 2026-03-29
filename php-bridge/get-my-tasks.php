<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$host = "localhost";
$db_name = "mentorlog_db";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get user_id from the URL query parameter
    $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

    if ($userId > 0) {
        // Fetch tasks specific to this user, sorted by due date
        $query = "SELECT id, title, task_description, status, due_date 
                  FROM tasks 
                  WHERE user_id = :user_id 
                  ORDER BY due_date ASC";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();

        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($tasks);
    } else {
        echo json_encode(["message" => "User ID is required."]);
    }

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Internal Server Error"]);
}
?>