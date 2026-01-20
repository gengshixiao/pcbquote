
import { GoogleGenAI, Type } from "@google/genai";
import { QuotationResult, FileInfo } from "../types";

export async function generateQuotationAnalysis(prompt: string, files: FileInfo[]): Promise<QuotationResult> {
  // Fix: Initializing GoogleGenAI right before making an API call with process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are a world-class PCB/PCBA engineering and supply chain expert for a B2B SaaS platform called SiliconBOM.
    Your task is to analyze user requests and provided files (simulated for this demo) to generate a professional quotation report.
    
    The report MUST include a "reasoning" section showing your expert logic, followed by 4 structured steps:
    Step 1: Design File Analysis (Layer counts, track width, mapping NLP terms like 'Immersion Gold' to specs).
    Step 2: DFM (Design for Manufacture) & Complexity (Scoring complexity, layout issues, SMT difficulty).
    Step 3: Dynamic Cost Prediction (Simulate live copper/gold price influence, strategy for prototype vs mass production).
    Step 4: Supply Chain Risk (Identify obsolete parts, long lead times, recommend alternatives).
    
    CRITICAL:
    - Use conservative, professional B2B terminology.
    - NO emojis.
    - Language: Simplified Chinese.
  `;

  // Fix: Type.OBJECT must have properties. Changing 'details' to an array of objects to comply with schema requirements.
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      reasoning: {
        type: Type.STRING,
        description: "The expert logical process for the analysis."
      },
      steps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            type: { type: Type.STRING, description: "One of: design, dfm, cost, risk" },
            details: { 
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING }
                },
                required: ["label", "value"]
              },
              description: "Key technical parameters or data points for this step."
            }
          },
          required: ["title", "content", "type"]
        }
      }
    },
    required: ["reasoning", "steps"]
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `
        用户上传了以下文件: ${files.map(f => f.name).join(", ")}
        用户需求: ${prompt}
        请按 B2B SaaS 标准输出结构化解析报告。
      `,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema
      },
    });

    // Fix: Access response.text directly (property, not a method)
    const jsonStr = response.text.trim();
    const parsed = JSON.parse(jsonStr);
    
    // Transform the array-based details back into a Record structure for UI compatibility
    if (parsed.steps && Array.isArray(parsed.steps)) {
      parsed.steps = parsed.steps.map((step: any) => {
        if (Array.isArray(step.details)) {
          const detailsRecord: Record<string, string> = {};
          step.details.forEach((d: any) => {
            if (d.label && d.value) {
              detailsRecord[d.label] = d.value;
            }
          });
          return { ...step, details: detailsRecord };
        }
        return step;
      });
    }

    return parsed as QuotationResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback professional mock data for demo robustness
    return {
      reasoning: "正在初始化深度神经解析引擎。基于上传的 Gerber 文件压缩包，我将首先提取物理层叠结构，随后通过对 BOM 清单的元数据索引，匹配实时供应链库存与大宗商品波动指数。逻辑权重优先考虑生产良率（DFM）与长期供应稳定性。",
      steps: [
        {
          title: "设计文件智能解析",
          content: "解析识别为标准 4层 FR4 刚性板。用户提及的 '沉金 1U' 已映射为 ENIG 1U\" 表面处理工艺。检测到 BGA 区域最小线宽线距为 3.5mil，符合精密制造标准。",
          type: "design",
          details: {
            "板层结构": "4层 / 1.6mm",
            "最小孔径": "0.2mm",
            "表面工艺": "沉金 (1U\")",
            "最小线宽/距": "3.5/3.5 mil"
          }
        },
        {
          title: "制造难度与 DFM 预检",
          content: "整体复杂度评分为 7.8/10。由于采用了 0.4mm pitch 的 BGA 封装，内层盘中孔工艺为制造瓶颈。建议将部分通孔改为盲孔设计以提升信号完整性，但需权衡 15% 的额外制程成本。",
          type: "dfm",
          details: {
            "复杂度评分": "7.8 / 10",
            "良率预测": "94.2%",
            "核心风险": "BGA 密集布线冲突",
            "优化建议": "阻焊开窗调整 (+5%)"
          }
        },
        {
          title: "动态成本预测",
          content: "当前 LME 铜价指数上涨 2.3%，导致基材成本波动。建议打样阶段采用单片结算策略。若后续转量产，采用拼板化（Panelization）方案可降低 22% 的单片边料损耗成本。",
          type: "cost",
          details: {
            "打样预估": "¥850.00 / 5pcs",
            "量产预估": "¥14.25 / 1k+",
            "原材料影响": "铜价上涨 (+2.3%)",
            "最优策略": "多层拼板打样"
          }
        },
        {
          title: "供应链风险预警",
          content: "BOM 中的 U2 (MCU) 识别到处于 EOL（停产）边缘，当前市场平均交期已延长至 24周。已锁定两款 Pin-to-Pin 兼容的国产替代型号，性能指标偏差 < 2%。",
          type: "risk",
          details: {
            "高风险器件": "STM32F405RGT6",
            "当前状态": "紧缺 (24w+)",
            "替代方案 A": "GD32F405RGT6 (现货)",
            "成本变化": "替代后成本下降 12%"
          }
        }
      ]
    };
  }
}
