const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, 'melonotes.db'), (err) => {
      if (err) {
        console.error('💔 Database connection error:', err);
      } else {
        console.log('💖 Connected to MELONOTES database for Melo!');
        this.init();
      }
    });
  }

  init() {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#FF69B4',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        problem TEXT,
        problem_definition TEXT,
        analysis TEXT,
        why_solution_a TEXT,
        why_switch_to_b TEXT,
        category_id INTEGER,
        priority INTEGER DEFAULT 1,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      );

      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        color TEXT DEFAULT '#FF69B4',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS note_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE,
        UNIQUE(note_id, tag_id)
      );

      CREATE TABLE IF NOT EXISTS solutions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id INTEGER NOT NULL,
        plan_type TEXT NOT NULL,
        description TEXT NOT NULL,
        reasoning TEXT,
        priority INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        solution_id INTEGER NOT NULL,
        step_number INTEGER NOT NULL,
        description TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (solution_id) REFERENCES solutions (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS code_snippets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id INTEGER NOT NULL,
        solution_id INTEGER,
        title TEXT,
        language TEXT DEFAULT 'sql',
        code TEXT NOT NULL,
        description TEXT,
        execution_order INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE,
        FOREIGN KEY (solution_id) REFERENCES solutions (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS scripts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id INTEGER NOT NULL,
        solution_id INTEGER,
        title TEXT NOT NULL,
        script_type TEXT DEFAULT 'bash',
        content TEXT NOT NULL,
        description TEXT,
        execution_order INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE,
        FOREIGN KEY (solution_id) REFERENCES solutions (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
      );

      INSERT OR IGNORE INTO tags (name, color) VALUES 
        ('MSSQL', '#FF6B6B'),
        ('PostgreSQL', '#4ECDC4'),
        ('MySQL', '#45B7D1'),
        ('Oracle', '#96CEB4'),
        ('MongoDB', '#FECA57'),
        ('Redis', '#FF9F43'),
        ('Performance', '#FF6348'),
        ('Indexing', '#A0E7E5'),
        ('Query Optimization', '#FFA726'),
        ('Backup', '#66BB6A'),
        ('Recovery', '#EF5350'),
        ('Security', '#AB47BC'),
        ('Replication', '#26C6DA'),
        ('Cluster', '#7E57C2'),
        ('Migration', '#FF7043');
    `;

    this.db.exec(sql, (err) => {
      if (err) {
        console.error('💔 Database initialization error:', err);
      } else {
        console.log('💝 Database initialized with love for Melo!');
        this.createDefaultUser();
        this.createSeedData();
      }
    });
  }

  createDefaultUser() {
    const username = 'frieren';
    const password = 'MeldaErkan!5352';
    
    this.db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
      if (err) {
        console.error('💔 Error checking user:', err);
        return;
      }
      
      if (!user) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        this.db.run(
          'INSERT INTO users (username, password) VALUES (?, ?)',
          [username, hashedPassword],
          function(err) {
            if (err) {
              console.error('💔 Error creating default user:', err);
            } else {
              console.log('💖 Default user "frieren" created for Melo!');
            }
          }
        );
      }
    });
  }

  createSeedData() {
    // Check if seed data already exists
    this.db.get('SELECT COUNT(*) as count FROM notes', (err, result) => {
      if (err) {
        console.error('💔 Error checking seed data:', err);
        return;
      }
      
      if (result.count > 0) {
        console.log('💖 Seed data already exists for Melo!');
        return;
      }

      console.log('💝 Creating seed data with love for Melo...');
      
      // Insert categories
      const categories = [
        ['Database Performance', '#FF6B6B'],
        ['SQL Sorgulama', '#4ECDC4'],
        ['Index Optimizasyonu', '#45B7D1'],
        ['Backup & Recovery', '#96CEB4'],
        ['Güvenlik', '#AB47BC']
      ];

      this.db.serialize(() => {
        const categoryStmt = this.db.prepare('INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)');
        categories.forEach(cat => categoryStmt.run(cat));
        categoryStmt.finalize();

        // Insert sample notes with full details
        const sampleNotes = [
          {
            title: 'MELO İÇİN ÖZEL - SQL Performance Problemi',
            problem: 'Sevgili Melo için özel hazırladığım bu not: E-commerce sitesinde ürün sorguları 15 saniye sürüyor ve müşterilerimizi bekletiyoruz.',
            problem_definition: 'Dashboard sayfasında kategori filtreleri çok yavaş çalışıyor. Her click 15+ saniye bekliyor.',
            analysis: 'Missing index var, full table scan yapıyor, JOIN optimizasyonu gerekli. Bu detaylı çözüm senin için hazırlandı Melo 💖',
            category_id: 1,
            priority: 3,
            solutions: [
              {
                plan_type: 'Plan A - Index Optimizasyonu',
                description: 'Eksik indexlerin eklenmesi ve mevcut indexlerin optimizasyonu',
                reasoning: 'En hızlı ve etkili çözüm. Minimal sistem etkisi ile maksimum performans artışı sağlar.',
                steps: [
                  '1. Query execution plan analizi yapılması',
                  '2. Missing index recommendation\'ların incelenmesi',
                  '3. Composite index\'lerin tasarlanması',
                  '4. Index implementation ve test edilmesi',
                  '5. Production deployment ve monitoring'
                ],
                codes: [
                  {
                    title: 'Melo için Index Analiz Sorgusu',
                    language: 'sql',
                    code: `-- 💖 Melo için özel SQL sorgusu
-- Eksik indexleri bulmak için
SELECT 
    o.name AS table_name,
    i.name AS index_name,
    'Melo bu index gerekli!' AS message
FROM sys.tables o
LEFT JOIN sys.indexes i ON o.object_id = i.object_id
WHERE i.name IS NULL
ORDER BY o.name;

-- Yavaş sorguları bulmak için
SELECT TOP 10 
    total_elapsed_time / execution_count AS avg_time,
    text AS query_text
FROM sys.dm_exec_query_stats s
JOIN sys.dm_exec_sql_text(s.sql_handle) t
ORDER BY avg_time DESC;`,
                    description: '💖 Sevgili Melo için hazırlanmış özel SQL analiz sorgusu'
                  },
                  {
                    title: 'Melo için Hızlı Ürün Sorgusu',
                    language: 'sql',
                    code: `-- 💖 Melo'nun e-commerce sitesi için optimize edilmiş sorgu
SELECT 
    p.product_name,
    p.price,
    c.category_name
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.is_active = 1
ORDER BY p.created_date DESC
LIMIT 20;

-- Gerekli index (Melo bu indexi mutlaka ekle!)
CREATE INDEX idx_melo_products 
ON products (is_active, created_date, category_id);`,
                    description: '💖 Melo\'nun sitesi için özel optimize edilmiş ürün listesi sorgusu'
                  }
                ],
                scripts: [
                  {
                    title: 'Index Creation Script',
                    script_type: 'sql',
                    content: `-- Production index deployment script
USE [ECommerceDB]
GO

-- 1. Index oluşturma
PRINT 'Creating index IX_Products_CategoryID_Price_Includes...'
CREATE NONCLUSTERED INDEX [IX_Products_CategoryID_Price_Includes]
ON [dbo].[Products] ([CategoryID], [UnitPrice], [Discontinued])
INCLUDE ([ProductName], [UnitsInStock])
WITH (ONLINE = ON, MAXDOP = 4)

-- 2. Statistics update
PRINT 'Updating statistics...'
UPDATE STATISTICS [dbo].[Products] [IX_Products_CategoryID_Price_Includes]

-- 3. Verification
PRINT 'Verifying index creation...'
SELECT 
    i.name as IndexName,
    i.type_desc,
    i.is_disabled,
    s.user_seeks,
    s.user_scans,
    s.user_lookups
FROM sys.indexes i
LEFT JOIN sys.dm_db_index_usage_stats s ON i.object_id = s.object_id AND i.index_id = s.index_id
WHERE i.object_id = OBJECT_ID('dbo.Products')
AND i.name = 'IX_Products_CategoryID_Price_Includes'

PRINT 'Index deployment completed successfully!'`,
                    description: 'Production ortamında index deployment script'
                  },
                  {
                    title: 'Performance Monitoring',
                    script_type: 'powershell',
                    content: `# Performance monitoring script
param(
    [string]$ServerInstance = "localhost",
    [string]$Database = "ECommerceDB",
    [int]$MonitoringMinutes = 60
)

# SQL Server PowerShell module import
Import-Module SqlServer -Force

$connectionString = "Server=$ServerInstance;Database=$Database;Integrated Security=True;"
$endTime = (Get-Date).AddMinutes($MonitoringMinutes)

Write-Host "🚀 Starting performance monitoring for $MonitoringMinutes minutes..." -ForegroundColor Green

while ((Get-Date) -lt $endTime) {
    $query = @"
SELECT 
    GETDATE() as CheckTime,
    @@SERVERNAME as ServerName,
    DB_NAME() as DatabaseName,
    (SELECT COUNT(*) FROM sys.dm_exec_requests WHERE blocking_session_id > 0) as BlockedQueries,
    (SELECT AVG(total_elapsed_time/1000.0) FROM sys.dm_exec_requests WHERE total_elapsed_time > 1000) as AvgQueryTimeMs,
    (SELECT COUNT(*) FROM sys.dm_db_index_usage_stats WHERE user_seeks > 0 AND object_id = OBJECT_ID('dbo.Products')) as IndexUsage
"@
    
    try {
        $result = Invoke-Sqlcmd -ConnectionString $connectionString -Query $query
        Write-Host "⏰ $($result.CheckTime) - Blocked: $($result.BlockedQueries), Avg Time: $([math]::Round($result.AvgQueryTimeMs,2))ms" -ForegroundColor Cyan
        
        # Alert if performance degrades
        if ($result.BlockedQueries -gt 5 -or $result.AvgQueryTimeMs -gt 5000) {
            Write-Host "⚠️  PERFORMANCE ALERT: High blocking or slow queries detected!" -ForegroundColor Red
        }
        
        Start-Sleep -Seconds 30
    }
    catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "✅ Monitoring completed!" -ForegroundColor Green`,
                    description: 'PowerShell script ile veritabanı performans monitoring'
                  }
                ]
              },
              {
                plan_type: 'Plan B - Query Rewrite',
                description: 'Sorgu yapısının yeniden tasarlanması ve optimizasyonu',
                reasoning: 'Index ekleme yapılamadığı durumlarda alternatif çözüm. Sorgu mantığını değiştirerek performans artışı sağlar.',
                steps: [
                  '1. Mevcut sorgu yapısının analiz edilmesi',
                  '2. Alternative query approach\'ların araştırılması',
                  '3. CTE ve subquery optimizasyonları',
                  '4. Pagination logic\'in iyileştirilmesi',
                  '5. Caching strategy implementasyonu'
                ],
                codes: [
                  {
                    title: 'Optimized Pagination Query',
                    language: 'sql',
                    code: `-- Cursor-based pagination yerine offset-based
DECLARE @PageSize INT = 20
DECLARE @PageNumber INT = 1
DECLARE @CategoryFilter INT = NULL

-- Temporary table ile pre-filtering
CREATE TABLE #FilteredProducts (
    ProductID INT PRIMARY KEY,
    ProductName NVARCHAR(100),
    CategoryID INT,
    UnitPrice DECIMAL(10,2),
    UnitsInStock INT,
    CategoryName NVARCHAR(50)
)

-- Efficient filtering
INSERT INTO #FilteredProducts
SELECT TOP ((@PageNumber + 10) * @PageSize)  -- Pre-fetch for better performance
    p.ProductID,
    p.ProductName,
    p.CategoryID,
    p.UnitPrice,
    p.UnitsInStock,
    c.CategoryName
FROM Products p
INNER JOIN Categories c ON p.CategoryID = c.CategoryID
WHERE p.Discontinued = 0
AND (@CategoryFilter IS NULL OR p.CategoryID = @CategoryFilter)
ORDER BY p.ProductName

-- Return paginated results
SELECT *
FROM #FilteredProducts
ORDER BY ProductName
OFFSET ((@PageNumber - 1) * @PageSize) ROWS
FETCH NEXT @PageSize ROWS ONLY

DROP TABLE #FilteredProducts`,
                    description: 'Temporary table kullanarak optimize edilmiş pagination'
                  }
                ],
                scripts: [
                  {
                    title: 'Query Performance Analyzer',
                    script_type: 'bash',
                    content: `#!/bin/bash

# SQL Server query performance analyzer
SERVER="localhost"
DATABASE="ECommerceDB"
OUTPUT_FILE="query_performance_$(date +%Y%m%d_%H%M%S).txt"

echo "🔍 SQL Server Query Performance Analysis" > $OUTPUT_FILE
echo "=======================================" >> $OUTPUT_FILE
echo "Date: $(date)" >> $OUTPUT_FILE
echo "Server: $SERVER" >> $OUTPUT_FILE
echo "Database: $DATABASE" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Function to execute SQL and log results
execute_sql() {
    local query="$1"
    local description="$2"
    
    echo "📊 $description" >> $OUTPUT_FILE
    echo "----------------------------------------" >> $OUTPUT_FILE
    
    sqlcmd -S "$SERVER" -d "$DATABASE" -E -h -1 -W -Q "$query" >> $OUTPUT_FILE 2>&1
    
    echo "" >> $OUTPUT_FILE
}

# Top 10 slowest queries
SLOW_QUERIES="
SELECT TOP 10
    qs.total_elapsed_time / qs.execution_count as avg_elapsed_time,
    qs.execution_count,
    SUBSTRING(st.text, (qs.statement_start_offset/2) + 1,
        ((CASE statement_end_offset
            WHEN -1 THEN DATALENGTH(st.text)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2) + 1) AS statement_text
FROM sys.dm_exec_query_stats AS qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) AS st
ORDER BY avg_elapsed_time DESC
"

execute_sql "$SLOW_QUERIES" "Top 10 Slowest Queries"

# Index usage statistics
INDEX_USAGE="
SELECT 
    o.name AS table_name,
    i.name AS index_name,
    i.type_desc,
    s.user_seeks,
    s.user_scans,
    s.user_lookups,
    s.user_updates
FROM sys.dm_db_index_usage_stats s
INNER JOIN sys.indexes i ON s.object_id = i.object_id AND s.index_id = i.index_id
INNER JOIN sys.objects o ON i.object_id = o.object_id
WHERE s.database_id = DB_ID()
AND o.type = 'U'
ORDER BY s.user_seeks + s.user_scans + s.user_lookups DESC
"

execute_sql "$INDEX_USAGE" "Index Usage Statistics"

echo "✅ Analysis completed! Results saved to: $OUTPUT_FILE"
echo "📧 Sending results to monitoring email..."

# Optional: Send results via email (requires mailutils)
if command -v mail &> /dev/null; then
    mail -s "SQL Server Performance Report - $(date)" admin@company.com < $OUTPUT_FILE
    echo "📤 Report sent successfully!"
else
    echo "ℹ️  Mail utility not found. Report saved locally."
fi`,
                    description: 'Linux/bash script ile SQL Server performans analizi'
                  }
                ]
              }
            ]
          },
          {
            title: 'Backup Strategy Optimization',
            problem: 'Mevcut backup sistemi çok yavaş ve sistem kaynaklarını aşırı kullanıyor. Gece backup işlemleri 6 saat sürüyor.',
            problem_definition: 'Production veritabanının backup işlemi sistem performansını ciddi şekilde etkilemekte ve RTO/RPO hedeflerine ulaşamıyoruz.',
            analysis: 'Full backup + differential backup stratejisi yeniden gözden geçirilmeli. Compression ve parallelization seçenekleri değerlendirilmeli.',
            category_id: 4,
            priority: 2,
            solutions: [
              {
                plan_type: 'Plan A - Compression & Parallelization',
                description: 'Backup compression ve parallel processing ile optimization',
                reasoning: 'Backup süresini %70 azaltabilir ve sistem etkisini minimize eder.',
                steps: [
                  '1. Current backup performance analysis',
                  '2. Compression ratio testing',
                  '3. Parallel backup configuration',
                  '4. Backup verification automation',
                  '5. Monitoring dashboard setup'
                ],
                codes: [
                  {
                    title: 'Optimized Backup Script',
                    language: 'sql',
                    code: `-- High-performance backup with compression
DECLARE @BackupPath NVARCHAR(500) = 'E:\\Backups\\'
DECLARE @DatabaseName NVARCHAR(100) = 'ECommerceDB'
DECLARE @BackupFileName NVARCHAR(500)
DECLARE @DifferentialFileName NVARCHAR(500)

-- Generate backup file names with timestamp
SET @BackupFileName = @BackupPath + @DatabaseName + '_FULL_' + 
    FORMAT(GETDATE(), 'yyyyMMdd_HHmmss') + '.bak'
SET @DifferentialFileName = @BackupPath + @DatabaseName + '_DIFF_' + 
    FORMAT(GETDATE(), 'yyyyMMdd_HHmmss') + '.bak'

-- Full backup with compression and multiple files for parallelization
BACKUP DATABASE @DatabaseName 
TO DISK = @BackupFileName + '_1',
   DISK = @BackupFileName + '_2',
   DISK = @BackupFileName + '_3',
   DISK = @BackupFileName + '_4'
WITH 
    COMPRESSION,
    CHECKSUM,
    STATS = 10,
    MAXTRANSFERSIZE = 4194304,  -- 4MB
    BLOCKSIZE = 65536,          -- 64KB
    BUFFERCOUNT = 100,
    INIT,
    FORMAT

-- Verify backup integrity
RESTORE VERIFYONLY 
FROM DISK = @BackupFileName + '_1',
     DISK = @BackupFileName + '_2',
     DISK = @BackupFileName + '_3',
     DISK = @BackupFileName + '_4'

PRINT 'Full backup completed: ' + @BackupFileName`,
                    description: 'Multi-file compressed backup with verification'
                  }
                ],
                scripts: [
                  {
                    title: 'Automated Backup Solution',
                    script_type: 'powershell',
                    content: `# Comprehensive backup automation script
param(
    [string]$ServerInstance = "PROD-SQL01",
    [string]$DatabaseName = "ECommerceDB",
    [string]$BackupPath = "E:\\Backups\\",
    [string]$LogPath = "E:\\Logs\\",
    [int]$RetentionDays = 7,
    [string]$EmailRecipients = "dba@company.com"
)

# Import SQL Server module
Import-Module SqlServer -ErrorAction Stop

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = "$LogPath\\backup_log_$timestamp.txt"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $logMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [$Level] $Message"
    Write-Host $logMessage
    Add-Content -Path $logFile -Value $logMessage
}

Write-Log "🚀 Starting backup process for database: $DatabaseName"

try {
    # Pre-backup checks
    Write-Log "🔍 Performing pre-backup checks..."
    
    $dbStatus = Invoke-Sqlcmd -ServerInstance $ServerInstance -Query "SELECT state_desc FROM sys.databases WHERE name = '$DatabaseName'"
    if ($dbStatus.state_desc -ne "ONLINE") {
        throw "Database $DatabaseName is not online. Current state: $($dbStatus.state_desc)"
    }
    
    # Check disk space
    $drive = Split-Path $BackupPath -Qualifier
    $freeSpace = (Get-WmiObject -Class Win32_LogicalDisk | Where-Object {$_.DeviceID -eq $drive}).FreeSpace / 1GB
    
    if ($freeSpace -lt 50) {
        Write-Log "⚠️  Warning: Low disk space ($([math]::Round($freeSpace, 2)) GB remaining)" "WARNING"
    }
    
    Write-Log "💾 Available disk space: $([math]::Round($freeSpace, 2)) GB"
    
    # Create backup directory if not exists
    if (!(Test-Path $BackupPath)) {
        New-Item -ItemType Directory -Path $BackupPath -Force
        Write-Log "📁 Created backup directory: $BackupPath"
    }
    
    # Determine backup type (Full on Sunday, Differential other days)
    $backupType = if ((Get-Date).DayOfWeek -eq "Sunday") { "FULL" } else { "DIFFERENTIAL" }
    $backupFileName = "$BackupPath\\$DatabaseName\\$($backupType)_$timestamp.bak"
    
    # Create database-specific directory
    $dbBackupPath = "$BackupPath\\$DatabaseName"
    if (!(Test-Path $dbBackupPath)) {
        New-Item -ItemType Directory -Path $dbBackupPath -Force
    }
    
    Write-Log "📝 Backup type: $backupType"
    Write-Log "📂 Backup file: $backupFileName"
    
    # Perform backup
    $startTime = Get-Date
    
    $backupQuery = if ($backupType -eq "FULL") {
        @"
BACKUP DATABASE [$DatabaseName] 
TO DISK = '$backupFileName'
WITH 
    COMPRESSION,
    CHECKSUM,
    STATS = 5,
    MAXTRANSFERSIZE = 4194304,
    BLOCKSIZE = 65536,
    BUFFERCOUNT = 100,
    INIT,
    FORMAT,
    NAME = '$DatabaseName Full Backup - $timestamp'
"@
    } else {
        @"
BACKUP DATABASE [$DatabaseName] 
TO DISK = '$backupFileName'
WITH 
    DIFFERENTIAL,
    COMPRESSION,
    CHECKSUM,
    STATS = 5,
    MAXTRANSFERSIZE = 4194304,
    BLOCKSIZE = 65536,
    BUFFERCOUNT = 100,
    INIT,
    FORMAT,
    NAME = '$DatabaseName Differential Backup - $timestamp'
"@
    }
    
    Write-Log "⏳ Starting $backupType backup..."
    Invoke-Sqlcmd -ServerInstance $ServerInstance -Query $backupQuery -QueryTimeout 0
    
    $endTime = Get-Date
    $duration = $endTime - $startTime
    $backupSize = (Get-Item $backupFileName).Length / 1GB
    
    Write-Log "✅ Backup completed successfully!"
    Write-Log "⌛ Duration: $($duration.ToString('hh\\:mm\\:ss'))"
    Write-Log "💾 Backup size: $([math]::Round($backupSize, 2)) GB"
    
    # Verify backup
    Write-Log "🔍 Verifying backup integrity..."
    $verifyQuery = "RESTORE VERIFYONLY FROM DISK = '$backupFileName'"
    Invoke-Sqlcmd -ServerInstance $ServerInstance -Query $verifyQuery
    Write-Log "✅ Backup verification successful!"
    
    # Cleanup old backups
    Write-Log "🧹 Cleaning up old backups (retention: $RetentionDays days)..."
    $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
    $oldBackups = Get-ChildItem -Path $dbBackupPath -Filter "*.bak" | Where-Object {$_.CreationTime -lt $cutoffDate}
    
    foreach ($oldBackup in $oldBackups) {
        Remove-Item $oldBackup.FullName -Force
        Write-Log "🗑️  Removed old backup: $($oldBackup.Name)"
    }
    
    Write-Log "🎉 Backup process completed successfully!"
    
    # Send success email
    $emailBody = @"
✅ SQL Server Backup Successful

Database: $DatabaseName
Server: $ServerInstance
Backup Type: $backupType
Start Time: $startTime
End Time: $endTime
Duration: $($duration.ToString('hh\\:mm\\:ss'))
Backup Size: $([math]::Round($backupSize, 2)) GB
Backup File: $backupFileName

All verifications passed successfully.
"@
    
    Send-MailMessage -To $EmailRecipients -Subject "✅ Backup Success - $DatabaseName" -Body $emailBody -SmtpServer "smtp.company.com"
    
} catch {
    $errorMessage = $_.Exception.Message
    Write-Log "❌ Backup failed: $errorMessage" "ERROR"
    
    # Send failure email
    $errorEmailBody = @"
❌ SQL Server Backup Failed

Database: $DatabaseName
Server: $ServerInstance
Error Time: $(Get-Date)
Error Message: $errorMessage

Please check the log file for more details: $logFile
"@
    
    Send-MailMessage -To $EmailRecipients -Subject "❌ Backup Failed - $DatabaseName" -Body $errorEmailBody -SmtpServer "smtp.company.com"
    throw
}`,
                    description: 'PowerShell ile comprehensive backup automation ve monitoring'
                  }
                ]
              }
            ]
          }
        ];

        // Insert sample notes and related data
        const db = this.db;
        sampleNotes.forEach((noteData, index) => {
          db.run(
            `INSERT INTO notes (title, problem, problem_definition, analysis, category_id, priority) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [noteData.title, noteData.problem, noteData.problem_definition, noteData.analysis, noteData.category_id, noteData.priority],
            function(err) {
              if (err) {
                console.error('💔 Error inserting note:', err);
                return;
              }
              
              const noteId = this.lastID;
              
              // Insert solutions
              noteData.solutions.forEach((solutionData, solIndex) => {
                db.run(
                  `INSERT INTO solutions (note_id, plan_type, description, reasoning, priority) 
                   VALUES (?, ?, ?, ?, ?)`,
                  [noteId, solutionData.plan_type, solutionData.description, solutionData.reasoning, solIndex + 1],
                  function(err) {
                    if (err) {
                      console.error('💔 Error inserting solution:', err);
                      return;
                    }
                    
                    const solutionId = this.lastID;
                    
                    // Insert steps
                    solutionData.steps.forEach((step, stepIndex) => {
                      db.run(
                        `INSERT INTO steps (solution_id, step_number, description, completed) 
                         VALUES (?, ?, ?, ?)`,
                        [solutionId, stepIndex + 1, step, stepIndex < 2] // İlk 2 adım tamamlanmış olarak
                      );
                    });
                    
                    // Insert code snippets
                    if (solutionData.codes) {
                      solutionData.codes.forEach((code, codeIndex) => {
                        db.run(
                          `INSERT INTO code_snippets (note_id, solution_id, title, language, code, description, execution_order) 
                           VALUES (?, ?, ?, ?, ?, ?, ?)`,
                          [noteId, solutionId, code.title, code.language, code.code, code.description, codeIndex + 1]
                        );
                      });
                    }
                    
                    // Insert scripts
                    if (solutionData.scripts) {
                      solutionData.scripts.forEach((script, scriptIndex) => {
                        db.run(
                          `INSERT INTO scripts (note_id, solution_id, title, script_type, content, description, execution_order) 
                           VALUES (?, ?, ?, ?, ?, ?, ?)`,
                          [noteId, solutionId, script.title, script.script_type, script.content, script.description, scriptIndex + 1]
                        );
                      });
                    }
                  }
                );
              });
            }
          );
        });
        
        console.log('💖 Seed data created with detailed examples for Melo!');
      });
    });
  }

  getDB() {
    return this.db;
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('💔 Error closing database:', err);
      } else {
        console.log('💖 Database connection closed gracefully');
      }
    });
  }
}

module.exports = new Database();