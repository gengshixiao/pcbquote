
// --- 造物潭：静态原型 UI 驱动逻辑 ---

let isSidebarOpen = true;

const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const attachBtn = document.getElementById('attach-btn');
const fileInput = document.getElementById('file-input');
const filePreviewContainer = document.getElementById('file-preview-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

function init() {
    lucide.createIcons();

    // 自动调整文本框高度
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // 侧边栏开关逻辑
    toggleSidebarBtn.addEventListener('click', toggleSidebar);

    // 文件上传 UI 模拟
    attachBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileChange);
    
    // 发送按钮点击提示 (原型展示)
    sendBtn.addEventListener('click', () => {
        const val = userInput.value.trim();
        if(val) {
            alert("原型展示阶段：系统已接收到您的需求，正式版将在此输出智能分析报告。");
            userInput.value = "";
            userInput.style.height = 'auto';
        }
    });
}

function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
    sidebar.classList.toggle('w-64', isSidebarOpen);
    sidebar.classList.toggle('w-16', !isSidebarOpen);
    
    document.querySelectorAll('.sidebar-label').forEach(el => {
        el.classList.toggle('hidden', !isSidebarOpen);
    });

    const icon = toggleSidebarBtn.querySelector('i');
    icon.setAttribute('data-lucide', isSidebarOpen ? 'chevron-left' : 'chevron-right');
    lucide.createIcons();
}

function handleFileChange(e) {
    const files = Array.from(e.target.files);
    if(files.length > 0) {
        filePreviewContainer.innerHTML = files.map((f, i) => `
            <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded text-xs text-emerald-700">
                <i data-lucide="file" class="w-3.5 h-3.5"></i>
                <span class="max-w-[150px] truncate">${f.name}</span>
                <button onclick="clearFiles()" class="text-emerald-400 hover:text-red-500">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i>
                </button>
            </div>
        `).join('');
        lucide.createIcons();
    }
}

window.clearFiles = () => {
    filePreviewContainer.innerHTML = '';
    fileInput.value = '';
};

// 启动
init();
