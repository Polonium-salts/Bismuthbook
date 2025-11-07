@echo off
REM 搜索功能依赖安装脚本 (Windows)

echo 🔍 安装搜索功能所需的依赖...
echo.

REM 安装 Radix UI 组件
call npm install @radix-ui/react-slider@^1.2.1
call npm install @radix-ui/react-alert-dialog@^1.1.2

echo.
echo ✅ 依赖安装完成！
echo.
echo 📝 下一步：
echo 1. 运行数据库迁移: supabase migration up
echo 2. 启动开发服务器: npm run dev
echo 3. 访问搜索页面: http://localhost:3000/search
echo.
pause
