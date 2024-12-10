const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const BAIDU_APPID = '20241210002224707';
const BAIDU_KEY = 'VX7SRTSZ57y8LQPxgO8B';
const BAIDU_API = 'https://api.fanyi.baidu.com/api/trans/vip/translate';

app.post('/translate', async (req, res) => {
    try {
        const { q, from, to } = req.body;
        const salt = Date.now().toString();
        const str = BAIDU_APPID + q + salt + BAIDU_KEY;
        const sign = crypto.createHash('md5').update(str).digest('hex');

        const params = {
            q: q,
            from: from,
            to: to,
            appid: BAIDU_APPID,
            salt: salt,
            sign: sign
        };

        console.log('Sending request with params:', params);

        const response = await axios({
            method: 'GET',
            url: BAIDU_API,
            params: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('Baidu API response:', response.data);

        if (response.data.error_code) {
            throw new Error(`百度翻译错误: ${response.data.error_msg}`);
        }

        res.json(response.data);
    } catch (error) {
        console.error('Translation error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: error.response?.data?.error_msg || error.message,
            details: error.response?.data || '未知错误'
        });
    }
});

// 添加一个测试端点
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 