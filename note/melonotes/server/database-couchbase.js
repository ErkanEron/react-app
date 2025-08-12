const couchbase = require('couchbase');
const bcrypt = require('bcryptjs');
require('dotenv').config();

class CouchbaseDatabase {
  constructor() {
    this.cluster = null;
    this.bucket = null;
    this.collection = null;
    this.scope = null;
    
    this.init();
  }

  async init() {
    try {
      // Couchbase Capella connection
      const connectionString = 'couchbases://cb.8ezgeensktp1zfgd.cloud.couchbase.com';
      
      // Environment variables for credentials
      const username = process.env.COUCHBASE_USERNAME;
      const password = process.env.COUCHBASE_PASSWORD;
      const bucketName = process.env.COUCHBASE_BUCKET || 'melonotes';
      
      console.log('💖 Connecting to Couchbase Capella for Melo...');
      
      // Connect to cluster
      this.cluster = await couchbase.connect(connectionString, {
        username: username,
        password: password,
        configProfile: 'wanDevelopment'
      });
      
      // Get bucket
      this.bucket = this.cluster.bucket(bucketName);
      this.collection = this.bucket.defaultCollection();
      
      console.log('💝 Successfully connected to Couchbase Capella for Melo! 💖');
      
      // Initialize data
      await this.createIndexes();
      await this.createDefaultUser();
      await this.createSeedData();
      
    } catch (error) {
      console.error('💔 Couchbase connection error:', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      const bucketName = process.env.COUCHBASE_BUCKET || 'melonotes';
      
      // Create primary index
      await this.cluster.query(`CREATE PRIMARY INDEX ON \`${bucketName}\``, {
        adhoc: true
      });
      
      // Create secondary indexes
      const indexes = [
        `CREATE INDEX idx_user_username ON \`${bucketName}\`(username) WHERE type = "user"`,
        `CREATE INDEX idx_note_category ON \`${bucketName}\`(category_id) WHERE type = "note"`,
        `CREATE INDEX idx_note_status ON \`${bucketName}\`(status) WHERE type = "note"`,
        `CREATE INDEX idx_solution_note ON \`${bucketName}\`(note_id) WHERE type = "solution"`,
        `CREATE INDEX idx_script_note ON \`${bucketName}\`(note_id) WHERE type = "script"`,
        `CREATE INDEX idx_code_note ON \`${bucketName}\`(note_id) WHERE type = "code_snippet"`
      ];
      
      for (const indexQuery of indexes) {
        try {
          await this.cluster.query(indexQuery, { adhoc: true });
        } catch (err) {
          // Index might already exist, ignore error
          if (!err.message.includes('already exists') && !err.message.includes('Index already exists')) {
            console.warn('Index creation warning:', err.message);
          }
        }
      }
      
      console.log('💖 Couchbase indexes created for Melo!');
    } catch (error) {
      console.error('💔 Error creating indexes:', error);
    }
  }

  async createDefaultUser() {
    try {
      const userId = 'user::frieren';
      
      // Check if user already exists
      try {
        await this.collection.get(userId);
        console.log('💖 Default user already exists for Melo!');
        return;
      } catch (err) {
        // User doesn't exist, create it
      }
      
      const hashedPassword = bcrypt.hashSync('MeldaErkan!5352', 10);
      
      const userDoc = {
        type: 'user',
        id: 1,
        username: 'frieren',
        password: hashedPassword,
        created_at: new Date().toISOString()
      };
      
      await this.collection.upsert(userId, userDoc);
      console.log('💖 Default user "frieren" created for Melo!');
      
    } catch (error) {
      console.error('💔 Error creating default user:', error);
    }
  }

  async createSeedData() {
    try {
      // Check if seed data already exists
      const result = await this.cluster.query(
        'SELECT COUNT(*) as count FROM melonotes WHERE type = "note"'
      );
      
      const noteCount = result.rows[0].count;
      if (noteCount > 0) {
        console.log('💖 Seed data already exists for Melo!');
        return;
      }

      console.log('💝 Creating seed data with love for Melo...');
      
      // Create categories
      const categories = [
        { id: 1, name: 'Database Performance', color: '#FF6B6B' },
        { id: 2, name: 'SQL Sorgulama', color: '#4ECDC4' },
        { id: 3, name: 'Index Optimizasyonu', color: '#45B7D1' },
        { id: 4, name: 'Backup & Recovery', color: '#96CEB4' },
        { id: 5, name: 'Güvenlik', color: '#AB47BC' }
      ];

      // Insert categories
      for (const category of categories) {
        const categoryId = `category::${category.id}`;
        const categoryDoc = {
          type: 'category',
          ...category,
          created_at: new Date().toISOString()
        };
        await this.collection.upsert(categoryId, categoryDoc);
      }

      // Create tags
      const tags = [
        { id: 1, name: 'MSSQL', color: '#FF6B6B' },
        { id: 2, name: 'PostgreSQL', color: '#4ECDC4' },
        { id: 3, name: 'Performance', color: '#FF6348' },
        { id: 4, name: 'Indexing', color: '#A0E7E5' },
        { id: 5, name: 'Query Optimization', color: '#FFA726' },
        { id: 6, name: 'Backup', color: '#66BB6A' }
      ];

      // Insert tags
      for (const tag of tags) {
        const tagId = `tag::${tag.id}`;
        const tagDoc = {
          type: 'tag',
          ...tag,
          created_at: new Date().toISOString()
        };
        await this.collection.upsert(tagId, tagDoc);
      }

      // Create MELO notes
      await this.createMeloNotes();
      
      console.log('💖 Seed data created with detailed examples for Melo!');
    } catch (error) {
      console.error('💔 Error creating seed data:', error);
    }
  }

  async createMeloNotes() {
    const noteId1 = 'note::1';
    const noteDoc1 = {
      type: 'note',
      id: 1,
      title: 'MELO İÇİN ÖZEL - SQL Performance Problemi',
      problem: 'Sevgili Melo için özel hazırladığım bu not: E-commerce sitesinde ürün sorguları 15 saniye sürüyor ve müşterilerimizi bekletiyoruz.',
      problem_definition: 'Dashboard sayfasında kategori filtreleri çok yavaş çalışıyor. Her click 15+ saniye bekliyor.',
      analysis: 'Missing index var, full table scan yapıyor, JOIN optimizasyonu gerekli. Bu detaylı çözüm senin için hazırlandı Melo 💖',
      category_id: 1,
      priority: 3,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [1, 3, 4] // MSSQL, Performance, Indexing
    };

    await this.collection.upsert(noteId1, noteDoc1);

    // Create solution for note 1
    const solutionId1 = 'solution::1';
    const solutionDoc1 = {
      type: 'solution',
      id: 1,
      note_id: 1,
      plan_type: 'Plan A - Index Optimizasyonu',
      description: 'Eksik indexlerin eklenmesi ve mevcut indexlerin optimizasyonu',
      reasoning: 'En hızlı ve etkili çözüm. Minimal sistem etkisi ile maksimum performans artışı sağlar.',
      priority: 1,
      created_at: new Date().toISOString()
    };

    await this.collection.upsert(solutionId1, solutionDoc1);

    // Create steps for solution 1
    const steps = [
      '1. Query execution plan analizi yapılması',
      '2. Missing index recommendation\'ların incelenmesi', 
      '3. Composite index\'lerin tasarlanması',
      '4. Index implementation ve test edilmesi',
      '5. Production deployment ve monitoring'
    ];

    for (let i = 0; i < steps.length; i++) {
      const stepId = `step::${1}_${i + 1}`;
      const stepDoc = {
        type: 'step',
        id: `${1}_${i + 1}`,
        solution_id: 1,
        step_number: i + 1,
        description: steps[i],
        completed: i < 2, // First 2 steps completed
        created_at: new Date().toISOString()
      };
      await this.collection.upsert(stepId, stepDoc);
    }

    // Create code snippets for note 1
    const codeSnippets = [
      {
        id: 1,
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
        id: 2,
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
    ];

    for (const code of codeSnippets) {
      const codeId = `code::${code.id}`;
      const codeDoc = {
        type: 'code_snippet',
        note_id: 1,
        solution_id: 1,
        execution_order: code.id,
        created_at: new Date().toISOString(),
        ...code
      };
      await this.collection.upsert(codeId, codeDoc);
    }

    // Create scripts for note 1
    const scripts = [
      {
        id: 1,
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
      }
    ];

    for (const script of scripts) {
      const scriptId = `script::${script.id}`;
      const scriptDoc = {
        type: 'script',
        note_id: 1,
        solution_id: 1,
        execution_order: script.id,
        created_at: new Date().toISOString(),
        ...script
      };
      await this.collection.upsert(scriptId, scriptDoc);
    }

    // Create second note (Backup Strategy)
    const noteId2 = 'note::2';
    const noteDoc2 = {
      type: 'note',
      id: 2,
      title: 'Backup Strategy Optimization',
      problem: 'Mevcut backup sistemi çok yavaş ve sistem kaynaklarını aşırı kullanıyor. Gece backup işlemleri 6 saat sürüyor.',
      problem_definition: 'Production veritabanının backup işlemi sistem performansını ciddi şekilde etkilemekte ve RTO/RPO hedeflerine ulaşamıyoruz.',
      analysis: 'Full backup + differential backup stratejisi yeniden gözden geçirilmeli. Compression ve parallelization seçenekleri değerlendirilmeli.',
      category_id: 4,
      priority: 2,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [6] // Backup
    };

    await this.collection.upsert(noteId2, noteDoc2);
  }

  getCluster() {
    return this.cluster;
  }

  getBucket() {
    return this.bucket;
  }

  getCollection() {
    return this.collection;
  }

  async close() {
    if (this.cluster) {
      await this.cluster.close();
      console.log('💖 Couchbase connection closed gracefully');
    }
  }
}

module.exports = new CouchbaseDatabase();