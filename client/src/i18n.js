import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "title": "CBJ Tools Pastbin",
            "subtitle": "Pastbin",
            "save_paste": "Save Paste",
            "saving": "Saving...",
            "type_here": "Type or paste your code here...",
            "paste_title": "Paste Title (Optional)",
            "edit_title": "Edit Title",
            "update": "Update",
            "cancel": "Cancel",
            "format_json": "Format JSON",
            "format_detect": "Format / Detect",
            "fix_json": "Fix JSON",
            "json_fix_title": "JSON Repair",
            "json_fix_confirm": "It looks like invalid JSON but might be repairable. Would you like to try fixing it automatically?",
            "yes": "Yes",
            "no": "No",
            "cli_generator": "CLI Upload Generator",
            "local_path": "Local File Path:",
            "run_command": "Run this command in your terminal:",
            "cli_note": "* Returns a URL and a Password for secure access.",
            "never_expire": "Never Expire",
            "1_hour": "1 Hour",
            "1_day": "1 Day",
            "1_week": "1 Week",
            "password_protected": "Password Protected",
            "protected_note": "This paste is protected. Please enter the password to view.",
            "enter_password": "Enter password...",
            "unlock": "Unlock",
            "invalid_password": "Invalid Password",
            "copy": "Copy",
            "download": "Download",
            "raw": "Raw",
            "error": "Error",
            "not_found": "Paste not found or expired.",
            "usage_guide": "Usage Guide",
            "help_text": "CBJ Tools is a simple Pastbin project. You can paste code here, format JSON, or use the CLI generator to upload files from your local machine. Files uploaded via CLI are automatically password protected for security.",
            "cli_upload_desc": "Upload files via curl:",
            "upload_file": "Upload File",
            "uploading": "Uploading...",
            "upload_success": "File uploaded successfully",
            "drag_drop_hint": "Drag & drop a file here to upload",
            "lan_devices": "LAN Devices",
            "online": "online",
            "lan_no_devices": "No other devices on this network.",
            "shared_to_devices": "Shared to {{count}} device(s)",
            "my_pastes": "My Pastes",
            "received_shares": "Received",
            "no_history": "No history yet."
        }
    },
    zh: {
        translation: {
            "title": "CBJ 工具箱",
            "subtitle": "代码剪贴板",
            "save_paste": "保存代码",
            "saving": "保存中...",
            "type_here": "在此处输入或粘贴代码...",
            "paste_title": "代码标题（选填）",
            "edit_title": "修改标题",
            "update": "更新",
            "cancel": "取消",
            "format_json": "格式化 JSON",
            "format_detect": "格式化 / 识别",
            "fix_json": "修复 JSON",
            "json_fix_title": "JSON 修复",
            "json_fix_confirm": "检测到可能是格式有误的 JSON，是否尝试自动修复？",
            "yes": "是",
            "no": "否",
            "cli_generator": "命令行上传生成器",
            "local_path": "本地文件路径:",
            "run_command": "在终端中运行此命令:",
            "cli_note": "* 返回 URL 和密码以供安全访问。",
            "never_expire": "永不过期",
            "1_hour": "1 小时",
            "1_day": "1 天",
            "1_week": "1 周",
            "password_protected": "受到密码保护",
            "protected_note": "此代码受密码保护。请输入密码进行查看。",
            "enter_password": "请输入密码...",
            "unlock": "解锁",
            "invalid_password": "密码错误",
            "copy": "复制",
            "download": "下载",
            "raw": "原文",
            "error": "错误",
            "not_found": "代码未找到或已过期。",
            "usage_guide": "使用指南",
            "help_text": "CBJ 工具箱是一个简单的代码剪贴板项目。你可以直接在此粘贴代码、格式化 JSON，或者使用命令行生成器从本地上传文件。通过命令行上传的文件会自动加密以保护安全。",
            "cli_upload_desc": "通过 curl 上传文件:",
            "upload_file": "上传文件",
            "uploading": "上传中...",
            "upload_success": "文件上传成功",
            "drag_drop_hint": "拖拽文件到此处上传",
            "lan_devices": "局域网设备",
            "online": "在线",
            "lan_no_devices": "当前网络没有其他设备在线。",
            "shared_to_devices": "已共享给 {{count}} 台设备",
            "my_pastes": "我的发布",
            "received_shares": "收到的共享",
            "no_history": "暂无历史记录。"
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
