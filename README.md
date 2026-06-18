# 麦芽 · 雅思农场助手

一个使用本地账号、多服务商兼容 API、浏览器语音识别和图片消息的像素风雅思写作 Chat Box。

界面采用原创农场像素美术，品牌字牌为 `Camil&Tieria`，聊天助手是原创种子学习精灵。中文界面使用项目内置的 Fusion Pixel 像素字体。

## 启动

1. 确保电脑已安装 Node.js 18 或更高版本。
2. 在本目录运行 `npm start`。
3. 浏览器打开 `http://127.0.0.1:4173`。
4. 注册后，在左侧“助手设置”中选择 OpenAI、通义千问、DeepSeek 或自定义兼容接口，再填写对应密钥。服务商地址和推荐模型会自动填入。

## 模型选择

- OpenAI：GPT-5.5、GPT-5.4、GPT-5.4 mini、GPT-5.4 nano
- 通义千问：Qwen3.7 Max、Qwen3.7 Plus、Qwen3.6 Flash、Qwen3.5 Omni Plus、Qwen Plus
- DeepSeek：DeepSeek Chat、DeepSeek Reasoner
- 每个服务商均可选择“自定义模型”并填写模型 ID

账号密码、聊天记录、积分和 API 设置只保存在当前浏览器。这个方式适合本机原型；正式上线时应将账号认证、数据和 API 密钥迁移到安全的服务端。
