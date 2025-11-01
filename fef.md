<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>电子邮件模板</title>
    <style>
        /* 重置样式 */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
        }
        
        /* 邮件容器 */
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        /* 邮件头部 */
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        
        .email-header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .email-header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        /* 邮件内容 */
        .email-content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            line-height: 1.8;
            color: #555555;
            margin-bottom: 30px;
        }
        
        .message p {
            margin-bottom: 15px;
        }
        
        /* 按钮样式 */
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: transform 0.2s ease;
            margin: 20px 0;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(102, 126, 234, 0.3);
        }
        
        /* 信息卡片 */
        .info-card {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 6px 6px 0;
        }
        
        .info-card h3 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 18px;
        }
        
        .info-card p {
            color: #666666;
            margin: 0;
        }
        
        /* 联系信息 */
        .contact-info {
            background-color: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .contact-info h4 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 16px;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            font-size: 14px;
            color: #666666;
        }
        
        .contact-item:last-child {
            margin-bottom: 0;
        }
        
        .contact-icon {
            width: 16px;
            height: 16px;
            margin-right: 10px;
            opacity: 0.7;
        }
        
        /* 邮件底部 */
        .email-footer {
            background-color: #f8f9fa;
            padding: 30px 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .email-footer p {
            font-size: 14px;
            color: #666666;
            margin-bottom: 10px;
        }
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
        }
        
        .social-links a:hover {
            color: #764ba2;
        }
        
        /* 响应式设计 */
        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 0;
            }
            
            .email-content {
                padding: 30px 20px;
            }
            
            .email-header {
                padding: 25px 15px;
            }
            
            .email-header h1 {
                font-size: 24px;
            }
            
            .cta-button {
                display: block;
                text-align: center;
                margin: 20px 0;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- 邮件头部 -->
        <div class="email-header">
            <h1>欢迎使用我们的服务</h1>
            <p>感谢您的信任与支持</p>
        </div>
        
        <!-- 邮件内容 -->
        <div class="email-content">
            <div class="greeting">
                亲爱的用户，您好！
            </div>
            
            <div class="message">
                <p>感谢您注册我们的服务。我们很高兴您能加入我们的社区！</p>
                <p>为了确保您的账户安全，请点击下方按钮验证您的电子邮件地址：</p>
            </div>
            
            <!-- 行动按钮 -->
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="cta-button">验证邮箱地址</a>
            </div>
            
            <!-- 信息卡片 -->
            <div class="info-card">
                <h3>重要提醒</h3>
                <p>此验证链接将在24小时后过期。如果您没有注册我们的服务，请忽略此邮件。</p>
            </div>
            
            <!-- 联系信息 -->
            <div class="contact-info">
                <h4>需要帮助？</h4>
                <div class="contact-item">
                    <span class="contact-icon">📧</span>
                    <span>邮箱：support@example.com</span>
                </div>
                <div class="contact-item">
                    <span class="contact-icon">📞</span>
                    <span>电话：400-123-4567</span>
                </div>
                <div class="contact-item">
                    <span class="contact-icon">🌐</span>
                    <span>网站：www.example.com</span>
                </div>
            </div>
            
            <div class="message">
                <p>如果您有任何问题或需要帮助，请随时联系我们的客服团队。</p>
                <p>祝您使用愉快！</p>
            </div>
        </div>
        
        <!-- 邮件底部 -->
        <div class="email-footer">
            <p>此邮件由系统自动发送，请勿直接回复。</p>
            
            <div class="social-links">
                <a href="#">关注我们</a>
                <a href="#">隐私政策</a>
                <a href="#">服务条款</a>
                <a href="#">取消订阅</a>
            </div>
            
            <p>&copy; 2024 您的公司名称. 保留所有权利。</p>
            <p>地址：北京市朝阳区示例街道123号</p>
        </div>
    </div>
</body>
</html>