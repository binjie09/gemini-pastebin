const express = require('express');
const router = express.Router();
const Paste = require('../models/Paste');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');

// Multer generic Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOAD_DIR || 'uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// POST /api/paste - Create a new paste (Text)
router.post('/', async (req, res) => {
    try {
        const { content, language, expiresAt } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const paste = new Paste({
            content,
            language: language || 'text',
            title: req.body.title || '',
            expiresAt: expiresAt ? new Date(expiresAt) : null
        });

        await paste.save();
        res.status(201).json(paste);
    } catch (error) {
        console.error('Create Paste Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Helper to attach file content
const getPasteWithContent = (paste) => {
    const pasteObj = paste.toObject();
    if (pasteObj.filepath) {
        // Only read text-based files into memory
        const isText = pasteObj.mimetype && (
            pasteObj.mimetype.startsWith('text/') ||
            pasteObj.mimetype === 'application/json' ||
            pasteObj.mimetype === 'application/javascript' ||
            pasteObj.mimetype === 'application/xml' ||
            !pasteObj.mimetype // Fallback for unknown types if needed, or maybe default to not reading
        );

        if (isText) {
            try {
                const absolutePath = path.resolve(pasteObj.filepath);
                if (fs.existsSync(absolutePath)) {
                    pasteObj.content = fs.readFileSync(absolutePath, 'utf-8');
                    if (pasteObj.content.length > 1000000) { // Safety cap 1MB
                        pasteObj.content = '(File too large to preview text)';
                    }
                } else {
                    pasteObj.content = '(File not found on server)';
                }
            } catch (e) {
                pasteObj.content = '(Error reading file)';
            }
        } else {
            // For binary files, content remains undefined or we can set a placeholder
            pasteObj.content = null;
        }
    }
    return pasteObj;
};

// GET /api/paste/:id - Get a paste
router.get('/:id', async (req, res) => {
    try {
        const paste = await Paste.findById(req.params.id);
        if (!paste) {
            return res.status(404).json({ error: 'Paste not found' });
        }

        if (paste.password) {
            const { password } = req.query;
            if (password) {
                const isMatch = await bcrypt.compare(password, paste.password);
                if (isMatch) return res.json(getPasteWithContent(paste));
            }

            return res.json({
                _id: paste._id,
                language: paste.language,
                isProtected: true,
                createdAt: paste.createdAt,
                filename: paste.filename
            });
        }
        res.json(getPasteWithContent(paste));
    } catch (error) {
        console.error('Get Paste Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// POST /api/upload - Handle file upload (CLI support mostly)
router.post('/upload', upload.single('f'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const paste = new Paste({
            filename: req.file.originalname,
            filepath: req.file.path,
            mimetype: req.file.mimetype,
            filesize: req.file.size,  // 保存文件大小
            language: 'autodetect',
            expiresAt: null,
            isPrivate: false
        });

        await paste.save();

        // CLI Output
        if (req.headers['user-agent'] && req.headers['user-agent'].includes('curl')) {
            // 优先使用 EXTERNAL_URL 环境变量，解决反代后协议和端口丢失问题
            let baseUrl;
            if (process.env.EXTERNAL_URL) {
                baseUrl = process.env.EXTERNAL_URL.replace(/\/$/, ''); // 移除末尾斜杠
            } else {
                const protocol = req.headers['x-forwarded-proto'] || req.protocol;
                const host = req.headers['x-forwarded-host'] || req.get('host');
                baseUrl = `${protocol}://${host}`;
            }
            return res.send(`URL: ${baseUrl}/${paste._id}\n`);
        }

        res.status(201).json(paste);

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// PUT /api/paste/:id - Update paste (Title only for now)
router.put('/:id', async (req, res) => {
    try {
        const { title, password } = req.body;
        const paste = await Paste.findById(req.params.id);

        if (!paste) {
            return res.status(404).json({ error: 'Paste not found' });
        }

        // Check password if protected
        if (paste.isPrivate && paste.password) {
            if (!password) {
                return res.status(401).json({ error: 'Password required' });
            }
            const isMatch = await bcrypt.compare(password, paste.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid Password' });
            }
        }

        paste.title = title || '';
        await paste.save();

        res.json(paste);
    } catch (error) {
        console.error('Update Paste Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/raw/:id - Get raw content (useful for curl/wget)
// 支持 ?inline=1 参数，在浏览器中内联显示而非下载
router.get('/raw/:id', async (req, res) => {
    try {
        const paste = await Paste.findById(req.params.id);
        if (!paste) {
            return res.status(404).send('Not Found');
        }

        const isInline = req.query.inline === '1';

        if (paste.filepath) {
            const absolutePath = path.resolve(paste.filepath);
            // Set filename for download
            if (paste.filename) {
                // Encode filename for content-disposition
                const filenameEncoded = encodeURIComponent(paste.filename).replace(/['()]/g, escape).replace(/\*/g, '%2A');
                // inline 参数控制是内联显示还是下载
                const disposition = isInline ? 'inline' : 'attachment';
                res.setHeader('Content-Disposition', `${disposition}; filename*=UTF-8''${filenameEncoded}`);
            }
            res.sendFile(absolutePath);
        } else {
            res.type('text/plain');
            res.send(paste.content);
        }
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// POST /api/verify/:id - Verify password and get content/download link
router.post('/verify/:id', async (req, res) => {
    try {
        const { password } = req.body;
        const paste = await Paste.findById(req.params.id);
        if (!paste) return res.status(404).json({ error: 'Not found' });

        if (paste.password) {
            const isMatch = await bcrypt.compare(password, paste.password);
            if (!isMatch) return res.status(401).json({ error: 'Invalid Password' });
        }

        res.json(getPasteWithContent(paste));
    } catch (e) {
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
