const http = require('http');
const fs = require('fs');
const path = require('path');

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

const server = http.createServer((req, res) => {
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

    // Helper to read db.json
    const readDb = (callback) => {
        const dbPath = path.join(__dirname, 'db.json');
        fs.readFile(dbPath, 'utf8', (err, data) => {
            let db = { packages: [], faqs: [], submissions: [], contact: {}, admin: {} };
            if (!err && data) {
                try {
                    db = JSON.parse(data);
                } catch (e) {
                    console.error('Lỗi parse db.json', e);
                }
            }
            callback(db);
        });
    };

    // Helper to write db.json
    const writeDb = (db, res, successMessage, successData = {}) => {
        const dbPath = path.join(__dirname, 'db.json');
        fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Ghi db.json thất bại:', err);
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Lỗi ghi tệp cơ sở dữ liệu' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: true, message: successMessage, ...successData }));
            }
        });
    };

    // Buffer read request body helper
    const readBody = (req, callback) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => { callback(body); });
    };

    // Route: Form submission handler -> write directly to db.json
    if ((req.url === '/submissions' || req.url === '/shopweb/submissions') && req.method === 'POST') {
        readBody(req, (body) => {
            try {
                const newSubmission = JSON.parse(body);
                readDb((db) => {
                    if (!db.submissions) db.submissions = [];
                    db.submissions.push(newSubmission);
                    writeDb(db, res, 'Đăng ký đã được lưu vào db.json');
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }));
            }
        });
        return;
    }

    // Route: Admin Login
    if (req.url === '/api/login' && req.method === 'POST') {
        readBody(req, (body) => {
            try {
                const { username, password } = JSON.parse(body);
                readDb((db) => {
                    const admin = db.admin || { username: 'admin', password: 'password123' };
                    if (username === admin.username && password === admin.password) {
                        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify({ success: true, token: 'active_session_admin' }));
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác' }));
                    }
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }));
            }
        });
        return;
    }

    // Route: Update general contact settings
    if (req.url === '/api/settings' && req.method === 'POST') {
        readBody(req, (body) => {
            try {
                const newSettings = JSON.parse(body);
                readDb((db) => {
                    db.contact = newSettings;
                    writeDb(db, res, 'Cập nhật cài đặt thành công');
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }));
            }
        });
        return;
    }

    // Route: Delete submission request
    if (req.url === '/api/submissions/delete' && req.method === 'POST') {
        readBody(req, (body) => {
            try {
                const { id } = JSON.parse(body);
                readDb((db) => {
                    if (db.submissions) {
                        db.submissions = db.submissions.filter(sub => sub.id !== id);
                    }
                    writeDb(db, res, 'Xóa yêu cầu tư vấn thành công');
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }));
            }
        });
        return;
    }

    // Route: Add new gallery item
    if (req.url === '/api/gallery' && req.method === 'POST') {
        readBody(req, (body) => {
            try {
                const newItem = JSON.parse(body);
                // Save uploaded files if they are Base64 strings
                newItem.src = saveBase64Image(newItem.src);
                newItem.thumb = saveBase64Image(newItem.thumb);

                readDb((db) => {
                    if (!db.gallery) db.gallery = [];
                    db.gallery.push(newItem);
                    writeDb(db, res, 'Thêm sản phẩm thư viện mới thành công');
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }));
            }
        });
        return;
    }

    // Route: Update gallery item
    if (req.url === '/api/gallery/update' && req.method === 'POST') {
        readBody(req, (body) => {
            try {
                const updatedItem = JSON.parse(body);
                // Save uploaded files if they are Base64 strings
                updatedItem.src = saveBase64Image(updatedItem.src);
                updatedItem.thumb = saveBase64Image(updatedItem.thumb);

                readDb((db) => {
                    if (db.gallery) {
                        db.gallery = db.gallery.map(item => item.id === updatedItem.id ? updatedItem : item);
                    }
                    writeDb(db, res, 'Cập nhật sản phẩm thư viện thành công');
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }));
            }
        });
        return;
    }

    // Route: Delete gallery item
    if (req.url === '/api/gallery/delete' && req.method === 'POST') {
        readBody(req, (body) => {
            try {
                const { id } = JSON.parse(body);
                readDb((db) => {
                    if (db.gallery) {
                        db.gallery = db.gallery.filter(item => item.id !== id);
                    }
                    writeDb(db, res, 'Xóa sản phẩm thư viện thành công');
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }));
            }
        });
        return;
    }

    // Static files handler
    let normalizedUrl = req.url.split('?')[0];
    if (normalizedUrl === '/' || normalizedUrl === '/shopweb' || normalizedUrl === '/shopweb/') {
        normalizedUrl = '/index.html';
    }

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

function startServer() {
    server.listen(port, () => {
        console.log(`==================================================`);
        console.log(`  SHOP CÓ WEB SERVER ĐANG CHẠY CỤC BỘ`);
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
}

startServer();
