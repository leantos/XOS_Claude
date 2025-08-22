// XOS Transaction Management Complete Patterns
// Comprehensive examples for database transactions in XOS framework

using XOS.Data;
using System.Data;
using System.Data.Common;
using Microsoft.Data.SqlClient;
using Npgsql;

namespace XOS.Patterns.Database.Transactions
{
    // ============================================================================
    // BASIC TRANSACTION PATTERNS
    // ============================================================================

    public class BasicTransactionService : XOSServiceBase
    {
        // ✅ CORRECT: Simple transaction with using statement
        public async Task<bool> CreateUserWithProfile(CreateUserRequest request)
        {
            using var transaction = await DBService.BeginTransactionAsync();
            try
            {
                // Insert user
                var userId = await DBService.GetValueAsync<int>(
                    "INSERT INTO users (email, name, client_id) VALUES (@email, @name, @client_id) RETURNING id",
                    new { email = request.Email, name = request.Name, client_id = ClientId },
                    transaction: transaction
                );

                // Insert profile
                await DBService.ExecuteAsync(
                    "INSERT INTO user_profiles (user_id, bio, avatar_url, client_id) VALUES (@user_id, @bio, @avatar_url, @client_id)",
                    new { user_id = userId, bio = request.Bio, avatar_url = request.AvatarUrl, client_id = ClientId },
                    transaction: transaction
                );

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ❌ WRONG: Not using transaction for related operations
        public async Task<bool> CreateUserWithProfile_Wrong(CreateUserRequest request)
        {
            // This can leave orphaned data if second operation fails
            var userId = await DBService.GetValueAsync<int>(
                "INSERT INTO users (email, name, client_id) VALUES (@email, @name, @client_id) RETURNING id",
                new { email = request.Email, name = request.Name, client_id = ClientId }
            );

            await DBService.ExecuteAsync(
                "INSERT INTO user_profiles (user_id, bio, avatar_url, client_id) VALUES (@user_id, @bio, @avatar_url, @client_id)",
                new { user_id = userId, bio = request.Bio, avatar_url = request.AvatarUrl, client_id = ClientId }
            );

            return true;
        }

        // ✅ CORRECT: Manual transaction management
        public async Task<bool> CreateUserWithProfileManual(CreateUserRequest request)
        {
            IDbTransaction transaction = null;
            try
            {
                transaction = await DBService.BeginTransactionAsync();

                var userId = await DBService.GetValueAsync<int>(
                    "INSERT INTO users (email, name, client_id) VALUES (@email, @name, @client_id) RETURNING id",
                    new { email = request.Email, name = request.Name, client_id = ClientId },
                    transaction: transaction
                );

                await DBService.ExecuteAsync(
                    "INSERT INTO user_profiles (user_id, bio, avatar_url, client_id) VALUES (@user_id, @bio, @avatar_url, @client_id)",
                    new { user_id = userId, bio = request.Bio, avatar_url = request.AvatarUrl, client_id = ClientId },
                    transaction: transaction
                );

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                transaction?.Rollback();
                throw;
            }
            finally
            {
                transaction?.Dispose();
            }
        }
    }

    // ============================================================================
    // ADVANCED TRANSACTION PATTERNS
    // ============================================================================

    public class AdvancedTransactionService : XOSServiceBase
    {
        // ✅ CORRECT: Nested transactions with savepoints
        public async Task<bool> ProcessOrderWithSavepoints(ProcessOrderRequest request)
        {
            using var transaction = await DBService.BeginTransactionAsync();
            try
            {
                // Create order
                var orderId = await DBService.GetValueAsync<int>(
                    "INSERT INTO orders (customer_id, total_amount, client_id) VALUES (@customer_id, @total_amount, @client_id) RETURNING id",
                    new { customer_id = request.CustomerId, total_amount = request.TotalAmount, client_id = ClientId },
                    transaction: transaction
                );

                // Create savepoint before inventory operations
                await DBService.ExecuteAsync("SAVEPOINT inventory_checkpoint", transaction: transaction);

                try
                {
                    // Process each item
                    foreach (var item in request.Items)
                    {
                        // Check inventory
                        var currentStock = await DBService.GetValueAsync<int>(
                            "SELECT quantity FROM inventory WHERE product_id = @product_id AND client_id = @client_id FOR UPDATE",
                            new { product_id = item.ProductId, client_id = ClientId },
                            transaction: transaction
                        );

                        if (currentStock < item.Quantity)
                        {
                            throw new InsufficientInventoryException($"Not enough stock for product {item.ProductId}");
                        }

                        // Update inventory
                        await DBService.ExecuteAsync(
                            "UPDATE inventory SET quantity = quantity - @quantity WHERE product_id = @product_id AND client_id = @client_id",
                            new { quantity = item.Quantity, product_id = item.ProductId, client_id = ClientId },
                            transaction: transaction
                        );

                        // Add order item
                        await DBService.ExecuteAsync(
                            "INSERT INTO order_items (order_id, product_id, quantity, price, client_id) VALUES (@order_id, @product_id, @quantity, @price, @client_id)",
                            new { order_id = orderId, product_id = item.ProductId, quantity = item.Quantity, price = item.Price, client_id = ClientId },
                            transaction: transaction
                        );
                    }

                    // Release savepoint
                    await DBService.ExecuteAsync("RELEASE SAVEPOINT inventory_checkpoint", transaction: transaction);
                }
                catch (InsufficientInventoryException)
                {
                    // Rollback to savepoint
                    await DBService.ExecuteAsync("ROLLBACK TO SAVEPOINT inventory_checkpoint", transaction: transaction);
                    
                    // Mark order as failed
                    await DBService.ExecuteAsync(
                        "UPDATE orders SET status = 'failed', failure_reason = 'insufficient_inventory' WHERE id = @id AND client_id = @client_id",
                        new { id = orderId, client_id = ClientId },
                        transaction: transaction
                    );
                }

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ✅ CORRECT: Distributed transaction pattern
        public async Task<bool> ProcessPaymentAndOrder(PaymentOrderRequest request)
        {
            using var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
            try
            {
                // Process payment (external service)
                var paymentResult = await ProcessPaymentAsync(request.PaymentDetails);
                if (!paymentResult.Success)
                {
                    throw new PaymentFailedException(paymentResult.ErrorMessage);
                }

                // Create order in database
                using var dbTransaction = await DBService.BeginTransactionAsync();
                try
                {
                    var orderId = await DBService.GetValueAsync<int>(
                        "INSERT INTO orders (customer_id, payment_id, amount, client_id) VALUES (@customer_id, @payment_id, @amount, @client_id) RETURNING id",
                        new { 
                            customer_id = request.CustomerId, 
                            payment_id = paymentResult.PaymentId, 
                            amount = request.Amount, 
                            client_id = ClientId 
                        },
                        transaction: dbTransaction
                    );

                    await dbTransaction.CommitAsync();
                }
                catch
                {
                    await dbTransaction.RollbackAsync();
                    throw;
                }

                scope.Complete();
                return true;
            }
            catch
            {
                // TransactionScope will automatically rollback
                throw;
            }
        }

        // ✅ CORRECT: Bulk operations within transaction
        public async Task<bool> BulkUpdateInventory(List<InventoryUpdate> updates)
        {
            using var transaction = await DBService.BeginTransactionAsync();
            try
            {
                // Create temporary table
                await DBService.ExecuteAsync(@"
                    CREATE TEMP TABLE inventory_updates (
                        product_id INT,
                        quantity_change INT,
                        reason VARCHAR(100)
                    ) ON COMMIT DROP", transaction: transaction);

                // Bulk insert updates
                var bulkData = updates.Select(u => new { 
                    product_id = u.ProductId, 
                    quantity_change = u.QuantityChange, 
                    reason = u.Reason 
                }).ToArray();

                await DBService.BulkInsertAsync("inventory_updates", bulkData, transaction);

                // Apply updates with validation
                await DBService.ExecuteAsync(@"
                    UPDATE inventory 
                    SET quantity = inventory.quantity + iu.quantity_change,
                        last_updated = CURRENT_TIMESTAMP
                    FROM inventory_updates iu
                    WHERE inventory.product_id = iu.product_id 
                      AND inventory.client_id = @client_id
                      AND (inventory.quantity + iu.quantity_change) >= 0",
                    new { client_id = ClientId },
                    transaction: transaction
                );

                // Log inventory changes
                await DBService.ExecuteAsync(@"
                    INSERT INTO inventory_log (product_id, quantity_change, reason, client_id, created_at)
                    SELECT product_id, quantity_change, reason, @client_id, CURRENT_TIMESTAMP
                    FROM inventory_updates",
                    new { client_id = ClientId },
                    transaction: transaction
                );

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

    // ============================================================================
    // EDGE CASE PATTERNS
    // ============================================================================

    public class TransactionEdgeCaseService : XOSServiceBase
    {
        // ✅ CORRECT: Handling deadlock retries
        public async Task<bool> TransferFundsWithRetry(int fromAccountId, int toAccountId, decimal amount)
        {
            const int maxRetries = 3;
            var retryCount = 0;

            while (retryCount < maxRetries)
            {
                try
                {
                    using var transaction = await DBService.BeginTransactionAsync(IsolationLevel.Serializable);
                    
                    // Always lock accounts in same order to prevent deadlocks
                    var accountIds = new[] { fromAccountId, toAccountId }.OrderBy(x => x).ToArray();
                    
                    // Lock accounts
                    foreach (var accountId in accountIds)
                    {
                        await DBService.ExecuteAsync(
                            "SELECT id FROM accounts WHERE id = @id AND client_id = @client_id FOR UPDATE",
                            new { id = accountId, client_id = ClientId },
                            transaction: transaction
                        );
                    }

                    // Check balance
                    var fromBalance = await DBService.GetValueAsync<decimal>(
                        "SELECT balance FROM accounts WHERE id = @id AND client_id = @client_id",
                        new { id = fromAccountId, client_id = ClientId },
                        transaction: transaction
                    );

                    if (fromBalance < amount)
                    {
                        throw new InsufficientFundsException();
                    }

                    // Perform transfer
                    await DBService.ExecuteAsync(
                        "UPDATE accounts SET balance = balance - @amount WHERE id = @id AND client_id = @client_id",
                        new { amount, id = fromAccountId, client_id = ClientId },
                        transaction: transaction
                    );

                    await DBService.ExecuteAsync(
                        "UPDATE accounts SET balance = balance + @amount WHERE id = @id AND client_id = @client_id",
                        new { amount, id = toAccountId, client_id = ClientId },
                        transaction: transaction
                    );

                    // Log transaction
                    await DBService.ExecuteAsync(@"
                        INSERT INTO account_transactions (from_account_id, to_account_id, amount, client_id, created_at)
                        VALUES (@from_account_id, @to_account_id, @amount, @client_id, CURRENT_TIMESTAMP)",
                        new { from_account_id = fromAccountId, to_account_id = toAccountId, amount, client_id = ClientId },
                        transaction: transaction
                    );

                    await transaction.CommitAsync();
                    return true;
                }
                catch (Exception ex) when (IsDeadlockException(ex))
                {
                    retryCount++;
                    if (retryCount >= maxRetries)
                        throw;

                    // Exponential backoff
                    await Task.Delay(TimeSpan.FromMilliseconds(100 * Math.Pow(2, retryCount)));
                }
            }

            return false;
        }

        // ✅ CORRECT: Long-running transaction with timeout
        public async Task<bool> ProcessLargeDataSet(List<DataRecord> records)
        {
            using var cts = new CancellationTokenSource(TimeSpan.FromMinutes(30));
            using var transaction = await DBService.BeginTransactionAsync();
            
            try
            {
                var batchSize = 1000;
                var processed = 0;

                for (int i = 0; i < records.Count; i += batchSize)
                {
                    cts.Token.ThrowIfCancellationRequested();

                    var batch = records.Skip(i).Take(batchSize).ToList();
                    
                    await ProcessBatch(batch, transaction, cts.Token);
                    processed += batch.Count;

                    // Update progress
                    await DBService.ExecuteAsync(
                        "UPDATE processing_jobs SET progress = @progress WHERE id = @job_id AND client_id = @client_id",
                        new { progress = (double)processed / records.Count, job_id = CurrentJobId, client_id = ClientId },
                        transaction: transaction
                    );
                }

                await transaction.CommitAsync();
                return true;
            }
            catch (OperationCanceledException)
            {
                await transaction.RollbackAsync();
                throw new TimeoutException("Processing exceeded time limit");
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ✅ CORRECT: Handling constraint violations gracefully
        public async Task<bool> UpsertUserData(UserDataRecord record)
        {
            using var transaction = await DBService.BeginTransactionAsync();
            try
            {
                // Try insert first
                try
                {
                    await DBService.ExecuteAsync(@"
                        INSERT INTO user_data (user_id, data_key, data_value, client_id, created_at, updated_at)
                        VALUES (@user_id, @data_key, @data_value, @client_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                        new { 
                            user_id = record.UserId, 
                            data_key = record.DataKey, 
                            data_value = record.DataValue, 
                            client_id = ClientId 
                        },
                        transaction: transaction
                    );
                }
                catch (Exception ex) when (IsUniqueConstraintViolation(ex))
                {
                    // Record exists, update instead
                    await DBService.ExecuteAsync(@"
                        UPDATE user_data 
                        SET data_value = @data_value, updated_at = CURRENT_TIMESTAMP
                        WHERE user_id = @user_id AND data_key = @data_key AND client_id = @client_id",
                        new { 
                            data_value = record.DataValue, 
                            user_id = record.UserId, 
                            data_key = record.DataKey, 
                            client_id = ClientId 
                        },
                        transaction: transaction
                    );
                }

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ⚠️ CRITICAL: Transaction isolation level handling
        public async Task<bool> HandleConcurrentReads(int resourceId)
        {
            // Read Committed - Default level
            using var transaction1 = await DBService.BeginTransactionAsync(IsolationLevel.ReadCommitted);
            
            // Repeatable Read - Prevents phantom reads
            using var transaction2 = await DBService.BeginTransactionAsync(IsolationLevel.RepeatableRead);
            
            // Serializable - Highest isolation
            using var transaction3 = await DBService.BeginTransactionAsync(IsolationLevel.Serializable);

            try
            {
                // Different behavior based on isolation level
                var data1 = await DBService.GetValueAsync<string>(
                    "SELECT data FROM resources WHERE id = @id AND client_id = @client_id",
                    new { id = resourceId, client_id = ClientId },
                    transaction: transaction1
                );

                var data2 = await DBService.GetValueAsync<string>(
                    "SELECT data FROM resources WHERE id = @id AND client_id = @client_id",
                    new { id = resourceId, client_id = ClientId },
                    transaction: transaction2
                );

                var data3 = await DBService.GetValueAsync<string>(
                    "SELECT data FROM resources WHERE id = @id AND client_id = @client_id",
                    new { id = resourceId, client_id = ClientId },
                    transaction: transaction3
                );

                // Process based on consistency requirements
                return await ProcessWithIsolationLevel(data1, data2, data3);
            }
            finally
            {
                await transaction1.CommitAsync();
                await transaction2.CommitAsync();
                await transaction3.CommitAsync();
            }
        }
    }

    // ============================================================================
    // ERROR HANDLING PATTERNS
    // ============================================================================

    public class TransactionErrorHandlingService : XOSServiceBase
    {
        // ✅ CORRECT: Comprehensive error handling with classification
        public async Task<OperationResult> SafeTransactionOperation(ComplexOperationRequest request)
        {
            var result = new OperationResult();
            IDbTransaction transaction = null;

            try
            {
                transaction = await DBService.BeginTransactionAsync();
                
                // Validate before operation
                var validationResult = await ValidateOperation(request, transaction);
                if (!validationResult.IsValid)
                {
                    await transaction.RollbackAsync();
                    return OperationResult.Failure(validationResult.Errors);
                }

                // Perform operation
                await PerformComplexOperation(request, transaction);
                
                // Final validation
                var finalValidation = await ValidateOperationComplete(request, transaction);
                if (!finalValidation.IsValid)
                {
                    await transaction.RollbackAsync();
                    return OperationResult.Failure("Operation completed but validation failed");
                }

                await transaction.CommitAsync();
                result.Success = true;
                return result;
            }
            catch (SqlException ex) when (ex.Number == 2) // Timeout
            {
                await SafeRollback(transaction);
                LogError(ex, "Transaction timeout", request);
                return OperationResult.Failure("Operation timed out, please try again");
            }
            catch (SqlException ex) when (ex.Number == 1205) // Deadlock
            {
                await SafeRollback(transaction);
                LogError(ex, "Deadlock detected", request);
                return OperationResult.Failure("System busy, please retry");
            }
            catch (InvalidOperationException ex)
            {
                await SafeRollback(transaction);
                LogError(ex, "Invalid operation", request);
                return OperationResult.Failure("Invalid operation requested");
            }
            catch (BusinessRuleException ex)
            {
                await SafeRollback(transaction);
                LogWarning(ex, "Business rule violation", request);
                return OperationResult.Failure(ex.Message);
            }
            catch (Exception ex)
            {
                await SafeRollback(transaction);
                LogError(ex, "Unexpected error in transaction", request);
                return OperationResult.Failure("An unexpected error occurred");
            }
            finally
            {
                transaction?.Dispose();
            }
        }

        // ✅ CORRECT: Safe rollback with error handling
        private async Task SafeRollback(IDbTransaction transaction)
        {
            if (transaction == null) return;

            try
            {
                await transaction.RollbackAsync();
            }
            catch (Exception rollbackEx)
            {
                // Log rollback failure but don't throw
                LogError(rollbackEx, "Failed to rollback transaction");
            }
        }

        // ✅ CORRECT: Transaction state verification
        public async Task<bool> VerifyTransactionState(IDbTransaction transaction)
        {
            try
            {
                // Check if transaction is still active
                var result = await DBService.GetValueAsync<int>(
                    "SELECT 1",
                    transaction: transaction
                );
                return true;
            }
            catch (InvalidOperationException)
            {
                // Transaction is no longer valid
                return false;
            }
            catch (Exception ex)
            {
                LogWarning(ex, "Error checking transaction state");
                return false;
            }
        }

        // ✅ CORRECT: Recovery strategies
        public async Task<bool> RecoverFromPartialFailure(int operationId)
        {
            // Check what was completed
            var completedSteps = await DBService.GetListAsync<string>(
                "SELECT step_name FROM operation_steps WHERE operation_id = @id AND client_id = @client_id AND completed = true",
                new { id = operationId, client_id = ClientId }
            );

            // Resume from last completed step
            using var transaction = await DBService.BeginTransactionAsync();
            try
            {
                switch (completedSteps.LastOrDefault())
                {
                    case "step1":
                        await ExecuteStep2(operationId, transaction);
                        await ExecuteStep3(operationId, transaction);
                        break;
                    case "step2":
                        await ExecuteStep3(operationId, transaction);
                        break;
                    case null:
                        await ExecuteStep1(operationId, transaction);
                        await ExecuteStep2(operationId, transaction);
                        await ExecuteStep3(operationId, transaction);
                        break;
                }

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

    // ============================================================================
    // COMPLETE EXAMPLES
    // ============================================================================

    public class CompleteTransactionExamples : XOSServiceBase
    {
        // ✅ COMPLETE EXAMPLE: E-commerce order processing
        public async Task<OrderResult> ProcessCompleteOrder(OrderRequest request)
        {
            using var transaction = await DBService.BeginTransactionAsync();
            var result = new OrderResult();

            try
            {
                // 1. Validate customer and payment
                var customer = await ValidateCustomer(request.CustomerId, transaction);
                var paymentValidation = await ValidatePayment(request.PaymentDetails, transaction);
                
                if (!customer.IsValid || !paymentValidation.IsValid)
                {
                    await transaction.RollbackAsync();
                    return OrderResult.ValidationFailure();
                }

                // 2. Create order header
                var orderId = await DBService.GetValueAsync<int>(@"
                    INSERT INTO orders (
                        customer_id, total_amount, tax_amount, shipping_amount, 
                        status, client_id, created_at
                    ) VALUES (
                        @customer_id, @total_amount, @tax_amount, @shipping_amount,
                        'pending', @client_id, CURRENT_TIMESTAMP
                    ) RETURNING id",
                    new {
                        customer_id = request.CustomerId,
                        total_amount = request.TotalAmount,
                        tax_amount = request.TaxAmount,
                        shipping_amount = request.ShippingAmount,
                        client_id = ClientId
                    },
                    transaction: transaction
                );

                result.OrderId = orderId;

                // 3. Process inventory and create order items
                var inventoryUpdates = new List<InventoryReservation>();
                
                foreach (var item in request.Items)
                {
                    // Check and reserve inventory
                    var availableQty = await DBService.GetValueAsync<int>(@"
                        SELECT available_quantity FROM inventory 
                        WHERE product_id = @product_id AND client_id = @client_id 
                        FOR UPDATE",
                        new { product_id = item.ProductId, client_id = ClientId },
                        transaction: transaction
                    );

                    if (availableQty < item.Quantity)
                    {
                        await transaction.RollbackAsync();
                        return OrderResult.InsufficientInventory(item.ProductId);
                    }

                    // Reserve inventory
                    await DBService.ExecuteAsync(@"
                        UPDATE inventory 
                        SET available_quantity = available_quantity - @quantity,
                            reserved_quantity = reserved_quantity + @quantity
                        WHERE product_id = @product_id AND client_id = @client_id",
                        new { quantity = item.Quantity, product_id = item.ProductId, client_id = ClientId },
                        transaction: transaction
                    );

                    // Create order item
                    await DBService.ExecuteAsync(@"
                        INSERT INTO order_items (
                            order_id, product_id, quantity, unit_price, total_price, client_id
                        ) VALUES (
                            @order_id, @product_id, @quantity, @unit_price, @total_price, @client_id
                        )",
                        new {
                            order_id = orderId,
                            product_id = item.ProductId,
                            quantity = item.Quantity,
                            unit_price = item.UnitPrice,
                            total_price = item.TotalPrice,
                            client_id = ClientId
                        },
                        transaction: transaction
                    );

                    inventoryUpdates.Add(new InventoryReservation
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity
                    });
                }

                // 4. Process payment
                var paymentResult = await ProcessPaymentWithTransaction(
                    request.PaymentDetails, 
                    request.TotalAmount, 
                    orderId, 
                    transaction
                );

                if (!paymentResult.Success)
                {
                    await transaction.RollbackAsync();
                    return OrderResult.PaymentFailure(paymentResult.ErrorMessage);
                }

                // 5. Create shipping record
                await DBService.ExecuteAsync(@"
                    INSERT INTO shipments (
                        order_id, shipping_address, shipping_method, 
                        estimated_delivery, status, client_id, created_at
                    ) VALUES (
                        @order_id, @shipping_address, @shipping_method,
                        @estimated_delivery, 'pending', @client_id, CURRENT_TIMESTAMP
                    )",
                    new {
                        order_id = orderId,
                        shipping_address = JsonSerializer.Serialize(request.ShippingAddress),
                        shipping_method = request.ShippingMethod,
                        estimated_delivery = CalculateEstimatedDelivery(request.ShippingMethod),
                        client_id = ClientId
                    },
                    transaction: transaction
                );

                // 6. Update order status
                await DBService.ExecuteAsync(@"
                    UPDATE orders 
                    SET status = 'confirmed', 
                        payment_id = @payment_id,
                        confirmed_at = CURRENT_TIMESTAMP
                    WHERE id = @id AND client_id = @client_id",
                    new { payment_id = paymentResult.PaymentId, id = orderId, client_id = ClientId },
                    transaction: transaction
                );

                // 7. Log order events
                await DBService.ExecuteAsync(@"
                    INSERT INTO order_events (order_id, event_type, event_data, client_id, created_at)
                    VALUES (@order_id, 'order_confirmed', @event_data, @client_id, CURRENT_TIMESTAMP)",
                    new {
                        order_id = orderId,
                        event_data = JsonSerializer.Serialize(new { 
                            payment_id = paymentResult.PaymentId,
                            inventory_reservations = inventoryUpdates
                        }),
                        client_id = ClientId
                    },
                    transaction: transaction
                );

                await transaction.CommitAsync();
                
                // 8. Send confirmation (outside transaction)
                _ = Task.Run(() => SendOrderConfirmation(orderId));

                result.Success = true;
                result.PaymentId = paymentResult.PaymentId;
                return result;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                LogError(ex, "Order processing failed", new { OrderRequest = request });
                return OrderResult.SystemError();
            }
        }

        // ✅ COMPLETE EXAMPLE: Multi-tenant data migration
        public async Task<MigrationResult> MigrateClientData(int sourceClientId, int targetClientId)
        {
            var result = new MigrationResult();
            var migratedTables = new List<string>();

            using var transaction = await DBService.BeginTransactionAsync(IsolationLevel.Serializable);
            try
            {
                // 1. Validate migration preconditions
                var canMigrate = await ValidateMigrationPreconditions(sourceClientId, targetClientId, transaction);
                if (!canMigrate.IsValid)
                {
                    await transaction.RollbackAsync();
                    return MigrationResult.ValidationFailure(canMigrate.Errors);
                }

                // 2. Create migration log entry
                var migrationId = await DBService.GetValueAsync<int>(@"
                    INSERT INTO data_migrations (
                        source_client_id, target_client_id, status, started_at
                    ) VALUES (@source_client_id, @target_client_id, 'in_progress', CURRENT_TIMESTAMP)
                    RETURNING id",
                    new { source_client_id = sourceClientId, target_client_id = targetClientId },
                    transaction: transaction
                );

                // 3. Migrate core tables in dependency order
                var tablesToMigrate = new[]
                {
                    "users", "user_profiles", "projects", "project_members",
                    "documents", "document_versions", "permissions"
                };

                foreach (var tableName in tablesToMigrate)
                {
                    await MigrateTableData(tableName, sourceClientId, targetClientId, migrationId, transaction);
                    migratedTables.Add(tableName);

                    // Update progress
                    await DBService.ExecuteAsync(@"
                        UPDATE data_migrations 
                        SET progress = @progress, migrated_tables = @migrated_tables
                        WHERE id = @id",
                        new {
                            progress = (double)migratedTables.Count / tablesToMigrate.Length,
                            migrated_tables = JsonSerializer.Serialize(migratedTables),
                            id = migrationId
                        },
                        transaction: transaction
                    );
                }

                // 4. Verify data integrity
                var integrityCheck = await VerifyMigratedDataIntegrity(sourceClientId, targetClientId, transaction);
                if (!integrityCheck.IsValid)
                {
                    await transaction.RollbackAsync();
                    return MigrationResult.IntegrityFailure(integrityCheck.Errors);
                }

                // 5. Update migration status
                await DBService.ExecuteAsync(@"
                    UPDATE data_migrations 
                    SET status = 'completed', completed_at = CURRENT_TIMESTAMP
                    WHERE id = @id",
                    new { id = migrationId },
                    transaction: transaction
                );

                await transaction.CommitAsync();

                result.Success = true;
                result.MigrationId = migrationId;
                result.MigratedTables = migratedTables;
                return result;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                
                // Log failure
                LogError(ex, "Data migration failed", new { 
                    SourceClientId = sourceClientId, 
                    TargetClientId = targetClientId,
                    MigratedTables = migratedTables 
                });

                return MigrationResult.SystemError(ex.Message);
            }
        }

        // Helper methods for complete examples
        private async Task MigrateTableData(string tableName, int sourceClientId, int targetClientId, int migrationId, IDbTransaction transaction)
        {
            // Create temporary mapping table for ID translations
            await DBService.ExecuteAsync($@"
                CREATE TEMP TABLE {tableName}_id_mapping (
                    old_id INT PRIMARY KEY,
                    new_id INT NOT NULL
                ) ON COMMIT DROP", transaction: transaction);

            // Copy data with new client_id and capture ID mappings
            await DBService.ExecuteAsync($@"
                WITH migrated_data AS (
                    INSERT INTO {tableName} 
                    SELECT nextval('{tableName}_id_seq') as id, 
                           @target_client_id as client_id,
                           -- Copy all other columns except id and client_id
                           * EXCLUDE (id, client_id)
                    FROM {tableName} 
                    WHERE client_id = @source_client_id
                    RETURNING id as new_id, 
                              ROW_NUMBER() OVER (ORDER BY id) as row_num
                ),
                source_data AS (
                    SELECT id as old_id, 
                           ROW_NUMBER() OVER (ORDER BY id) as row_num
                    FROM {tableName} 
                    WHERE client_id = @source_client_id
                )
                INSERT INTO {tableName}_id_mapping (old_id, new_id)
                SELECT s.old_id, m.new_id
                FROM source_data s
                JOIN migrated_data m ON s.row_num = m.row_num",
                new { source_client_id = sourceClientId, target_client_id = targetClientId },
                transaction: transaction
            );

            // Log table migration
            await DBService.ExecuteAsync(@"
                INSERT INTO migration_table_logs (migration_id, table_name, records_migrated, migrated_at)
                SELECT @migration_id, @table_name, COUNT(*), CURRENT_TIMESTAMP
                FROM {tableName}_id_mapping",
                new { migration_id = migrationId, table_name = tableName },
                transaction: transaction
            );
        }

        // Utility methods
        private bool IsDeadlockException(Exception ex)
        {
            return ex is SqlException sqlEx && sqlEx.Number == 1205 ||
                   ex is NpgsqlException npgEx && npgEx.SqlState == "40P01";
        }

        private bool IsUniqueConstraintViolation(Exception ex)
        {
            return ex is SqlException sqlEx && sqlEx.Number == 2627 ||
                   ex is NpgsqlException npgEx && npgEx.SqlState == "23505";
        }
    }

    // Supporting classes
    public class CreateUserRequest
    {
        public string Email { get; set; }
        public string Name { get; set; }
        public string Bio { get; set; }
        public string AvatarUrl { get; set; }
    }

    public class ProcessOrderRequest
    {
        public int CustomerId { get; set; }
        public decimal TotalAmount { get; set; }
        public List<OrderItem> Items { get; set; }
    }

    public class OrderItem
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }

    public class InsufficientInventoryException : Exception
    {
        public InsufficientInventoryException(string message) : base(message) { }
    }

    public class PaymentFailedException : Exception
    {
        public PaymentFailedException(string message) : base(message) { }
    }

    public class BusinessRuleException : Exception
    {
        public BusinessRuleException(string message) : base(message) { }
    }

    public class OperationResult
    {
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
        public List<string> Errors { get; set; } = new();

        public static OperationResult Failure(string error) => 
            new() { Success = false, ErrorMessage = error };

        public static OperationResult Failure(List<string> errors) => 
            new() { Success = false, Errors = errors };
    }
}