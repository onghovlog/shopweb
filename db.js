const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = 'shopweb';

let client = null;
let db = null;

// Collections references
const collections = {
    packages: null,
    faqs: null,
    gallery: null,
    submissions: null,
    contact: null,
    admin: null
};

/**
 * Initialize MongoDB connection and perform auto-migration if needed
 */
async function initDb() {
    try {
        console.log(`[Database] Đang kết nối đến MongoDB tại: ${MONGO_URI}...`);
        client = new MongoClient(MONGO_URI);
        await client.connect();
        db = client.db(DB_NAME);
        
        console.log('[Database] Kết nối MongoDB thành công!');

        // Set references
        collections.packages = db.collection('packages');
        collections.faqs = db.collection('faqs');
        collections.gallery = db.collection('gallery');
        collections.submissions = db.collection('submissions');
        collections.contact = db.collection('contact');
        collections.admin = db.collection('admin');

        // Check if database needs seeding/migration
        const packageCount = await collections.packages.countDocuments();
        if (packageCount === 0) {
            console.log('[Database] MongoDB đang trống. Tiến hành kiểm tra và di chuyển dữ liệu từ db.json...');
            await runMigration();
        } else {
            console.log('[Database] Đã tìm thấy dữ liệu hiện có trong MongoDB. Bỏ qua bước di chuyển.');
        }

    } catch (error) {
        console.error('[Database] Lỗi kết nối hoặc khởi tạo cơ sở dữ liệu MongoDB:', error);
        throw error;
    }
}

/**
 * Migrate data from db.json file to MongoDB collections
 */
async function runMigration() {
    const dbJsonPath = path.join(__dirname, 'db.json');
    if (!fs.existsSync(dbJsonPath)) {
        console.log('[Database] Không tìm thấy tệp db.json cục bộ để di chuyển.');
        return;
    }

    try {
        const fileContent = fs.readFileSync(dbJsonPath, 'utf8');
        const dbData = JSON.parse(fileContent);
        
        console.log('[Database] Đang đọc dữ liệu từ tệp db.json...');

        // 1. Migrate Packages
        if (dbData.packages && dbData.packages.length > 0) {
            await collections.packages.insertMany(dbData.packages);
            console.log(`[Database] Đã chuyển ${dbData.packages.length} gói dịch vụ.`);
        }

        // 2. Migrate FAQs
        if (dbData.faqs && dbData.faqs.length > 0) {
            await collections.faqs.insertMany(dbData.faqs);
            console.log(`[Database] Đã chuyển ${dbData.faqs.length} câu hỏi FAQ.`);
        }

        // 3. Migrate Gallery
        if (dbData.gallery && dbData.gallery.length > 0) {
            await collections.gallery.insertMany(dbData.gallery);
            console.log(`[Database] Đã chuyển ${dbData.gallery.length} sản phẩm thư viện.`);
        }

        // 4. Migrate Submissions
        if (dbData.submissions && dbData.submissions.length > 0) {
            await collections.submissions.insertMany(dbData.submissions);
            console.log(`[Database] Đã chuyển ${dbData.submissions.length} yêu cầu đăng ký tư vấn.`);
        }

        // 5. Migrate Contact Info (Store as single setting document)
        if (dbData.contact && Object.keys(dbData.contact).length > 0) {
            await collections.contact.updateOne(
                { _id: 'default_contact' },
                { $set: dbData.contact },
                { upsert: true }
            );
            console.log('[Database] Đã chuyển thông tin liên hệ.');
        }

        // 6. Migrate Admin Credentials
        if (dbData.admin && Object.keys(dbData.admin).length > 0) {
            await collections.admin.updateOne(
                { _id: 'admin_credentials' },
                { $set: dbData.admin },
                { upsert: true }
            );
            console.log('[Database] Đã chuyển tài khoản admin.');
        } else {
            // Seed a default admin credentials if not present
            await collections.admin.updateOne(
                { _id: 'admin_credentials' },
                { $set: { username: 'admin', password: '123' } },
                { upsert: true }
            );
            console.log('[Database] Khởi tạo tài khoản admin mặc định (admin/123).');
        }

        // Rename db.json to db.json.bak as backup
        const backupPath = `${dbJsonPath}.bak`;
        fs.renameSync(dbJsonPath, backupPath);
        console.log(`[Database] Đồng bộ dữ liệu hoàn tất! Tệp db.json đã được lưu trữ dự phòng tại: ${backupPath}`);

    } catch (error) {
        console.error('[Database] Có lỗi xảy ra trong quá trình di chuyển dữ liệu:', error);
        throw error;
    }
}

module.exports = {
    initDb,
    getPackagesCollection: () => collections.packages,
    getFaqsCollection: () => collections.faqs,
    getGalleryCollection: () => collections.gallery,
    getSubmissionsCollection: () => collections.submissions,
    getContactCollection: () => collections.contact,
    getAdminCollection: () => collections.admin,
    getDb: () => db,
    getClient: () => client
};
