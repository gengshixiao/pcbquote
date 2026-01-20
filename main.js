
// --- 造物潭：静态原型 UI 驱动逻辑 ---

let isSidebarOpen = true;

const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const attachBtn = document.getElementById('attach-btn');
const fileInput = document.getElementById('file-input');
const filePreviewContainer = document.getElementById('file-preview-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const viewCasesBtn = document.getElementById('view-cases-btn');
const chatMessages = document.getElementById('chat-messages');
const welcomeView = document.getElementById('welcome-view');

// 存储当前待上传的文件数据
let currentFiles = [];

function init() {
    lucide.createIcons();

    // 查看案例逻辑
    if (viewCasesBtn) {
        viewCasesBtn.addEventListener('click', function() {
            // 1. 预置问题 (简洁自然的提问)
            const caseText = "请协助评估该产品的整机物料成本，并核查其在 DFM 制造工艺及关键器件供应链上的潜在风险。";
            userInput.value = caseText;
            
            // 自动调整高度
            userInput.style.height = 'auto';
            userInput.style.height = (userInput.scrollHeight) + 'px';

            // 2. 模拟上传文件 (精简文件名)
            currentFiles = [
                { name: 'BOM_List_V1.2.xlsx', type: 'EXCEL', icon: 'https://chat-web-1253214834.cos.ap-beijing.myqcloud.com/image/8116c31eaa9cd611564b1386394dc9a3.png' },
                { name: 'Tech_Specs_V1.2.pdf', type: 'PDF', icon: 'https://chat-web-1253214834.cos.ap-beijing.myqcloud.com/image/84098143372a4828bf5ce06e9d2a889f.png' },
                { name: 'PCB_Layout.dwg', type: 'DWG', icon: 'https://chat-web-1253214834.cos.ap-beijing.myqcloud.com/image/cd95b681ffe991014970985239cd5dd8.png' }
            ];
            
            renderFilePreviews();

            // 3. 按钮消失
            viewCasesBtn.style.display = 'none';
        });
    }

    // 发送按钮点击
    sendBtn.addEventListener('click', handleSend);

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
}

function renderFilePreviews() {
    filePreviewContainer.innerHTML = currentFiles.map((f, i) => `
        <div class="relative flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-xl shadow-sm min-w-[200px] animate-in slide-in-from-bottom-2 duration-300">
            <div class="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center p-2 shrink-0">
                <img src="${f.icon}" class="w-full h-full object-contain">
            </div>
            <div class="flex flex-col min-w-0 pr-6">
                <span class="text-xs font-semibold text-slate-700 truncate">${f.name}</span>
                <div class="mt-1">
                    <span class="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full">${f.type}</span>
                </div>
            </div>
            <button onclick="removeFile(${i})" class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors shadow-md">
                <i data-lucide="x" class="w-3 h-3"></i>
            </button>
        </div>
    `).join('');
    lucide.createIcons();
}

window.removeFile = (index) => {
    currentFiles.splice(index, 1);
    renderFilePreviews();
};

function handleSend() {
    const text = userInput.value.trim();
    if (!text && currentFiles.length === 0) return;

    // 获取容器
    const chatContent = chatMessages.querySelector('.max-w-4xl');

    // 1. 移除欢迎界面
    if (welcomeView && chatContent.contains(welcomeView)) {
        welcomeView.remove();
    }

    // 2. 创建用户消息容器
    const messageSection = document.createElement('div');
    messageSection.className = "flex flex-col items-end space-y-3 mb-8 animate-in fade-in slide-in-from-right-4 duration-500 ml-auto max-w-[85%]";
    
    // 3. 渲染文件列表
    let filesHtml = "";
    if (currentFiles.length > 0) {
        filesHtml = `
            <div class="flex flex-col gap-2 w-full items-end">
                ${currentFiles.map(f => `
                    <div class="flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-lg shadow-sm w-fit min-w-[180px]">
                        <div class="w-8 h-8 bg-slate-50 rounded flex items-center justify-center p-1 shrink-0">
                            <img src="${f.icon}" class="w-full h-full object-contain">
                        </div>
                        <div class="flex flex-col min-w-0 pr-2">
                            <span class="text-[11px] font-medium text-slate-700 truncate">${f.name}</span>
                            <span class="text-[9px] text-slate-400 font-bold uppercase">${f.type}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // 4. 组装最终 HTML
    messageSection.innerHTML = `
        ${filesHtml}
        <div class="px-4 py-2.5 bg-emerald-600 text-white rounded-2xl rounded-tr-none shadow-sm text-sm leading-relaxed max-w-full inline-block text-left">
            ${text}
        </div>
    `;

    chatContent.appendChild(messageSection);
    
    // 5. 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // 6. 重置状态
    userInput.value = "";
    userInput.style.height = 'auto';
    currentFiles = [];
    filePreviewContainer.innerHTML = "";
    if (viewCasesBtn) viewCasesBtn.style.display = 'none';

    // 7. 触发 AI 模拟响应
    startAiResponse();
}

// 打字机效果函数 (支持 ** 加粗)
function typeWriter(element, text, speed = 25) {
    // 预处理文字，将 ** 转为 <b>
    const processedText = text.replace(/\*\*(.*?)\*\*/g, '<b class="text-slate-900 font-bold">$1</b>');
    
    return new Promise((resolve) => {
        let i = 0;
        element.innerHTML = "";
        function type() {
            if (i < processedText.length) {
                // 如果遇到 HTML 标签，一次性跳过
                if (processedText.charAt(i) === '<') {
                    const tagEnd = processedText.indexOf('>', i);
                    i = tagEnd + 1;
                } else {
                    i++;
                }
                element.innerHTML = processedText.substring(0, i);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

// 创建 Loading 元素
function createLoader(text) {
    const loader = document.createElement('div');
    loader.className = "flex items-center text-slate-400 text-sm mb-6 animate-pulse relative";
    loader.innerHTML = `
        <div class="absolute -left-7 w-5 h-5 flex items-center justify-center shrink-0">
            <i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i>
        </div>
        <span class="leading-none">${text}</span>
    `;
    lucide.createIcons();
    return loader;
}

async function startAiResponse() {
    const chatContent = chatMessages.querySelector('.max-w-4xl');

    // 1. Loading
    const loader1 = createLoader("正在读取文件信息...");
    chatContent.appendChild(loader1);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    await new Promise(r => setTimeout(r, 2000));
    loader1.remove();

    // 2. Loading
    const loader2 = createLoader("正在整理物料信息...");
    chatContent.appendChild(loader2);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    await new Promise(r => setTimeout(r, 2000));
    loader2.remove();

    // 3. 流式文字输出
    const textNode1 = document.createElement('div');
    textNode1.className = "text-sm text-slate-600 leading-relaxed mb-4";
    chatContent.appendChild(textNode1);
    await typeWriter(textNode1, "我已经完成了对上传文件的深度解析，提取到的**完整物料清单**如下：");

    // 4. 表格输出 (扩充后的物料表)
    const table1 = document.createElement('div');
    table1.className = "border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm mb-6 animate-in fade-in duration-500";
    table1.innerHTML = `
        <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 text-slate-400 border-b border-slate-100">
                <tr>
                    <th class="px-4 py-2 font-medium">物料类别</th>
                    <th class="px-4 py-2 font-medium">参考型号</th>
                    <th class="px-4 py-2 font-medium">规格描述</th>
                    <th class="px-4 py-2 font-medium">用量</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 text-slate-600">
                <tr><td class="px-4 py-3 font-semibold">主控芯片</td><td class="px-4 py-3 font-mono text-[11px]">STM32F407VGT6</td><td class="px-4 py-3 text-[11px]">Cortex-M4, 168MHz, 1MB Flash</td><td class="px-4 py-3 text-center">1</td></tr>
                <tr><td class="px-4 py-3 font-semibold">Flash存储</td><td class="px-4 py-3 font-mono text-[11px]">W25Q128JVSIM</td><td class="px-4 py-3 text-[11px]">128M-bit Serial Flash Memory</td><td class="px-4 py-3 text-center">1</td></tr>
                <tr><td class="px-4 py-3 font-semibold">电源管理</td><td class="px-4 py-3 font-mono text-[11px]">TPS54331DR</td><td class="px-4 py-3 text-[11px]">3A 28V Step-Down Converter</td><td class="px-4 py-3 text-center">2</td></tr>
                <tr><td class="px-4 py-3 font-semibold">运算放大器</td><td class="px-4 py-3 font-mono text-[11px]">AD8605ARTZ</td><td class="px-4 py-3 text-[11px]">Precision RRIO Op Amp (Medical)</td><td class="px-4 py-3 text-center">4</td></tr>
                <tr><td class="px-4 py-3 font-semibold">肖特基二极管</td><td class="px-4 py-3 font-mono text-[11px]">MBRS340T3G</td><td class="px-4 py-3 text-[11px]">40V 3A Schottky Barrier Rectifier</td><td class="px-4 py-3 text-center">6</td></tr>
                <tr><td class="px-4 py-3 font-semibold">TVS保护</td><td class="px-4 py-3 font-mono text-[11px]">PESD5V0U1BA</td><td class="px-4 py-3 text-[11px]">Ultra Low Capacitance ESD Prot.</td><td class="px-4 py-3 text-center">8</td></tr>
            </tbody>
        </table>
    `;
    chatContent.appendChild(table1);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    await new Promise(r => setTimeout(r, 1000));

    // 5. 流式文字输出
    const textNode2 = document.createElement('div');
    textNode2.className = "text-sm text-slate-600 leading-relaxed mb-4";
    chatContent.appendChild(textNode2);
    await typeWriter(textNode2, "物料清单整理完成。该方案涉及**高精度医疗信号采集**与多路隔离电源设计，属于典型的**高可靠性工业产品**。接下来我将调用实时物料库，为您获取最新的**市场供应情况**。");

    // 6. Loading
    const loader3 = createLoader("正在查询供应商数据...");
    chatContent.appendChild(loader3);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    await new Promise(r => setTimeout(r, 3000));
    loader3.remove();

    // 7. 表格输出 (供应链查询表格 - 同步 6 款物料)
    const table2 = document.createElement('div');
    table2.className = "border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm mb-6 animate-in fade-in duration-500";
    table2.innerHTML = `
        <table class="w-full text-[11px] text-left">
            <thead class="bg-slate-50 text-slate-400 border-b border-slate-100">
                <tr>
                    <th class="px-4 py-2 font-medium">型号</th>
                    <th class="px-4 py-2 font-medium">单价 (¥)</th>
                    <th class="px-4 py-2 font-medium">交期 (工作日)</th>
                    <th class="px-4 py-2 font-medium text-right">货源渠道</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 text-slate-600">
                <tr><td class="px-4 py-2 font-mono text-emerald-600">STM32F407VGT6</td><td class="px-4 py-2">28.50</td><td class="px-4 py-2 font-bold text-emerald-600">现货</td><td class="px-4 py-2 text-slate-400 text-right">ST官方代理</td></tr>
                <tr><td class="px-4 py-2 font-mono text-emerald-600">AD8605ARTZ</td><td class="px-4 py-2">8.45</td><td class="px-4 py-2 text-orange-500">3-5天</td><td class="px-4 py-2 text-slate-400 text-right">Mouser 代购</td></tr>
                <tr><td class="px-4 py-2 font-mono text-emerald-600">TPS54331DR</td><td class="px-4 py-2">4.25</td><td class="px-4 py-2 font-bold text-emerald-600">现货</td><td class="px-4 py-2 text-slate-400 text-right">立创商城</td></tr>
                <tr><td class="px-4 py-2 font-mono text-emerald-600">W25Q128JVSIM</td><td class="px-4 py-2">3.10</td><td class="px-4 py-2 font-bold text-emerald-600">现货</td><td class="px-4 py-2 text-slate-400 text-right">华强北电子</td></tr>
                <tr><td class="px-4 py-2 font-mono text-emerald-600">MBRS340T3G</td><td class="px-4 py-2">0.85</td><td class="px-4 py-2 font-bold text-emerald-600">现货</td><td class="px-4 py-2 text-slate-400 text-right">ON Semi 代理</td></tr>
                <tr><td class="px-4 py-2 font-mono text-emerald-600">PESD5V0U1BA</td><td class="px-4 py-2">0.42</td><td class="px-4 py-2 font-bold text-emerald-600">现货</td><td class="px-4 py-2 text-slate-400 text-right">NXP 授权商</td></tr>
            </tbody>
        </table>
    `;
    chatContent.appendChild(table2);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    await new Promise(r => setTimeout(r, 1000));

    // 8. 流式文字输出
    const textNode3 = document.createElement('div');
    textNode3.className = "text-sm text-slate-600 leading-relaxed mb-4";
    chatContent.appendChild(textNode3);
    await typeWriter(textNode3, "已获取供应链实时行情。接下来，我将针对上传的 **Gerber 结构图纸** 进行深入分析，评估其**生产工艺复杂度**及潜在的 DFM 制造风险。");

    // 9. 三个先后的 Loading
    const loader4 = createLoader("正在读取产品需求文档...");
    chatContent.appendChild(loader4);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    await new Promise(r => setTimeout(r, 2000));
    loader4.remove();

    const loader5 = createLoader("正在读取 PCB 核心工程数据...");
    chatContent.appendChild(loader5);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    await new Promise(r => setTimeout(r, 2000));
    loader5.remove();

    const loader6 = createLoader("正在进行深度 DFM 风险分析...");
    chatContent.appendChild(loader6);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    await new Promise(r => setTimeout(r, 2000));
    loader6.remove();

    // 10. 流式文字输出 (工艺与风险结论)
    const textNode4 = document.createElement('div');
    textNode4.className = "text-sm text-slate-600 leading-relaxed mb-4";
    chatContent.appendChild(textNode4);
    await typeWriter(textNode4, "深度分析完成。鉴于该产品对散热及电源稳定性的极高要求，我建议采用 **2oz 厚铜** 及 **沉金 (ENIG)** 表面处理工艺。经 DFM 扫描，该设计的最小线宽线距符合量产制程能力，预估**批量良品率在 98.5% 左右**。");

    // 11. 准备生成报价
    const textNode5 = document.createElement('div');
    textNode5.className = "text-sm text-slate-600 leading-relaxed mb-4";
    chatContent.appendChild(textNode5);
    await typeWriter(textNode5, "现在，所有物料、工艺及风险数据已汇总完毕，正在为您计算**最终综合报价方案**...");

    // 12. Loading
    const loader7 = createLoader("正在生成详细报价单...");
    chatContent.appendChild(loader7);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    await new Promise(r => setTimeout(r, 2500));
    loader7.remove();

    // 13. 表格输出 (标准行业报价表)
    const table3 = document.createElement('div');
    table3.className = "border border-slate-200 rounded-xl bg-white overflow-hidden shadow-lg border-t-4 border-t-emerald-500 mb-6 animate-in fade-in duration-500";
    table3.innerHTML = `
        <div class="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <span class="text-xs font-bold text-slate-700">项目综合报价汇总 (10 套样品)</span>
            <span class="text-[10px] text-slate-400 font-medium">编号: QT-20260120-001</span>
        </div>
        <table class="w-full text-xs text-left">
            <thead class="text-slate-400 border-b border-slate-50">
                <tr>
                    <th class="px-4 py-2 font-medium">费用项目</th>
                    <th class="px-4 py-2 font-medium">明细说明</th>
                    <th class="px-4 py-2 font-medium text-right">金额 (¥)</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 text-slate-600">
                <tr><td class="px-4 py-3 font-medium">BOM 物料费用</td><td class="px-4 py-3 text-[11px] text-slate-400">含主控、存储、隔离电源及阻容感</td><td class="px-4 py-3 text-right">1,215.50</td></tr>
                <tr><td class="px-4 py-3 font-medium">PCB 制造费用</td><td class="px-4 py-3 text-[11px] text-slate-400">4层板 / 2oz厚铜 / 沉金工艺</td><td class="px-4 py-3 text-right">245.00</td></tr>
                <tr><td class="px-4 py-3 font-medium">工程研发与优化</td><td class="px-4 py-3 text-[11px] text-slate-400">DFM 审查 + 钢网开模/SMT治具</td><td class="px-4 py-3 text-right">180.00</td></tr>
                <tr><td class="px-4 py-3 font-medium">综合物流费</td><td class="px-4 py-3 text-[11px] text-slate-400">顺丰特快 + 专用防静电包装</td><td class="px-4 py-3 text-right">45.00</td></tr>
                <tr class="bg-emerald-50/30"><td class="px-4 py-3 font-bold text-emerald-700">总计报价 (含税)</td><td class="px-4 py-3"></td><td class="px-4 py-3 text-right font-bold text-emerald-600 text-lg tracking-tight">¥ 1,685.50</td></tr>
            </tbody>
        </table>
        <div class="px-4 py-2 bg-slate-50 text-[10px] text-slate-400 border-t border-slate-100 italic">
            * 报价有效期 72 小时。受 LME 铜价波动影响，工艺费可能随行情调整。
        </div>
    `;
    chatContent.appendChild(table3);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    await new Promise(r => setTimeout(r, 1000));

    // 14. 最终引导文字
    const textNode6 = document.createElement('div');
    textNode6.className = "text-sm text-slate-600 leading-relaxed mb-8";
    chatContent.appendChild(textNode6);
    await typeWriter(textNode6, "整机报价已生成。通过 DFM 扫描，我发现**电源层过孔**布设略显密集，建议在正式打样前进行微调。您可以针对**核心物料的国产化替代建议**继续与我沟通。");
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
        files.forEach(f => {
            let type = 'FILE';
            let icon = 'https://chat-web-1253214834.cos.ap-beijing.myqcloud.com/image/84098143372a4828bf5ce06e9d2a889f.png';
            
            if (f.name.endsWith('.xlsx') || f.name.endsWith('.xls')) {
                type = 'EXCEL';
                icon = 'https://chat-web-1253214834.cos.ap-beijing.myqcloud.com/image/8116c31eaa9cd611564b1386394dc9a3.png';
            } else if (f.name.endsWith('.dwg') || f.name.endsWith('.dxf')) {
                type = 'DWG';
                icon = 'https://chat-web-1253214834.cos.ap-beijing.myqcloud.com/image/cd95b681ffe991014970985239cd5dd8.png';
            }
            
            currentFiles.push({ name: f.name, type, icon });
        });
        renderFilePreviews();
        fileInput.value = '';
    }
}

window.clearFiles = () => {
    filePreviewContainer.innerHTML = '';
    currentFiles = [];
};

// 启动
init();
