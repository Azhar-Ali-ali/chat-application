-- ============================================
-- AutoVerse Chat Application - SQL Database
-- ============================================
-- Database: autoverse_chat
-- Type: MySQL/MariaDB compatible
-- Created: January 2024
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS autoverse_chat;
USE autoverse_chat;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture LONGTEXT,
    status ENUM('online', 'offline', 'away') DEFAULT 'offline',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_seen TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content LONGTEXT NOT NULL,
    message_type ENUM('text', 'image', 'file', 'link') DEFAULT 'text',
    attachment_url LONGTEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender_receiver (sender_id, receiver_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
CREATE TABLE conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    last_message_id INT,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL,
    INDEX idx_last_message_at (last_message_at),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CONVERSATION_PARTICIPANTS TABLE
-- ============================================
CREATE TABLE conversation_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    user_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_conversation_user (conversation_id, user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_conversation_id (conversation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FRIEND_REQUESTS TABLE
-- ============================================
CREATE TABLE friend_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_friend_request (sender_id, receiver_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FRIENDSHIPS TABLE
-- ============================================
CREATE TABLE friendships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_friendship (user_id, friend_id),
    INDEX idx_user_id (user_id),
    INDEX idx_friend_id (friend_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MESSAGE_ATTACHMENTS TABLE
-- ============================================
CREATE TABLE message_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    INDEX idx_message_id (message_id),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USER_SESSIONS TABLE
-- ============================================
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expiry_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_expiry_at (expiry_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USER_ACTIVITY_LOG TABLE
-- ============================================
CREATE TABLE user_activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type VARCHAR(50),
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BLOCKED_USERS TABLE
-- ============================================
CREATE TABLE blocked_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    blocked_user_id INT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_blocked (user_id, blocked_user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_blocked_user_id (blocked_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MESSAGE_REACTIONS TABLE
-- ============================================
CREATE TABLE message_reactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT NOT NULL,
    user_id INT NOT NULL,
    reaction VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_reaction (message_id, user_id),
    INDEX idx_message_id (message_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sender_id INT,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    message TEXT,
    related_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_notification_type (notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert Sample Users
INSERT INTO users (username, email, password_hash, status) VALUES
('john_dealer', 'john@example.com', '$2a$10$8OqKnPLEX8N/p5yJ0mK8RuEZ.SqKxvLxLqR6t3Z5K8L4M9N0O1P2Q3', 'online'),
('sarah_thompson', 'sarah@example.com', '$2a$10$8OqKnPLEX8N/p5yJ0mK8RuEZ.SqKxvLxLqR6t3Z5K8L4M9N0O1P2Q3', 'online'),
('michael_chen', 'michael@example.com', '$2a$10$8OqKnPLEX8N/p5yJ0mK8RuEZ.SqKxvLxLqR6t3Z5K8L4M9N0O1P2Q3', 'offline'),
('lisa_rodriguez', 'lisa@example.com', '$2a$10$8OqKnPLEX8N/p5yJ0mK8RuEZ.SqKxvLxLqR6t3Z5K8L4M9N0O1P2Q3', 'online'),
('alex_kim', 'alex@example.com', '$2a$10$8OqKnPLEX8N/p5yJ0mK8RuEZ.SqKxvLxLqR6t3Z5K8L4M9N0O1P2Q3', 'offline');

-- Insert Sample Messages
INSERT INTO messages (sender_id, receiver_id, content, message_type) VALUES
(1, 2, 'Hey! I''m interested in the 2022 Toyota Corolla you have listed. Is it still available?', 'text'),
(2, 1, 'Yes, it''s still available! That''s a fantastic car with only 15,000 miles. What would you like to know about it?', 'text'),
(1, 2, 'Great! Could you tell me about its service history and if there have been any accidents?', 'text'),
(2, 1, 'Clean history, no accidents. Regular maintenance at our dealership. All records are available for review.', 'text'),
(3, 1, 'I saw your listing for the Honda Civic. Can we schedule a test drive?', 'text'),
(1, 3, 'Sure! I have availability this Saturday or Sunday. What time works best for you?', 'text'),
(4, 2, 'Hi Sarah! I''m interested in trading in my current vehicle. Can we discuss options?', 'text'),
(2, 4, 'Of course! I''d be happy to help. Can you tell me more about your current vehicle?', 'text');

-- Insert Sample Friendships
INSERT INTO friendships (user_id, friend_id) VALUES
(1, 2),
(2, 1),
(1, 3),
(3, 1),
(2, 4),
(4, 2);

-- Insert Sample Friend Requests
INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES
(5, 1, 'pending'),
(3, 2, 'pending');

-- Insert Sample Conversations
INSERT INTO conversations (last_message_id) VALUES
(4),
(6),
(8);

-- Insert Sample Conversation Participants
INSERT INTO conversation_participants (conversation_id, user_id) VALUES
(1, 1),
(1, 2),
(2, 1),
(2, 3),
(3, 2),
(3, 4);

-- ============================================
-- VIEWS
-- ============================================

-- View: User Messages with Sender and Receiver Details
CREATE VIEW v_message_details AS
SELECT 
    m.id,
    m.sender_id,
    s.username AS sender_username,
    s.email AS sender_email,
    m.receiver_id,
    r.username AS receiver_username,
    r.email AS receiver_email,
    m.content,
    m.message_type,
    m.is_read,
    m.read_at,
    m.created_at,
    m.updated_at
FROM messages m
JOIN users s ON m.sender_id = s.id
JOIN users r ON m.receiver_id = r.id;

-- View: Friend List
CREATE VIEW v_user_friends AS
SELECT 
    u1.id AS user_id,
    u1.username,
    u2.id AS friend_id,
    u2.username AS friend_username,
    u2.status AS friend_status,
    u2.email AS friend_email,
    f.created_at
FROM friendships f
JOIN users u1 ON f.user_id = u1.id
JOIN users u2 ON f.friend_id = u2.id;

-- View: Unread Messages Count
CREATE VIEW v_unread_messages_count AS
SELECT 
    receiver_id,
    COUNT(*) AS unread_count
FROM messages
WHERE is_read = FALSE
GROUP BY receiver_id;

-- View: Conversation Summary
CREATE VIEW v_conversation_summary AS
SELECT 
    c.id,
    c.last_message_at,
    c.created_at,
    GROUP_CONCAT(cp.user_id SEPARATOR ',') AS participant_ids,
    GROUP_CONCAT(u.username SEPARATOR ', ') AS participant_names,
    COUNT(cp.user_id) AS participant_count
FROM conversations c
LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
LEFT JOIN users u ON cp.user_id = u.id
GROUP BY c.id;

-- View: Pending Friend Requests
CREATE VIEW v_pending_friend_requests AS
SELECT 
    fr.id,
    fr.sender_id,
    s.username AS sender_username,
    s.email AS sender_email,
    fr.receiver_id,
    r.username AS receiver_username,
    r.email AS receiver_email,
    fr.status,
    fr.created_at
FROM friend_requests fr
JOIN users s ON fr.sender_id = s.id
JOIN users r ON fr.receiver_id = r.id
WHERE fr.status = 'pending';

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Procedure: Get Message History Between Two Users
DELIMITER //
CREATE PROCEDURE sp_get_message_history(
    IN p_user1_id INT,
    IN p_user2_id INT,
    IN p_limit INT DEFAULT 50,
    IN p_offset INT DEFAULT 0
)
BEGIN
    SELECT 
        id,
        sender_id,
        receiver_id,
        content,
        message_type,
        attachment_url,
        is_read,
        created_at
    FROM messages
    WHERE (sender_id = p_user1_id AND receiver_id = p_user2_id)
       OR (sender_id = p_user2_id AND receiver_id = p_user1_id)
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END //
DELIMITER ;

-- Procedure: Create New Conversation
DELIMITER //
CREATE PROCEDURE sp_create_conversation(
    IN p_user1_id INT,
    IN p_user2_id INT
)
BEGIN
    DECLARE v_conversation_id INT;
    
    -- Insert conversation
    INSERT INTO conversations (last_message_id, last_message_at) 
    VALUES (NULL, NOW());
    
    SET v_conversation_id = LAST_INSERT_ID();
    
    -- Add participants
    INSERT INTO conversation_participants (conversation_id, user_id) 
    VALUES 
        (v_conversation_id, p_user1_id),
        (v_conversation_id, p_user2_id);
    
    SELECT v_conversation_id AS conversation_id;
END //
DELIMITER ;

-- Procedure: Send Friend Request
DELIMITER //
CREATE PROCEDURE sp_send_friend_request(
    IN p_sender_id INT,
    IN p_receiver_id INT
)
BEGIN
    DECLARE v_existing_request INT;
    DECLARE v_existing_friendship INT;
    
    -- Check if request already exists
    SELECT COUNT(*) INTO v_existing_request
    FROM friend_requests
    WHERE (sender_id = p_sender_id AND receiver_id = p_receiver_id)
       OR (sender_id = p_receiver_id AND receiver_id = p_sender_id)
       AND status = 'pending';
    
    -- Check if already friends
    SELECT COUNT(*) INTO v_existing_friendship
    FROM friendships
    WHERE user_id = p_sender_id AND friend_id = p_receiver_id;
    
    IF v_existing_request > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Friend request already exists';
    ELSEIF v_existing_friendship > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Already friends';
    ELSE
        INSERT INTO friend_requests (sender_id, receiver_id, status)
        VALUES (p_sender_id, p_receiver_id, 'pending');
    END IF;
END //
DELIMITER ;

-- Procedure: Accept Friend Request
DELIMITER //
CREATE PROCEDURE sp_accept_friend_request(
    IN p_request_id INT
)
BEGIN
    DECLARE v_sender_id INT;
    DECLARE v_receiver_id INT;
    
    -- Get sender and receiver IDs
    SELECT sender_id, receiver_id INTO v_sender_id, v_receiver_id
    FROM friend_requests
    WHERE id = p_request_id;
    
    IF v_sender_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Friend request not found';
    ELSE
        -- Update request status
        UPDATE friend_requests
        SET status = 'accepted', responded_at = NOW()
        WHERE id = p_request_id;
        
        -- Create friendships (both directions)
        INSERT INTO friendships (user_id, friend_id) 
        VALUES 
            (v_sender_id, v_receiver_id),
            (v_receiver_id, v_sender_id);
    END IF;
END //
DELIMITER ;

-- Procedure: Get User Unread Messages Count
DELIMITER //
CREATE PROCEDURE sp_get_unread_count(
    IN p_user_id INT
)
BEGIN
    SELECT COUNT(*) AS unread_count
    FROM messages
    WHERE receiver_id = p_user_id AND is_read = FALSE;
END //
DELIMITER ;

-- Procedure: Mark Messages as Read
DELIMITER //
CREATE PROCEDURE sp_mark_messages_read(
    IN p_user_id INT,
    IN p_sender_id INT
)
BEGIN
    UPDATE messages
    SET is_read = TRUE, read_at = NOW()
    WHERE receiver_id = p_user_id 
      AND sender_id = p_sender_id
      AND is_read = FALSE;
END //
DELIMITER ;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Additional indexes for common queries
CREATE INDEX idx_messages_conversation 
ON messages(sender_id, receiver_id, created_at);

CREATE INDEX idx_friend_requests_pending 
ON friend_requests(receiver_id, status, created_at);

CREATE INDEX idx_notifications_unread 
ON notifications(user_id, is_read, created_at);

-- ============================================
-- END OF DATABASE SETUP
-- ============================================
