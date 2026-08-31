require('dotenv').config();
const { MongoClient } = require('mongodb');

// Get connections from environment or arguments
const localUri = process.env.MONGODB_URI_LOCAL || 'mongodb://127.0.0.1:27017';
let atlasUri = process.env.MONGODB_URI_ATLAS || process.argv[2];

const DB_NAME = 'shopweb';

async function runSync() {
    console.log('==================================================');
    console.log('       MONGODB LOCAL TO ATLAS SYNC TOOL');
    console.log('==================================================\n');

    // Check if Atlas URI is provided and valid
    if (!atlasUri || atlasUri.includes('<username>') || atlasUri.includes('<password>')) {
        console.error('Lỗi: Bạn chưa cấu hình đường dẫn MongoDB Atlas (MONGODB_URI_ATLAS).');
        console.log('\nHướng dẫn:');
        console.log('1. Mở file `.env` ở thư mục gốc dự án.');
        console.log('2. Thay thế `MONGODB_URI_ATLAS` bằng đường dẫn Connection String của bạn từ MongoDB Atlas.');
        console.log('   Ví dụ: MONGODB_URI_ATLAS=mongodb+srv://myUser:myPassword@cluster0.xxxx.mongodb.net/shopweb?retryWrites=true&w=majority');
        console.log('3. Chạy lại lệnh này.');
        console.log('\nHoặc bạn có thể truyền trực tiếp đường dẫn làm tham số khi chạy script:');
        console.log('   node sync-to-atlas.js "mongodb+srv://username:password@your-cluster.mongodb.net/shopweb"\n');
        process.exit(1);
    }

    let localClient, atlasClient;

    try {
        // 1. Connect to Local MongoDB
        console.log(`[1/4] Kết nối đến database local...`);
        console.log(`      Local URI: ${localUri}`);
        localClient = new MongoClient(localUri);
        await localClient.connect();
        const localDb = localClient.db(DB_NAME);
        console.log(`      => Kết nối local thành công!\n`);

        // 2. Connect to Atlas MongoDB
        console.log(`[2/4] Kết nối đến database MongoDB Atlas...`);
        // Extract database name from connection string if possible, or fallback to 'shopweb'
        let atlasDbName = DB_NAME;
        try {
            const urlObj = new URL(atlasUri.replace('mongodb+srv://', 'http://')); // simple parser hack for connection strings
            const pathName = urlObj.pathname.split('?')[0].replace('/', '');
            if (pathName) {
                atlasDbName = pathName;
            }
        } catch (e) {
            // Keep default
        }

        console.log(`      Atlas Database Target: ${atlasDbName}`);
        atlasClient = new MongoClient(atlasUri);
        await atlasClient.connect();
        const atlasDb = atlasClient.db(atlasDbName);
        console.log(`      => Kết nối Atlas thành công!\n`);

        // 3. Get collections from local
        console.log(`[3/4] Đang lấy danh sách các collection từ local...`);
        const collections = await localDb.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);
        
        if (collectionNames.length === 0) {
            console.log('      ⚠️  Không tìm thấy collection nào ở database local. Bạn đã chạy server để tạo dữ liệu chưa?');
            console.log('      Script sẽ tự kết thúc.');
            return;
        }

        console.log(`      Tìm thấy ${collectionNames.length} collections: ${collectionNames.join(', ')}\n`);

        // 4. Migrate each collection
        console.log(`[4/4] Bắt đầu đồng bộ dữ liệu sang Atlas (Ghi đè/Đồng bộ mới)...`);
        
        for (const colName of collectionNames) {
            console.log(`--------------------------------------------------`);
            console.log(`Collection: "${colName}"`);
            
            // Get local data
            const localCollection = localDb.collection(colName);
            const documents = await localCollection.find({}).toArray();
            console.log(`  - Local: Đọc được ${documents.length} bản ghi.`);

            if (documents.length === 0) {
                console.log(`  - Bỏ qua vì không có dữ liệu để đồng bộ.`);
                continue;
            }

            // Target collection in Atlas
            const atlasCollection = atlasDb.collection(colName);

            // Clear old data on Atlas for this collection to avoid duplication / conflict with _id
            console.log(`  - Atlas: Đang xóa dữ liệu cũ trong collection "${colName}" trên Atlas để tránh trùng lặp...`);
            await atlasCollection.deleteMany({});

            // Insert data
            console.log(`  - Atlas: Đang tải lên ${documents.length} bản ghi...`);
            const insertResult = await atlasCollection.insertMany(documents);
            console.log(`  - Thành công: Đã tải lên ${insertResult.insertedCount} bản ghi.`);
        }

        console.log(`\n==================================================`);
        console.log('🎉 ĐỒNG BỘ DỮ LIỆU LÊN MONGO ATLAS THÀNH CÔNG!');
        console.log('==================================================');
        console.log('\nCác bước tiếp theo của bạn:');
        console.log('1. Mở file `.env` ở thư mục gốc của dự án.');
        console.log('2. Thay đổi biến `MONGODB_URI` thành giá trị của `MONGODB_URI_ATLAS`.');
        console.log('   Ví dụ:');
        console.log('   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxx.mongodb.net/shopweb?retryWrites=true&w=majority');
        console.log('3. Khởi động lại Server (chạy `npm start` hoặc `node server.js`).');
        console.log('4. Bây giờ ứng dụng web của bạn sẽ đọc và ghi trực tiếp từ MongoDB Atlas!\n');

    } catch (err) {
        console.error('\n❌ Đã xảy ra lỗi trong quá trình đồng bộ:');
        console.error(err);
    } finally {
        // Close clients
        if (localClient) await localClient.close();
        if (atlasClient) await atlasClient.close();
        console.log('Đã đóng kết nối cơ sở dữ liệu.');
    }
}

runSync();
