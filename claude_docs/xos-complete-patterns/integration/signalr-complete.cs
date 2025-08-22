// XOS SignalR Real-time Communication Complete Patterns
// Comprehensive examples for SignalR hubs, client management, and real-time features

using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Collections.Concurrent;
using XOS.Data;
using XOS.Security;

namespace XOS.Patterns.Integration.SignalR
{
    // ============================================================================
    // BASIC SIGNALR HUB PATTERNS
    // ============================================================================

    [Authorize]
    public class NotificationHub : Hub<INotificationClient>
    {
        private readonly ILogger<NotificationHub> _logger;
        private readonly DBService _dbService;
        private static readonly ConcurrentDictionary<string, UserConnection> _connections = new();

        public NotificationHub(ILogger<NotificationHub> logger, DBService dbService)
        {
            _logger = logger;
            _dbService = dbService;
        }

        // ✅ CORRECT: Connection management with tenant isolation
        public override async Task OnConnectedAsync()
        {
            try
            {
                var userId = GetUserId();
                var clientId = GetClientId();
                var connectionId = Context.ConnectionId;

                // Store connection info
                var connection = new UserConnection
                {
                    UserId = userId,
                    ClientId = clientId,
                    ConnectionId = connectionId,
                    ConnectedAt = DateTime.UtcNow
                };

                _connections.TryAdd(connectionId, connection);

                // Join tenant group for multi-tenant isolation
                await Groups.AddToGroupAsync(connectionId, $"tenant_{clientId}");

                // Join user-specific group
                await Groups.AddToGroupAsync(connectionId, $"user_{userId}");

                // Log connection
                await LogConnectionAsync("connected", userId, clientId);

                // Notify user of successful connection
                await Clients.Caller.ConnectionEstablished(new ConnectionInfo
                {
                    ConnectionId = connectionId,
                    ConnectedAt = DateTime.UtcNow,
                    TenantId = clientId
                });

                _logger.LogInformation("User {UserId} from tenant {ClientId} connected with connection {ConnectionId}", 
                    userId, clientId, connectionId);

                await base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during connection for {ConnectionId}", Context.ConnectionId);
                throw;
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            try
            {
                var connectionId = Context.ConnectionId;
                
                if (_connections.TryRemove(connectionId, out var connection))
                {
                    // Remove from all groups
                    await Groups.RemoveFromGroupAsync(connectionId, $"tenant_{connection.ClientId}");
                    await Groups.RemoveFromGroupAsync(connectionId, $"user_{connection.UserId}");

                    // Log disconnection
                    await LogConnectionAsync("disconnected", connection.UserId, connection.ClientId);

                    _logger.LogInformation("User {UserId} from tenant {ClientId} disconnected", 
                        connection.UserId, connection.ClientId);
                }

                await base.OnDisconnectedAsync(exception);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during disconnection for {ConnectionId}", Context.ConnectionId);
            }
        }

        // ✅ CORRECT: Tenant group management
        public async Task JoinTenantGroup()
        {
            var clientId = GetClientId();
            var connectionId = Context.ConnectionId;

            await Groups.AddToGroupAsync(connectionId, $"tenant_{clientId}");
            
            _logger.LogDebug("Connection {ConnectionId} joined tenant group {ClientId}", 
                connectionId, clientId);
        }

        public async Task LeaveTenantGroup()
        {
            var clientId = GetClientId();
            var connectionId = Context.ConnectionId;

            await Groups.RemoveFromGroupAsync(connectionId, $"tenant_{clientId}");
            
            _logger.LogDebug("Connection {ConnectionId} left tenant group {ClientId}", 
                connectionId, clientId);
        }

        // ✅ CORRECT: User presence management
        public async Task UpdatePresence(string status)
        {
            try
            {
                var userId = GetUserId();
                var clientId = GetClientId();

                // Update user presence in database
                await _dbService.ExecuteAsync(@"
                    INSERT INTO user_presence (user_id, client_id, status, last_seen, connection_id)
                    VALUES (@user_id, @client_id, @status, CURRENT_TIMESTAMP, @connection_id)
                    ON CONFLICT (user_id, client_id) 
                    DO UPDATE SET 
                        status = @status, 
                        last_seen = CURRENT_TIMESTAMP,
                        connection_id = @connection_id",
                    new { 
                        user_id = userId, 
                        client_id = clientId, 
                        status = status, 
                        connection_id = Context.ConnectionId 
                    }
                );

                // Notify other users in the same tenant
                await Clients.GroupExcept($"tenant_{clientId}", Context.ConnectionId)
                    .UserPresenceUpdated(new UserPresence
                    {
                        UserId = userId,
                        Status = status,
                        LastSeen = DateTime.UtcNow
                    });

                _logger.LogDebug("User {UserId} updated presence to {Status}", userId, status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update presence for user {UserId}", GetUserId());
                await Clients.Caller.Error("Failed to update presence");
            }
        }

        // Helper methods
        private int GetUserId()
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        private int GetClientId()
        {
            var clientIdClaim = Context.User?.FindFirst("client_id")?.Value;
            return int.TryParse(clientIdClaim, out var clientId) ? clientId : 0;
        }

        private async Task LogConnectionAsync(string action, int userId, int clientId)
        {
            try
            {
                await _dbService.ExecuteAsync(@"
                    INSERT INTO signalr_connection_log (user_id, client_id, connection_id, action, ip_address, user_agent, created_at)
                    VALUES (@user_id, @client_id, @connection_id, @action, @ip_address, @user_agent, CURRENT_TIMESTAMP)",
                    new {
                        user_id = userId,
                        client_id = clientId,
                        connection_id = Context.ConnectionId,
                        action = action,
                        ip_address = Context.GetHttpContext()?.Connection?.RemoteIpAddress?.ToString(),
                        user_agent = Context.GetHttpContext()?.Request?.Headers["User-Agent"].ToString()
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log connection event");
            }
        }
    }

    // ============================================================================
    // ADVANCED SIGNALR PATTERNS
    // ============================================================================

    [Authorize]
    public class ChatHub : Hub<IChatClient>
    {
        private readonly ILogger<ChatHub> _logger;
        private readonly DBService _dbService;
        private readonly IHubContext<NotificationHub, INotificationClient> _notificationHub;

        public ChatHub(
            ILogger<ChatHub> logger, 
            DBService dbService,
            IHubContext<NotificationHub, INotificationClient> notificationHub)
        {
            _logger = logger;
            _dbService = dbService;
            _notificationHub = notificationHub;
        }

        // ✅ CORRECT: Room-based chat with tenant isolation
        public async Task JoinRoom(int roomId)
        {
            try
            {
                var userId = GetUserId();
                var clientId = GetClientId();

                // Verify user has access to the room
                var hasAccess = await _dbService.GetValueAsync<bool>(@"
                    SELECT EXISTS(
                        SELECT 1 FROM chat_rooms cr
                        LEFT JOIN chat_room_members crm ON cr.id = crm.room_id AND crm.user_id = @user_id
                        WHERE cr.id = @room_id 
                          AND cr.client_id = @client_id
                          AND (cr.is_public = true OR crm.user_id IS NOT NULL)
                    )",
                    new { room_id = roomId, user_id = userId, client_id = clientId }
                );

                if (!hasAccess)
                {
                    await Clients.Caller.Error("Access denied to chat room");
                    return;
                }

                // Join the room group
                await Groups.AddToGroupAsync(Context.ConnectionId, $"room_{roomId}");

                // Update user's current room
                await _dbService.ExecuteAsync(@"
                    INSERT INTO user_room_sessions (user_id, room_id, client_id, connection_id, joined_at)
                    VALUES (@user_id, @room_id, @client_id, @connection_id, CURRENT_TIMESTAMP)
                    ON CONFLICT (user_id, client_id) 
                    DO UPDATE SET 
                        room_id = @room_id, 
                        connection_id = @connection_id,
                        joined_at = CURRENT_TIMESTAMP",
                    new { 
                        user_id = userId, 
                        room_id = roomId, 
                        client_id = clientId, 
                        connection_id = Context.ConnectionId 
                    }
                );

                // Get user info
                var user = await _dbService.GetAsync<User>(
                    "SELECT id, name FROM users WHERE id = @id AND client_id = @client_id",
                    new { id = userId, client_id = clientId }
                );

                // Notify other users in the room
                await Clients.GroupExcept($"room_{roomId}", Context.ConnectionId)
                    .UserJoinedRoom(new RoomMember
                    {
                        UserId = userId,
                        UserName = user.Name,
                        JoinedAt = DateTime.UtcNow
                    });

                // Send room info to the joining user
                var roomInfo = await GetRoomInfo(roomId, clientId);
                await Clients.Caller.RoomJoined(roomInfo);

                _logger.LogInformation("User {UserId} joined room {RoomId}", userId, roomId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to join room {RoomId} for user {UserId}", roomId, GetUserId());
                await Clients.Caller.Error("Failed to join room");
            }
        }

        public async Task LeaveRoom(int roomId)
        {
            try
            {
                var userId = GetUserId();

                // Remove from room group
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"room_{roomId}");

                // Update user session
                await _dbService.ExecuteAsync(@"
                    UPDATE user_room_sessions 
                    SET left_at = CURRENT_TIMESTAMP 
                    WHERE user_id = @user_id AND room_id = @room_id",
                    new { user_id = userId, room_id = roomId }
                );

                // Get user info
                var user = await _dbService.GetAsync<User>(
                    "SELECT id, name FROM users WHERE id = @id AND client_id = @client_id",
                    new { id = userId, client_id = GetClientId() }
                );

                // Notify other users in the room
                await Clients.Group($"room_{roomId}")
                    .UserLeftRoom(new RoomMember
                    {
                        UserId = userId,
                        UserName = user.Name,
                        LeftAt = DateTime.UtcNow
                    });

                _logger.LogInformation("User {UserId} left room {RoomId}", userId, roomId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to leave room {RoomId} for user {UserId}", roomId, GetUserId());
            }
        }

        // ✅ CORRECT: Message handling with validation and persistence
        public async Task SendMessage(int roomId, string message, string messageType = "text")
        {
            try
            {
                var userId = GetUserId();
                var clientId = GetClientId();

                // Validate message
                if (string.IsNullOrWhiteSpace(message) || message.Length > 1000)
                {
                    await Clients.Caller.Error("Message is invalid or too long");
                    return;
                }

                // Verify user is in the room
                var isInRoom = await _dbService.GetValueAsync<bool>(@"
                    SELECT EXISTS(
                        SELECT 1 FROM user_room_sessions urs
                        JOIN chat_rooms cr ON urs.room_id = cr.id
                        WHERE urs.user_id = @user_id 
                          AND urs.room_id = @room_id 
                          AND cr.client_id = @client_id
                          AND urs.left_at IS NULL
                    )",
                    new { user_id = userId, room_id = roomId, client_id = clientId }
                );

                if (!isInRoom)
                {
                    await Clients.Caller.Error("You are not in this room");
                    return;
                }

                // Save message to database
                var messageId = await _dbService.GetValueAsync<int>(@"
                    INSERT INTO chat_messages (room_id, user_id, message, message_type, client_id, created_at)
                    VALUES (@room_id, @user_id, @message, @message_type, @client_id, CURRENT_TIMESTAMP)
                    RETURNING id",
                    new { 
                        room_id = roomId, 
                        user_id = userId, 
                        message = message, 
                        message_type = messageType, 
                        client_id = clientId 
                    }
                );

                // Get user info
                var user = await _dbService.GetAsync<User>(
                    "SELECT id, name FROM users WHERE id = @id AND client_id = @client_id",
                    new { id = userId, client_id = clientId }
                );

                // Create message object
                var chatMessage = new ChatMessage
                {
                    Id = messageId,
                    RoomId = roomId,
                    UserId = userId,
                    UserName = user.Name,
                    Message = message,
                    MessageType = messageType,
                    SentAt = DateTime.UtcNow
                };

                // Send to all users in the room
                await Clients.Group($"room_{roomId}").MessageReceived(chatMessage);

                // Update room's last activity
                await _dbService.ExecuteAsync(@"
                    UPDATE chat_rooms 
                    SET last_message_at = CURRENT_TIMESTAMP, last_message_by = @user_id
                    WHERE id = @room_id AND client_id = @client_id",
                    new { room_id = roomId, user_id = userId, client_id = clientId }
                );

                _logger.LogDebug("Message {MessageId} sent by user {UserId} in room {RoomId}", 
                    messageId, userId, roomId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send message in room {RoomId} for user {UserId}", roomId, GetUserId());
                await Clients.Caller.Error("Failed to send message");
            }
        }

        // ✅ CORRECT: Typing indicators with throttling
        private readonly ConcurrentDictionary<string, DateTime> _lastTypingNotification = new();

        public async Task StartTyping(int roomId)
        {
            try
            {
                var userId = GetUserId();
                var key = $"{userId}_{roomId}";
                var now = DateTime.UtcNow;

                // Throttle typing notifications (max one per 3 seconds)
                if (_lastTypingNotification.TryGetValue(key, out var lastNotification) && 
                    now.Subtract(lastNotification).TotalSeconds < 3)
                {
                    return;
                }

                _lastTypingNotification.AddOrUpdate(key, now, (k, v) => now);

                // Get user info
                var user = await _dbService.GetAsync<User>(
                    "SELECT id, name FROM users WHERE id = @id AND client_id = @client_id",
                    new { id = userId, client_id = GetClientId() }
                );

                // Notify other users in the room
                await Clients.GroupExcept($"room_{roomId}", Context.ConnectionId)
                    .UserStartedTyping(new TypingIndicator
                    {
                        UserId = userId,
                        UserName = user.Name,
                        RoomId = roomId,
                        StartedAt = now
                    });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send typing indicator for user {UserId} in room {RoomId}", 
                    GetUserId(), roomId);
            }
        }

        public async Task StopTyping(int roomId)
        {
            try
            {
                var userId = GetUserId();

                // Get user info
                var user = await _dbService.GetAsync<User>(
                    "SELECT id, name FROM users WHERE id = @id AND client_id = @client_id",
                    new { id = userId, client_id = GetClientId() }
                );

                // Notify other users in the room
                await Clients.GroupExcept($"room_{roomId}", Context.ConnectionId)
                    .UserStoppedTyping(new TypingIndicator
                    {
                        UserId = userId,
                        UserName = user.Name,
                        RoomId = roomId,
                        StoppedAt = DateTime.UtcNow
                    });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send stop typing indicator for user {UserId} in room {RoomId}", 
                    GetUserId(), roomId);
            }
        }

        private async Task<RoomInfo> GetRoomInfo(int roomId, int clientId)
        {
            var room = await _dbService.GetAsync<ChatRoom>(
                "SELECT * FROM chat_rooms WHERE id = @id AND client_id = @client_id",
                new { id = roomId, client_id = clientId }
            );

            var members = await _dbService.GetListAsync<RoomMember>(@"
                SELECT u.id as UserId, u.name as UserName, crm.joined_at as JoinedAt
                FROM chat_room_members crm
                JOIN users u ON crm.user_id = u.id AND u.client_id = @client_id
                WHERE crm.room_id = @room_id
                ORDER BY crm.joined_at",
                new { room_id = roomId, client_id = clientId }
            );

            return new RoomInfo
            {
                Id = room.Id,
                Name = room.Name,
                Description = room.Description,
                IsPublic = room.IsPublic,
                Members = members.ToList(),
                CreatedAt = room.CreatedAt,
                LastMessageAt = room.LastMessageAt
            };
        }

        private int GetUserId()
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        private int GetClientId()
        {
            var clientIdClaim = Context.User?.FindFirst("client_id")?.Value;
            return int.TryParse(clientIdClaim, out var clientId) ? clientId : 0;
        }
    }

    // ============================================================================
    // SIGNALR SERVICE PATTERNS
    // ============================================================================

    public interface ISignalRService
    {
        Task SendToUserAsync(int userId, int clientId, string method, object data);
        Task SendToTenantAsync(int clientId, string method, object data);
        Task SendToRoomAsync(int roomId, string method, object data);
        Task NotifyUserCreated(User user);
        Task NotifyUserUpdated(User user);
        Task NotifyUserDeleted(int userId, int clientId);
    }

    public class SignalRService : ISignalRService
    {
        private readonly IHubContext<NotificationHub, INotificationClient> _notificationHub;
        private readonly IHubContext<ChatHub, IChatClient> _chatHub;
        private readonly ILogger<SignalRService> _logger;

        public SignalRService(
            IHubContext<NotificationHub, INotificationClient> notificationHub,
            IHubContext<ChatHub, IChatClient> chatHub,
            ILogger<SignalRService> logger)
        {
            _notificationHub = notificationHub;
            _chatHub = chatHub;
            _logger = logger;
        }

        // ✅ CORRECT: Send message to specific user
        public async Task SendToUserAsync(int userId, int clientId, string method, object data)
        {
            try
            {
                await _notificationHub.Clients.Group($"user_{userId}")
                    .SendCoreAsync(method, new[] { data });

                _logger.LogDebug("Sent {Method} to user {UserId} in tenant {ClientId}", method, userId, clientId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send {Method} to user {UserId}", method, userId);
            }
        }

        // ✅ CORRECT: Send message to all users in tenant
        public async Task SendToTenantAsync(int clientId, string method, object data)
        {
            try
            {
                await _notificationHub.Clients.Group($"tenant_{clientId}")
                    .SendCoreAsync(method, new[] { data });

                _logger.LogDebug("Sent {Method} to tenant {ClientId}", method, clientId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send {Method} to tenant {ClientId}", method, clientId);
            }
        }

        // ✅ CORRECT: Send message to specific chat room
        public async Task SendToRoomAsync(int roomId, string method, object data)
        {
            try
            {
                await _chatHub.Clients.Group($"room_{roomId}")
                    .SendCoreAsync(method, new[] { data });

                _logger.LogDebug("Sent {Method} to room {RoomId}", method, roomId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send {Method} to room {RoomId}", method, roomId);
            }
        }

        // ✅ CORRECT: Domain-specific notification methods
        public async Task NotifyUserCreated(User user)
        {
            var userDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                CreatedAt = user.CreatedAt
            };

            await SendToTenantAsync(user.ClientId, "UserCreated", userDto);
        }

        public async Task NotifyUserUpdated(User user)
        {
            var userDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };

            await SendToTenantAsync(user.ClientId, "UserUpdated", userDto);
        }

        public async Task NotifyUserDeleted(int userId, int clientId)
        {
            await SendToTenantAsync(clientId, "UserDeleted", new { UserId = userId });
        }
    }

    // ============================================================================
    // CLIENT INTERFACES
    // ============================================================================

    public interface INotificationClient
    {
        Task ConnectionEstablished(ConnectionInfo connectionInfo);
        Task UserPresenceUpdated(UserPresence presence);
        Task UserCreated(UserDto user);
        Task UserUpdated(UserDto user);
        Task UserDeleted(object data);
        Task SystemNotification(SystemNotification notification);
        Task Error(string message);
    }

    public interface IChatClient
    {
        Task RoomJoined(RoomInfo roomInfo);
        Task UserJoinedRoom(RoomMember member);
        Task UserLeftRoom(RoomMember member);
        Task MessageReceived(ChatMessage message);
        Task UserStartedTyping(TypingIndicator indicator);
        Task UserStoppedTyping(TypingIndicator indicator);
        Task Error(string message);
    }

    // ============================================================================
    // EDGE CASE PATTERNS
    // ============================================================================

    public class SignalRConnectionManager
    {
        private readonly ConcurrentDictionary<string, UserConnection> _connections = new();
        private readonly ILogger<SignalRConnectionManager> _logger;
        private readonly DBService _dbService;

        public SignalRConnectionManager(ILogger<SignalRConnectionManager> logger, DBService dbService)
        {
            _logger = logger;
            _dbService = dbService;
        }

        // ✅ CORRECT: Handle connection cleanup
        public async Task CleanupStaleConnections()
        {
            try
            {
                var staleConnections = _connections.Values
                    .Where(c => DateTime.UtcNow.Subtract(c.LastActivity) > TimeSpan.FromMinutes(30))
                    .ToList();

                foreach (var connection in staleConnections)
                {
                    _connections.TryRemove(connection.ConnectionId, out _);
                    
                    // Clean up database records
                    await _dbService.ExecuteAsync(@"
                        UPDATE user_presence 
                        SET status = 'offline', last_seen = CURRENT_TIMESTAMP
                        WHERE connection_id = @connection_id",
                        new { connection_id = connection.ConnectionId }
                    );

                    await _dbService.ExecuteAsync(@"
                        UPDATE user_room_sessions 
                        SET left_at = CURRENT_TIMESTAMP
                        WHERE connection_id = @connection_id AND left_at IS NULL",
                        new { connection_id = connection.ConnectionId }
                    );
                }

                _logger.LogInformation("Cleaned up {Count} stale connections", staleConnections.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to cleanup stale connections");
            }
        }

        // ✅ CORRECT: Handle reconnection logic
        public async Task<bool> HandleReconnection(string oldConnectionId, string newConnectionId, int userId, int clientId)
        {
            try
            {
                // Remove old connection
                _connections.TryRemove(oldConnectionId, out var oldConnection);

                // Add new connection
                var newConnection = new UserConnection
                {
                    UserId = userId,
                    ClientId = clientId,
                    ConnectionId = newConnectionId,
                    ConnectedAt = DateTime.UtcNow,
                    LastActivity = DateTime.UtcNow
                };

                _connections.TryAdd(newConnectionId, newConnection);

                // Update database records
                await _dbService.ExecuteAsync(@"
                    UPDATE user_presence 
                    SET connection_id = @new_connection_id, last_seen = CURRENT_TIMESTAMP
                    WHERE connection_id = @old_connection_id",
                    new { old_connection_id = oldConnectionId, new_connection_id = newConnectionId }
                );

                await _dbService.ExecuteAsync(@"
                    UPDATE user_room_sessions 
                    SET connection_id = @new_connection_id
                    WHERE connection_id = @old_connection_id AND left_at IS NULL",
                    new { old_connection_id = oldConnectionId, new_connection_id = newConnectionId }
                );

                _logger.LogInformation("Handled reconnection for user {UserId}: {OldConnectionId} -> {NewConnectionId}", 
                    userId, oldConnectionId, newConnectionId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to handle reconnection for user {UserId}", userId);
                return false;
            }
        }
    }

    // ============================================================================
    // COMPLETE EXAMPLES
    // ============================================================================

    // ✅ COMPLETE EXAMPLE: Document collaboration hub
    [Authorize]
    public class DocumentCollaborationHub : Hub<IDocumentCollaborationClient>
    {
        private readonly ILogger<DocumentCollaborationHub> _logger;
        private readonly DBService _dbService;
        private readonly ConcurrentDictionary<string, DocumentSession> _documentSessions = new();

        public DocumentCollaborationHub(ILogger<DocumentCollaborationHub> logger, DBService dbService)
        {
            _logger = logger;
            _dbService = dbService;
        }

        public async Task JoinDocument(int documentId)
        {
            try
            {
                var userId = GetUserId();
                var clientId = GetClientId();

                // Verify access to document
                var hasAccess = await _dbService.GetValueAsync<bool>(@"
                    SELECT EXISTS(
                        SELECT 1 FROM documents d
                        LEFT JOIN document_permissions dp ON d.id = dp.document_id AND dp.user_id = @user_id
                        WHERE d.id = @document_id 
                          AND d.client_id = @client_id
                          AND (d.is_public = true OR dp.user_id IS NOT NULL OR d.created_by = @user_id)
                    )",
                    new { document_id = documentId, user_id = userId, client_id = clientId }
                );

                if (!hasAccess)
                {
                    await Clients.Caller.Error("Access denied to document");
                    return;
                }

                // Join document group
                await Groups.AddToGroupAsync(Context.ConnectionId, $"document_{documentId}");

                // Track document session
                var sessionKey = $"{userId}_{documentId}";
                var session = new DocumentSession
                {
                    UserId = userId,
                    DocumentId = documentId,
                    ConnectionId = Context.ConnectionId,
                    JoinedAt = DateTime.UtcNow
                };

                _documentSessions.AddOrUpdate(sessionKey, session, (k, v) => session);

                // Save session to database
                await _dbService.ExecuteAsync(@"
                    INSERT INTO document_sessions (user_id, document_id, client_id, connection_id, joined_at)
                    VALUES (@user_id, @document_id, @client_id, @connection_id, CURRENT_TIMESTAMP)
                    ON CONFLICT (user_id, document_id) 
                    DO UPDATE SET 
                        connection_id = @connection_id,
                        joined_at = CURRENT_TIMESTAMP,
                        left_at = NULL",
                    new { 
                        user_id = userId, 
                        document_id = documentId, 
                        client_id = clientId, 
                        connection_id = Context.ConnectionId 
                    }
                );

                // Get user info
                var user = await _dbService.GetAsync<User>(
                    "SELECT id, name FROM users WHERE id = @id AND client_id = @client_id",
                    new { id = userId, client_id = clientId }
                );

                // Notify other collaborators
                await Clients.GroupExcept($"document_{documentId}", Context.ConnectionId)
                    .UserJoinedDocument(new DocumentCollaborator
                    {
                        UserId = userId,
                        UserName = user.Name,
                        JoinedAt = DateTime.UtcNow
                    });

                // Send current collaborators to the joining user
                var currentCollaborators = await GetDocumentCollaborators(documentId, clientId);
                await Clients.Caller.DocumentJoined(new DocumentInfo
                {
                    DocumentId = documentId,
                    Collaborators = currentCollaborators
                });

                _logger.LogInformation("User {UserId} joined document {DocumentId}", userId, documentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to join document {DocumentId} for user {UserId}", documentId, GetUserId());
                await Clients.Caller.Error("Failed to join document");
            }
        }

        public async Task SendTextOperation(int documentId, TextOperation operation)
        {
            try
            {
                var userId = GetUserId();
                var clientId = GetClientId();

                // Validate operation
                if (operation == null || string.IsNullOrEmpty(operation.Type))
                {
                    await Clients.Caller.Error("Invalid operation");
                    return;
                }

                // Save operation to database for conflict resolution
                var operationId = await _dbService.GetValueAsync<int>(@"
                    INSERT INTO document_operations (
                        document_id, user_id, client_id, operation_type, operation_data, 
                        position, length, content, version, created_at
                    ) VALUES (
                        @document_id, @user_id, @client_id, @operation_type, @operation_data,
                        @position, @length, @content, @version, CURRENT_TIMESTAMP
                    ) RETURNING id",
                    new {
                        document_id = documentId,
                        user_id = userId,
                        client_id = clientId,
                        operation_type = operation.Type,
                        operation_data = JsonSerializer.Serialize(operation),
                        position = operation.Position,
                        length = operation.Length,
                        content = operation.Content,
                        version = operation.Version
                    }
                );

                operation.Id = operationId;
                operation.UserId = userId;
                operation.Timestamp = DateTime.UtcNow;

                // Send operation to other collaborators
                await Clients.GroupExcept($"document_{documentId}", Context.ConnectionId)
                    .TextOperationReceived(operation);

                // Update document version
                await _dbService.ExecuteAsync(@"
                    UPDATE documents 
                    SET version = version + 1, updated_at = CURRENT_TIMESTAMP, updated_by = @user_id
                    WHERE id = @document_id AND client_id = @client_id",
                    new { document_id = documentId, user_id = userId, client_id = clientId }
                );

                _logger.LogDebug("Text operation {OperationId} sent for document {DocumentId} by user {UserId}", 
                    operationId, documentId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send text operation for document {DocumentId} by user {UserId}", 
                    documentId, GetUserId());
                await Clients.Caller.Error("Failed to send operation");
            }
        }

        public async Task SendCursorPosition(int documentId, CursorPosition cursor)
        {
            try
            {
                var userId = GetUserId();

                cursor.UserId = userId;
                cursor.Timestamp = DateTime.UtcNow;

                // Send cursor position to other collaborators
                await Clients.GroupExcept($"document_{documentId}", Context.ConnectionId)
                    .CursorPositionUpdated(cursor);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send cursor position for document {DocumentId} by user {UserId}", 
                    documentId, GetUserId());
            }
        }

        private async Task<List<DocumentCollaborator>> GetDocumentCollaborators(int documentId, int clientId)
        {
            return await _dbService.GetListAsync<DocumentCollaborator>(@"
                SELECT u.id as UserId, u.name as UserName, ds.joined_at as JoinedAt
                FROM document_sessions ds
                JOIN users u ON ds.user_id = u.id AND u.client_id = @client_id
                WHERE ds.document_id = @document_id AND ds.left_at IS NULL
                ORDER BY ds.joined_at",
                new { document_id = documentId, client_id = clientId }
            );
        }

        private int GetUserId()
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        private int GetClientId()
        {
            var clientIdClaim = Context.User?.FindFirst("client_id")?.Value;
            return int.TryParse(clientIdClaim, out var clientId) ? clientId : 0;
        }
    }

    // Supporting classes and interfaces
    public interface IDocumentCollaborationClient
    {
        Task DocumentJoined(DocumentInfo documentInfo);
        Task UserJoinedDocument(DocumentCollaborator collaborator);
        Task UserLeftDocument(DocumentCollaborator collaborator);
        Task TextOperationReceived(TextOperation operation);
        Task CursorPositionUpdated(CursorPosition cursor);
        Task Error(string message);
    }

    // Data models
    public class UserConnection
    {
        public int UserId { get; set; }
        public int ClientId { get; set; }
        public string ConnectionId { get; set; }
        public DateTime ConnectedAt { get; set; }
        public DateTime LastActivity { get; set; }
    }

    public class ConnectionInfo
    {
        public string ConnectionId { get; set; }
        public DateTime ConnectedAt { get; set; }
        public int TenantId { get; set; }
    }

    public class UserPresence
    {
        public int UserId { get; set; }
        public string Status { get; set; }
        public DateTime LastSeen { get; set; }
    }

    public class ChatMessage
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string Message { get; set; }
        public string MessageType { get; set; }
        public DateTime SentAt { get; set; }
    }

    public class TypingIndicator
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public int RoomId { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? StoppedAt { get; set; }
    }

    public class RoomInfo
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsPublic { get; set; }
        public List<RoomMember> Members { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastMessageAt { get; set; }
    }

    public class RoomMember
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public DateTime? JoinedAt { get; set; }
        public DateTime? LeftAt { get; set; }
    }

    public class DocumentSession
    {
        public int UserId { get; set; }
        public int DocumentId { get; set; }
        public string ConnectionId { get; set; }
        public DateTime JoinedAt { get; set; }
    }

    public class DocumentInfo
    {
        public int DocumentId { get; set; }
        public List<DocumentCollaborator> Collaborators { get; set; }
    }

    public class DocumentCollaborator
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public DateTime JoinedAt { get; set; }
    }

    public class TextOperation
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Type { get; set; } // "insert", "delete", "retain"
        public int Position { get; set; }
        public int Length { get; set; }
        public string Content { get; set; }
        public int Version { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class CursorPosition
    {
        public int UserId { get; set; }
        public int Position { get; set; }
        public int? SelectionStart { get; set; }
        public int? SelectionEnd { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class SystemNotification
    {
        public string Type { get; set; }
        public string Message { get; set; }
        public object Data { get; set; }
        public DateTime Timestamp { get; set; }
    }
}