require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('./db');

const PORT = 5000;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
    // Log incoming requests
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    
    // Enable CORS for API robustness
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Helper to decode Base64 data URLs and save as files in /uploads/
    const saveBase64Image = (base64Str) => {
        if (!base64Str || !base64Str.startsWith('data:')) return base64Str;
        try {
            const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) return base64Str;
            
            const ext = matches[1].split('/')[1] || 'png';
            const buffer = Buffer.from(matches[2], 'base64');
            const filename = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
            const uploadsDir = path.join(__dirname, 'uploads');
            
            // Create uploads directory if it doesn't exist
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            fs.writeFileSync(path.join(uploadsDir, filename), buffer);
            return `/uploads/${filename}`;
        } catch (e) {
            console.error('Lỗi khi lưu file upload:', e);
            return base64Str;
        }
    };

    // Buffer read request body helper
    const readBody = (req) => {
        return new Promise((resolve) => {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => { resolve(body); });
        });
    };

    // Static URL Normalization
    let normalizedUrl = req.url.split('?')[0];
    if (normalizedUrl === '/' || normalizedUrl === '/shopweb' || normalizedUrl === '/shopweb/') {
        normalizedUrl = '/index.html';
    }

    // ----------------------------------------------------
    // API ROUTES (MongoDB Backend)
    // ----------------------------------------------------

    // Route: Fetch entire database as JSON (simulates public db.json file)
    if (normalizedUrl === '/db.json' || normalizedUrl === '/shopweb/db.json') {
        try {
            const packagesColl = db.getPackagesCollection();
            const faqsColl = db.getFaqsCollection();
            const galleryColl = db.getGalleryCollection();
            const submissionsColl = db.getSubmissionsCollection();
            const contactColl = db.getContactCollection();

            // Fetch all collections in parallel
            const [packages, faqs, gallery, submissions, contactDoc] = await Promise.all([
                packagesColl.find().toArray(),
                faqsColl.find().toArray(),
                galleryColl.find().toArray(),
                submissionsColl.find().toArray(),
                contactColl.findOne({ _id: 'default_contact' })
            ]);

            const assembledDb = {
                packages: packages.map(({ _id, ...rest }) => rest),
                faqs: faqs.map(({ _id, ...rest }) => rest),
                gallery: gallery.map(({ _id, ...rest }) => rest),
                submissions: submissions.map(({ _id, ...rest }) => rest),
                contact: contactDoc ? (() => { const { _id, ...rest } = contactDoc; return rest; })() : {}
            };

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(assembledDb));
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu từ MongoDB:', error);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: 'Lỗi truy vấn cơ sở dữ liệu' }));
        }
        return;
    }

    // Route: Form submission handler -> write directly to MongoDB
    if ((normalizedUrl === '/submissions' || normalizedUrl === '/shopweb/submissions') && req.method === 'POST') {
        try {
            const body = await readBody(req);
            const newSubmission = JSON.parse(body);
            
            await db.getSubmissionsCollection().insertOne(newSubmission);
            
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, message: 'Đăng ký đã được lưu vào MongoDB' }));
        } catch (e) {
            console.error('Lỗi xử lý đăng ký tư vấn:', e);
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ hoặc lỗi lưu trữ' }));
        }
        return;
    }

    // Route: Admin Login
    if (normalizedUrl === '/api/login' && req.method === 'POST') {
        try {
            const body = await readBody(req);
            const { username, password } = JSON.parse(body);
            
            const adminDoc = await db.getAdminCollection().findOne({ _id: 'admin_credentials' });
            const admin = adminDoc || { username: 'admin', password: 'password123' };
            
            if (username === admin.username && password === admin.password) {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: true, token: 'active_session_admin' }));
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác' }));
            }
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }));
        }
        return;
    }

    // Route: Update general contact settings
    if (normalizedUrl === '/api/settings' && req.method === 'POST') {
        try {
            const body = await readBody(req);
            const newSettings = JSON.parse(body);
            
            await db.getContactCollection().updateOne(
                { _id: 'default_contact' },
                { $set: newSettings },
                { upsert: true }
            );

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, message: 'Cập nhật cài đặt thành công' }));
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }));
        }
        return;
    }

    // Route: Delete submission request
    if (normalizedUrl === '/api/submissions/delete' && req.method === 'POST') {
        try {
            const body = await readBody(req);
            const { id } = JSON.parse(body);
            
            await db.getSubmissionsCollection().deleteOne({ id: Number(id) });

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, message: 'Xóa yêu cầu tư vấn thành công' }));
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }));
        }
        return;
    }

    // Route: Add new gallery item
    if (normalizedUrl === '/api/gallery' && req.method === 'POST') {
        try {
            const body = await readBody(req);
            const newItem = JSON.parse(body);
            
            // Save uploaded files if they are Base64 strings
            newItem.src = saveBase64Image(newItem.src);
            newItem.thumb = saveBase64Image(newItem.thumb);

            await db.getGalleryCollection().insertOne(newItem);

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, message: 'Thêm sản phẩm thư viện mới thành công' }));
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }));
        }
        return;
    }

    // Route: Update gallery item
    if (normalizedUrl === '/api/gallery/update' && req.method === 'POST') {
        try {
            const body = await readBody(req);
            const updatedItem = JSON.parse(body);
            
            // Save uploaded files if they are Base64 strings
            updatedItem.src = saveBase64Image(updatedItem.src);
            updatedItem.thumb = saveBase64Image(updatedItem.thumb);

            // Strip _id if it was accidentally passed in from client to prevent Mongo immutable error
            delete updatedItem._id;

            await db.getGalleryCollection().updateOne(
                { id: Number(updatedItem.id) },
                { $set: updatedItem },
                { upsert: true }
            );

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, message: 'Cập nhật sản phẩm thư viện thành công' }));
        } catch (e) {
            console.error('Lỗi cập nhật thư viện:', e);
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }));
        }
        return;
    }

    // Route: Delete gallery item
    if (normalizedUrl === '/api/gallery/delete' && req.method === 'POST') {
        try {
            const body = await readBody(req);
            const { id } = JSON.parse(body);
            
            await db.getGalleryCollection().deleteOne({ id: Number(id) });

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, message: 'Xóa sản phẩm thư viện thành công' }));
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }));
        }
        return;
    }

    // ----------------------------------------------------
    // STATIC FILE SERVER
    // ----------------------------------------------------

    // Map URL path to file system path
    let filePath = path.join(__dirname, normalizedUrl);

    // Security check: ensure filePath is within the workspace directory
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Access Denied');
        return;
    }

    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log(`404 File Not Found: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 Không Tìm Thấy Trang</h1><p>Vui lòng kiểm tra lại đường dẫn.</p>');
            } else {
                console.error(`Lỗi hệ thống khi đọc file: ${err.code}`);
                res.writeHead(500);
                res.end(`Lỗi máy chủ: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

let port = 5000;

async function startServer() {
    try {
        // Wait for Database connection & Seeding
        await db.initDb();
        
        server.listen(port, () => {
            console.log(`==================================================`);
            console.log(`  SHOP CÓ WEB SERVER ĐANG CHẠY TRÊN MONGODB`);
            console.log(`  Địa chỉ: http://localhost:${port}/`);
            console.log(`  Nhấn Ctrl+C trong terminal để dừng server.`);
            console.log(`==================================================`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Cổng ${port} đã bận, đang thử cổng tiếp theo ${port + 1}...`);
                port++;
                startServer();
            } else {
                console.error('Lỗi khi chạy máy chủ:', err);
            }
        });
    } catch (error) {
        console.error('Không thể khởi chạy máy chủ do lỗi kết nối Database:', error);
        process.exit(1);
    }
}

startServer();
