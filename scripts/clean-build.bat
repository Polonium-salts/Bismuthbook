@echo off
echo 清理构建缓存...
echo.

REM 删除 .next 目录
if exist .next (
    echo 删除 .next 目录...
    rmdir /s /q .next
)

REM 删除 node_modules/.cache
if exist node_modules\.cache (
    echo 删除 node_modules\.cache 目录...
    rmdir /s /q node_modules\.cache
)

echo.
echo 缓存清理完成！
echo.
echo 现在运行: npm run build
echo.
pause
