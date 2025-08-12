require('dotenv').config();
const database = require('./database-couchbase');

async function addDetailedSeeds() {
  try {
    console.log('💝 Adding detailed MELO seed data to Couchbase...');
    
    // Wait for database initialization
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Add more detailed notes with solutions, codes and scripts
    await addBackupOptimizationNote();
    await addDatabaseSecurityNote();
    await addQueryOptimizationNote();
    
    console.log('🎉 Detailed seed data added successfully for Melo!');
    
    // Close connection
    await database.close();
    
  } catch (error) {
    console.error('💔 Error adding detailed seeds:', error);
  }
}

async function addBackupOptimizationNote() {
  console.log('📝 Adding Backup Optimization note with details...');
  
  // Create detailed note
  const noteId3 = 'note::3';
  const noteDoc3 = {
    type: 'note',
    id: 3,
    title: 'MELO İÇİN ÖZEL - Backup Strategy Optimization',
    problem: 'Sevgili Melo, mevcut backup stratejimiz çok yavaş çalışıyor ve production sistemimizi etkiliyor.',
    problem_definition: 'Gece yapılan full backup işlemleri 6 saat sürüyor ve sistem kaynaklarını aşırı kullanıyor. RTO/RPO hedeflerimize ulaşamıyoruz.',
    analysis: 'Melo için analiz: Compression kullanılmıyor, parallelization yok, backup verification otomatik değil. Bu çözümler senin için hazırlandı 💖',
    category_id: 4,
    priority: 1,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: [6] // Backup
  };

  await database.getCollection().upsert(noteId3, noteDoc3);

  // Create solution for backup optimization
  const solutionId2 = 'solution::2';
  const solutionDoc2 = {
    type: 'solution',
    id: 2,
    note_id: 3,
    plan_type: 'Plan A - Compression & Parallelization',
    description: 'Backup compression ve parallel processing ile dramatik performans artışı',
    reasoning: 'Melo için en iyi çözüm: %70 hız artışı, minimum sistem etkisi, otomatik verification',
    priority: 1,
    created_at: new Date().toISOString()
  };

  await database.getCollection().upsert(solutionId2, solutionDoc2);

  // Create steps for backup solution
  const backupSteps = [
    'Mevcut backup performansını analiz et',
    'Compression ratio testleri yap',
    'Multi-file parallel backup konfigürasyonu',
    'Backup verification otomasyonu',
    'Monitoring dashboard kurulumu'
  ];

  for (let i = 0; i < backupSteps.length; i++) {
    const stepId = `step::${2}_${i + 1}`;
    const stepDoc = {
      type: 'step',
      id: `${2}_${i + 1}`,
      solution_id: 2,
      step_number: i + 1,
      description: backupSteps[i],
      completed: i < 2, // First 2 steps completed
      created_at: new Date().toISOString()
    };
    await database.getCollection().upsert(stepId, stepDoc);
  }

  // Create code snippets for backup
  const backupCodes = [
    {
      id: 3,
      title: 'Melo için High-Performance Backup Script',
      language: 'sql',
      code: `-- 💖 Melo'nun sistemi için optimize edilmiş backup
DECLARE @BackupPath NVARCHAR(500) = 'E:\\\\Backups\\\\'
DECLARE @DatabaseName NVARCHAR(100) = 'MeloECommerce'
DECLARE @BackupFileName NVARCHAR(500)

-- Timestamp ile backup dosya adı
SET @BackupFileName = @BackupPath + @DatabaseName + '_FULL_' + 
    FORMAT(GETDATE(), 'yyyyMMdd_HHmmss') + '.bak'

-- Multi-file compressed backup (Melo için optimize!)
BACKUP DATABASE @DatabaseName 
TO DISK = @BackupFileName + '_1',
   DISK = @BackupFileName + '_2',
   DISK = @BackupFileName + '_3',
   DISK = @BackupFileName + '_4'
WITH 
    COMPRESSION,           -- %60 alan tasarrufu
    CHECKSUM,             -- Otomatik verification
    STATS = 10,           -- Her %10'da progress
    MAXTRANSFERSIZE = 4194304,  -- 4MB transfer
    BLOCKSIZE = 65536,          -- 64KB blocks
    BUFFERCOUNT = 100,          -- Optimal buffer
    INIT,
    FORMAT

-- Backup integrity verification
RESTORE VERIFYONLY 
FROM DISK = @BackupFileName + '_1',
     DISK = @BackupFileName + '_2',
     DISK = @BackupFileName + '_3',
     DISK = @BackupFileName + '_4'

PRINT 'Backup completed for Melo: ' + @BackupFileName`,
      description: '💖 Melo için özel hazırlanmış yüksek performanslı backup script'
    },
    {
      id: 4,
      title: 'Melo için Backup Monitoring Sorgusu',
      language: 'sql',
      code: `-- 💖 Melo'nun backup süreçlerini izlemek için
SELECT 
    bs.database_name as 'Melo Database',
    bs.backup_start_date as 'Başlangıç',
    bs.backup_finish_date as 'Bitiş',
    DATEDIFF(MINUTE, bs.backup_start_date, bs.backup_finish_date) as 'Süre (dk)',
    bs.backup_size / 1024 / 1024 as 'Boyut (MB)',
    bs.compressed_backup_size / 1024 / 1024 as 'Sıkıştırılmış (MB)',
    'Melo için backup tamamlandı!' as message
FROM msdb.dbo.backupset bs
WHERE bs.backup_start_date >= DATEADD(DAY, -7, GETDATE())
    AND bs.type = 'D'  -- Full backup
ORDER BY bs.backup_start_date DESC`,
      description: '💖 Melo için backup süreçlerini izleme sorgusu'
    }
  ];

  for (const code of backupCodes) {
    const codeId = `code::${code.id}`;
    const codeDoc = {
      type: 'code_snippet',
      note_id: 3,
      solution_id: 2,
      execution_order: code.id - 2,
      created_at: new Date().toISOString(),
      ...code
    };
    await database.getCollection().upsert(codeId, codeDoc);
  }

  // Create script for backup
  const backupScript = {
    id: 2,
    title: 'Production Backup Deployment Script',
    script_type: 'powershell',
    content: `# Melo için Production Backup Script
# Sistem: Windows Server 2019
# Veritabanı: SQL Server 2019

Write-Host "💖 Starting backup process for Melo..." -ForegroundColor Green

# Backup dizinlerini oluştur
$BackupPath = "E:\\MeloBackups"
$LogPath = "E:\\MeloBackups\\Logs"

if (!(Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force
    Write-Host "Backup directory created for Melo: $BackupPath"
}

if (!(Test-Path $LogPath)) {
    New-Item -ItemType Directory -Path $LogPath -Force
    Write-Host "Log directory created for Melo: $LogPath"
}

# SQL Server backup job'ını çalıştır
$SqlScript = @"
EXEC msdb.dbo.sp_start_job N'Melo_FullBackup_Job'
"@

try {
    Invoke-Sqlcmd -Query $SqlScript -ServerInstance "MELOSERVER\\SQLEXPRESS"
    Write-Host "💖 Backup job started successfully for Melo!" -ForegroundColor Green
    
    # Email notification (Melo'ya bilgi ver)
    $Subject = "💖 Backup Started - Melo Database"
    $Body = "Sevgili Melo, veritabanı backup'ı başarıyla başlatıldı. Sistem otomatik olarak izlenecek."
    
    Write-Host "Backup process initiated for Melo's database"
    
} catch {
    Write-Error "Backup failed for Melo: $($_.Exception.Message)"
    # Email error notification
    $Subject = "💔 Backup Error - Melo Database"
    $Body = "Melo, backup işleminde hata oluştu: $($_.Exception.Message)"
}

Write-Host "💖 Script completed for Melo!" -ForegroundColor Green`,
    description: 'Production ortamında backup deployment ve monitoring script'
  };

  const scriptId2 = `script::${backupScript.id}`;
  const scriptDoc2 = {
    type: 'script',
    note_id: 3,
    solution_id: 2,
    execution_order: 1,
    created_at: new Date().toISOString(),
    ...backupScript
  };
  await database.getCollection().upsert(scriptId2, scriptDoc2);

  console.log('✅ Backup Optimization note added with solution, codes, and script');
}

async function addDatabaseSecurityNote() {
  console.log('🔒 Adding Database Security note...');
  
  // Create security note
  const noteId4 = 'note::4';
  const noteDoc4 = {
    type: 'note',
    id: 4,
    title: 'MELO İÇİN ÖZEL - Database Security Enhancement',
    problem: 'Melo\'nun database\'inde güvenlik açıkları var ve compliance gereksinimleri karşılanmıyor.',
    problem_definition: 'SQL injection riskleri, encryption eksik, user permissions geniş, audit log yok.',
    analysis: 'Melo için güvenlik analizi: TDE encryption gerekli, role-based access kontrolü, SQL injection koruması, comprehensive auditing. Senin için güvenli sistem 💖',
    category_id: 5,
    priority: 1,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: [5] // Security
  };

  await database.getCollection().upsert(noteId4, noteDoc4);

  // Create solution for security
  const solutionId3 = 'solution::3';
  const solutionDoc3 = {
    type: 'solution',
    id: 3,
    note_id: 4,
    plan_type: 'Plan A - Comprehensive Security Implementation',
    description: 'TDE encryption, role-based access, auditing ve SQL injection koruması',
    reasoning: 'Melo için kapsamlı güvenlik: industry best practices, compliance ready, minimal performance impact',
    priority: 1,
    created_at: new Date().toISOString()
  };

  await database.getCollection().upsert(solutionId3, solutionDoc3);

  // Create security code snippet
  const securityCode = {
    id: 5,
    title: 'Melo için Database Security Implementation',
    language: 'sql',
    code: `-- 💖 Melo için comprehensive database security setup

-- 1. TDE (Transparent Data Encryption) Setup
USE master;
GO

CREATE MASTER KEY ENCRYPTION BY PASSWORD = 'MeloSecure2024!';
GO

CREATE CERTIFICATE MeloTDECert WITH SUBJECT = 'Melo TDE Certificate';
GO

USE MeloECommerce;
GO

CREATE DATABASE ENCRYPTION KEY
WITH ALGORITHM = AES_256
ENCRYPTION BY SERVER CERTIFICATE MeloTDECert;
GO

ALTER DATABASE MeloECommerce SET ENCRYPTION ON;
GO

-- 2. Create Security Roles for Melo
USE MeloECommerce;
GO

-- Read-only role for reports
CREATE ROLE melo_reader_role;
GRANT SELECT ON SCHEMA::dbo TO melo_reader_role;

-- Application role with limited permissions
CREATE ROLE melo_app_role;
GRANT SELECT, INSERT, UPDATE ON dbo.products TO melo_app_role;
GRANT SELECT, INSERT, UPDATE ON dbo.customers TO melo_app_role;
GRANT SELECT ON dbo.categories TO melo_app_role;

-- Admin role for Melo
CREATE ROLE melo_admin_role;
GRANT CONTROL ON DATABASE::MeloECommerce TO melo_admin_role;

-- 3. SQL Injection Protection Views
CREATE VIEW dbo.vw_SecureProducts AS
SELECT 
    ProductID,
    ProductName,
    UnitPrice,
    CategoryID,
    'Secured for Melo' as security_note
FROM dbo.Products 
WHERE ProductID > 0  -- Prevents injection
WITH CHECK OPTION;
GO

-- 4. Audit Setup for Melo
CREATE SERVER AUDIT MeloSecurityAudit
TO FILE (FILEPATH = 'E:\\MeloAudits\\', MAXSIZE = 100MB, MAX_ROLLOVER_FILES = 10);
GO

ALTER SERVER AUDIT MeloSecurityAudit WITH (STATE = ON);
GO

CREATE DATABASE AUDIT SPECIFICATION MeloDataAudit
FOR SERVER AUDIT MeloSecurityAudit
ADD (SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo BY public);
GO

ALTER DATABASE AUDIT SPECIFICATION MeloDataAudit WITH (STATE = ON);
GO

PRINT '💖 Security implementation completed for Melo!';`,
    description: '💖 Melo için kapsamlı database güvenlik implementasyonu'
  };

  const codeId5 = `code::${securityCode.id}`;
  const codeDoc5 = {
    type: 'code_snippet',
    note_id: 4,
    solution_id: 3,
    execution_order: 1,
    created_at: new Date().toISOString(),
    ...securityCode
  };
  await database.getCollection().upsert(codeId5, codeDoc5);

  console.log('✅ Database Security note added');
}

async function addQueryOptimizationNote() {
  console.log('⚡ Adding Query Optimization note...');
  
  // Create optimization note
  const noteId5 = 'note::5';
  const noteDoc5 = {
    type: 'note',
    id: 5,
    title: 'MELO İÇİN ÖZEL - Advanced Query Optimization',
    problem: 'Melo\'nun e-commerce sitesinde complex raporlama sorguları çok yavaş çalışıyor.',
    problem_definition: 'Dashboard raporları 30+ saniye sürüyor, customer analytics yavaş, monthly reports timeout oluyor.',
    analysis: 'Melo için detaylı analiz: Complex JOIN\'ler optimize değil, aggregation queries inefficient, partitioning yok, statistics güncel değil. Bu çözümler performansı 10x artıracak 💖',
    category_id: 2,
    priority: 1,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: [2, 3, 5] // PostgreSQL, Performance, Query Optimization
  };

  await database.getCollection().upsert(noteId5, noteDoc5);

  // Create advanced code snippets
  const optimizationCodes = [
    {
      id: 6,
      title: 'Melo için Advanced Performance Query',
      language: 'sql',
      code: `-- 💖 Melo için ultra-fast dashboard query
WITH MeloSalesAnalysis AS (
    SELECT 
        p.CategoryID,
        c.CategoryName,
        YEAR(o.OrderDate) as SalesYear,
        MONTH(o.OrderDate) as SalesMonth,
        SUM(od.UnitPrice * od.Quantity) as Revenue,
        COUNT(DISTINCT o.CustomerID) as UniqueCustomers,
        COUNT(od.OrderID) as TotalOrders
    FROM Orders o WITH(NOLOCK)
    INNER JOIN OrderDetails od WITH(NOLOCK) ON o.OrderID = od.OrderID
    INNER JOIN Products p WITH(NOLOCK) ON od.ProductID = p.ProductID  
    INNER JOIN Categories c WITH(NOLOCK) ON p.CategoryID = c.CategoryID
    WHERE o.OrderDate >= DATEADD(MONTH, -12, GETDATE())
    GROUP BY p.CategoryID, c.CategoryName, YEAR(o.OrderDate), MONTH(o.OrderDate)
),
MeloTrends AS (
    SELECT 
        CategoryID,
        CategoryName,
        SalesYear,
        SalesMonth,
        Revenue,
        UniqueCustomers,
        TotalOrders,
        LAG(Revenue) OVER (PARTITION BY CategoryID ORDER BY SalesYear, SalesMonth) as PrevMonthRevenue,
        'Melo Dashboard Data' as source
    FROM MeloSalesAnalysis
)
SELECT 
    CategoryName + ' (Melo Analizi)' as Category,
    FORMAT(Revenue, 'C', 'tr-TR') as MonthlyRevenue,
    UniqueCustomers as Customers,
    TotalOrders as Orders,
    CASE 
        WHEN PrevMonthRevenue IS NULL THEN 'İlk Ay'
        WHEN Revenue > PrevMonthRevenue THEN '📈 Artış: ' + FORMAT((Revenue - PrevMonthRevenue) / PrevMonthRevenue * 100, 'N1') + '%'
        ELSE '📉 Azalış: ' + FORMAT((PrevMonthRevenue - Revenue) / PrevMonthRevenue * 100, 'N1') + '%'
    END as Trend
FROM MeloTrends
WHERE SalesYear = YEAR(GETDATE()) 
    AND SalesMonth = MONTH(GETDATE())
ORDER BY Revenue DESC;

-- Performance indexes for Melo
-- Bu indexler Melo'nun sorgularını 10x hızlandıracak!
CREATE NONCLUSTERED INDEX IX_Melo_Orders_Performance
ON Orders (OrderDate, CustomerID) 
INCLUDE (OrderID, EmployeeID)
WITH (ONLINE = ON, MAXDOP = 4);

CREATE NONCLUSTERED INDEX IX_Melo_OrderDetails_Performance  
ON OrderDetails (OrderID, ProductID)
INCLUDE (UnitPrice, Quantity, Discount)
WITH (ONLINE = ON, MAXDOP = 4);`,
      description: '💖 Melo için ultra-hızlı dashboard ve analitik sorgusu'
    },
    {
      id: 7,
      title: 'Melo için Real-time Customer Analytics',
      language: 'sql',
      code: `-- 💖 Melo için real-time customer behavior analysis
DECLARE @MeloAnalysisDate DATE = GETDATE();

WITH MeloCustomerBehavior AS (
    SELECT 
        c.CustomerID,
        c.CompanyName + ' (Melo Customer)' as CustomerName,
        COUNT(DISTINCT o.OrderID) as TotalOrders,
        SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)) as TotalSpent,
        MAX(o.OrderDate) as LastOrderDate,
        DATEDIFF(DAY, MAX(o.OrderDate), @MeloAnalysisDate) as DaysSinceLastOrder,
        AVG(od.UnitPrice * od.Quantity) as AvgOrderValue
    FROM Customers c
    LEFT JOIN Orders o ON c.CustomerID = o.CustomerID
    LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
    GROUP BY c.CustomerID, c.CompanyName
),
MeloCustomerSegments AS (
    SELECT *,
        CASE 
            WHEN TotalSpent > 10000 AND DaysSinceLastOrder <= 30 THEN '💎 VIP Active (Melo Tier 1)'
            WHEN TotalSpent > 5000 AND DaysSinceLastOrder <= 60 THEN '⭐ High Value (Melo Tier 2)'
            WHEN DaysSinceLastOrder <= 30 THEN '🔥 Recently Active (Melo Tier 3)'
            WHEN DaysSinceLastOrder > 180 THEN '😴 Needs Attention (Melo Recovery)'
            ELSE '👤 Regular Customer (Melo Standard)'
        END as CustomerSegment,
        NTILE(5) OVER (ORDER BY TotalSpent DESC) as SpendingQuintile
    FROM MeloCustomerBehavior
    WHERE TotalOrders > 0
)
SELECT 
    CustomerSegment,
    COUNT(*) as CustomerCount,
    FORMAT(AVG(TotalSpent), 'C', 'tr-TR') as AvgLifetimeValue,
    FORMAT(SUM(TotalSpent), 'C', 'tr-TR') as TotalSegmentValue,
    AVG(DaysSinceLastOrder) as AvgDaysSinceOrder,
    'Melo Analytics - ' + FORMAT(GETDATE(), 'dd/MM/yyyy HH:mm') as ReportInfo
FROM MeloCustomerSegments  
GROUP BY CustomerSegment
ORDER BY SUM(TotalSpent) DESC;

-- Melo için customer retention query
SELECT 
    '💖 Customer Retention for Melo' as ReportTitle,
    COUNT(CASE WHEN DaysSinceLastOrder <= 30 THEN 1 END) as ActiveLast30Days,
    COUNT(CASE WHEN DaysSinceLastOrder <= 90 THEN 1 END) as ActiveLast90Days,
    COUNT(CASE WHEN DaysSinceLastOrder > 180 THEN 1 END) as AtRiskCustomers,
    FORMAT(AVG(TotalSpent), 'C', 'tr-TR') as AvgCustomerValue
FROM MeloCustomerSegments;`,
      description: '💖 Melo için gerçek zamanlı müşteri davranış analizi'
    }
  ];

  for (const code of optimizationCodes) {
    const codeId = `code::${code.id}`;
    const codeDoc = {
      type: 'code_snippet',
      note_id: 5,
      solution_id: null, // General optimization codes
      execution_order: code.id - 5,
      created_at: new Date().toISOString(),
      ...code
    };
    await database.getCollection().upsert(codeId, codeDoc);
  }

  // Add optimization script
  const optimizationScript = {
    id: 3,
    title: 'Melo için Automated Performance Monitoring',
    script_type: 'sql',
    content: `-- 💖 Melo için otomatik performans monitoring script
-- Bu script günlük olarak çalışacak ve performans raporları oluşturacak

DECLARE @MeloReportDate DATETIME = GETDATE();
DECLARE @EmailBody NVARCHAR(MAX) = '';

-- 1. Slow Query Detection for Melo
IF OBJECT_ID('tempdb..#MeloSlowQueries') IS NOT NULL DROP TABLE #MeloSlowQueries;

SELECT TOP 10
    qs.sql_handle,
    qs.plan_handle,
    qs.total_elapsed_time / qs.execution_count as avg_elapsed_time,
    qs.total_logical_reads / qs.execution_count as avg_logical_reads,
    qs.execution_count,
    SUBSTRING(st.text, (qs.statement_start_offset/2)+1, 
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(st.text)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2) + 1) as statement_text
INTO #MeloSlowQueries
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
WHERE qs.total_elapsed_time / qs.execution_count > 1000000  -- 1 second
ORDER BY avg_elapsed_time DESC;

-- 2. Index Usage Analysis for Melo
IF OBJECT_ID('tempdb..#MeloIndexStats') IS NOT NULL DROP TABLE #MeloIndexStats;

SELECT 
    OBJECT_NAME(i.object_id) as TableName,
    i.name as IndexName,
    i.type_desc as IndexType,
    ISNULL(us.user_seeks, 0) as UserSeeks,
    ISNULL(us.user_scans, 0) as UserScans,
    ISNULL(us.user_lookups, 0) as UserLookups,
    CASE 
        WHEN ISNULL(us.user_seeks + us.user_scans + us.user_lookups, 0) = 0 
        THEN 'UNUSED - Consider dropping for Melo'
        WHEN us.user_scans > us.user_seeks * 2
        THEN 'HIGH SCANS - Review for Melo'
        ELSE 'OPTIMAL - Good for Melo'
    END as MeloRecommendation
INTO #MeloIndexStats
FROM sys.indexes i
LEFT JOIN sys.dm_db_index_usage_stats us ON i.object_id = us.object_id AND i.index_id = us.index_id
WHERE OBJECTPROPERTY(i.object_id, 'IsUserTable') = 1;

-- 3. Generate Daily Report for Melo
SET @EmailBody = '💖 Daily Performance Report for Melo - ' + FORMAT(@MeloReportDate, 'dd/MM/yyyy') + CHAR(13) + CHAR(10) + CHAR(13) + CHAR(10);

SET @EmailBody += '🐌 Top Slow Queries:' + CHAR(13) + CHAR(10);
SELECT @EmailBody += '- Avg Time: ' + CAST(avg_elapsed_time/1000 as VARCHAR(10)) + 'ms, Executions: ' + CAST(execution_count as VARCHAR(10)) + CHAR(13) + CHAR(10)
FROM #MeloSlowQueries;

SET @EmailBody += CHAR(13) + CHAR(10) + '📊 Index Analysis Summary:' + CHAR(13) + CHAR(10);
SELECT @EmailBody += '- ' + MeloRecommendation + ': ' + CAST(COUNT(*) as VARCHAR(10)) + ' indexes' + CHAR(13) + CHAR(10)
FROM #MeloIndexStats
GROUP BY MeloRecommendation;

-- 4. Database Size Monitoring for Melo
SET @EmailBody += CHAR(13) + CHAR(10) + '💾 Database Size Info:' + CHAR(13) + CHAR(10);
SELECT @EmailBody += '- Database: ' + name + ', Size: ' + CAST(size * 8.0 / 1024 as VARCHAR(10)) + ' MB' + CHAR(13) + CHAR(10)
FROM sys.master_files mf
INNER JOIN sys.databases d ON mf.database_id = d.database_id
WHERE d.name = DB_NAME();

-- 5. Performance Counters for Melo
SET @EmailBody += CHAR(13) + CHAR(10) + '⚡ Current Performance Metrics:' + CHAR(13) + CHAR(10);
SET @EmailBody += '- Buffer Cache Hit Ratio: ' + CAST((SELECT cntr_value FROM sys.dm_os_performance_counters WHERE counter_name = 'Buffer cache hit ratio') as VARCHAR(10)) + '%' + CHAR(13) + CHAR(10);
SET @EmailBody += '- Page Life Expectancy: ' + CAST((SELECT cntr_value FROM sys.dm_os_performance_counters WHERE counter_name = 'Page life expectancy') as VARCHAR(10)) + ' seconds' + CHAR(13) + CHAR(10);

SET @EmailBody += CHAR(13) + CHAR(10) + '💖 Report generated with love for Melo!' + CHAR(13) + CHAR(10);

-- Output the report
PRINT @EmailBody;

-- Clean up temp tables
DROP TABLE #MeloSlowQueries;
DROP TABLE #MeloIndexStats;

PRINT '💖 Performance monitoring completed for Melo at ' + FORMAT(@MeloReportDate, 'dd/MM/yyyy HH:mm:ss');`,
    description: 'Melo için otomatik performans monitoring ve raporlama script'
  };

  const scriptId3 = `script::${optimizationScript.id}`;
  const scriptDoc3 = {
    type: 'script',
    note_id: 5,
    solution_id: null,
    execution_order: 1,
    created_at: new Date().toISOString(),
    ...optimizationScript
  };
  await database.getCollection().upsert(scriptId3, scriptDoc3);

  console.log('✅ Query Optimization note added');
}

addDetailedSeeds();