-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "hcmutId" TEXT NOT NULL,
    "ssoProviderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "program" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "parkingPass" TEXT,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "entryCount" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "ssoLastSync" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SSOSyncLog" (
    "id" TEXT NOT NULL,
    "syncTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usersSync" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT,
    "details" JSONB,

    CONSTRAINT "SSOSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkingZone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "occupied" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParkingZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IoTSensor" (
    "id" TEXT NOT NULL,
    "sensorId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "slotNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ONLINE',
    "lastHeartbeat" TIMESTAMP(3),
    "occupied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IoTSensor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorReading" (
    "id" TEXT NOT NULL,
    "sensorId" TEXT NOT NULL,
    "occupied" BOOLEAN NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "SensorReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkingSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "zoneId" TEXT NOT NULL,
    "gate" TEXT NOT NULL,
    "vehicleId" TEXT,
    "plateNumber" TEXT,
    "method" TEXT NOT NULL,
    "entryAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "fee" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParkingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "ticketNo" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "zoneId" TEXT NOT NULL,
    "gate" TEXT NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "visitorName" TEXT,
    "plateNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "billingPeriod" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "bkpayTransactionId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingPlan" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "hourly" INTEGER NOT NULL,
    "daily" INTEGER,
    "monthly" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_hcmutId_key" ON "User"("hcmutId");

-- CreateIndex
CREATE UNIQUE INDEX "User_ssoProviderId_key" ON "User"("ssoProviderId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "SSOSyncLog_syncTime_idx" ON "SSOSyncLog"("syncTime");

-- CreateIndex
CREATE UNIQUE INDEX "ParkingZone_name_key" ON "ParkingZone"("name");

-- CreateIndex
CREATE INDEX "ParkingZone_status_idx" ON "ParkingZone"("status");

-- CreateIndex
CREATE UNIQUE INDEX "IoTSensor_sensorId_key" ON "IoTSensor"("sensorId");

-- CreateIndex
CREATE INDEX "IoTSensor_zoneId_status_idx" ON "IoTSensor"("zoneId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "IoTSensor_zoneId_slotNumber_key" ON "IoTSensor"("zoneId", "slotNumber");

-- CreateIndex
CREATE INDEX "SensorReading_sensorId_timestamp_idx" ON "SensorReading"("sensorId", "timestamp");

-- CreateIndex
CREATE INDEX "ParkingSession_userId_idx" ON "ParkingSession"("userId");

-- CreateIndex
CREATE INDEX "ParkingSession_zoneId_idx" ON "ParkingSession"("zoneId");

-- CreateIndex
CREATE INDEX "ParkingSession_status_idx" ON "ParkingSession"("status");

-- CreateIndex
CREATE INDEX "ParkingSession_entryAt_idx" ON "ParkingSession"("entryAt");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketNo_key" ON "Ticket"("ticketNo");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "Ticket_expiredAt_idx" ON "Ticket"("expiredAt");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");

-- CreateIndex
CREATE UNIQUE INDEX "BillingPlan_category_key" ON "BillingPlan"("category");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "ActivityLog_type_idx" ON "ActivityLog"("type");

-- CreateIndex
CREATE INDEX "ActivityLog_timestamp_idx" ON "ActivityLog"("timestamp");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IoTSensor" ADD CONSTRAINT "IoTSensor_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "ParkingZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensorReading" ADD CONSTRAINT "SensorReading_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "IoTSensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingSession" ADD CONSTRAINT "ParkingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingSession" ADD CONSTRAINT "ParkingSession_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "ParkingZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
