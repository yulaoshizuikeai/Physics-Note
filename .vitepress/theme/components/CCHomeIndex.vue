<script setup lang="ts">
import { withBase } from "vitepress";
import { computed, ref } from "vue";

import CCDailyQuote from "./CCDailyQuote.vue";

interface ChapterItem {
  num: string;
  title: string;
  group: "mechanics" | "electromagnetism" | "waves_modern" | "experiments";
  volume:
    | "必修第一册"
    | "必修第二册"
    | "必修第三册"
    | "选必第一册"
    | "选必第二册"
    | "选必第三册"
    | "实验专题";
  volumeTag: "bx1" | "bx2" | "bx3" | "xb1" | "xb2" | "xb3" | "exp";
  desc: string;
  keywords: string[];
  link: string;
}

interface SpecialItem {
  title: string;
  badge: string;
  tagClass: "blue" | "yellow" | "red";
  desc: string;
  link: string;
  actionText: string;
  iconSvg: string;
}

const chapters: ChapterItem[] = [
  {
    num: "01",
    title: "运动的描述与匀变速规律",
    group: "mechanics",
    volume: "必修第一册",
    volumeTag: "bx1",
    desc: "质点参考系、位移速度加速度、匀变速四大公式与推论、运动图象",
    keywords: [
      "质点参考系",
      "位移与速度",
      "加速度",
      "匀变速四大公式",
      "中间时刻速度",
      "v-t 图像",
      "追及相遇",
    ],
    link: "/01%20运动的描述与匀变速规律/01%20质点与参考系",
  },
  {
    num: "02",
    title: "相互作用与共点力平衡",
    group: "mechanics",
    volume: "必修第一册",
    volumeTag: "bx1",
    desc: "重力弹力、静动摩擦力、力的合成与分解、共点力动态平衡",
    keywords: [
      "重力重心",
      "胡克定律",
      "静摩擦与滑动摩擦",
      "力的合成正交分解",
      "动态平衡矢量三角形",
      "轻绳与轻杆",
    ],
    link: "/02%20相互作用与共点力平衡/01%20重力与弹力",
  },
  {
    num: "03",
    title: "牛顿运动定律与动力学应用",
    group: "mechanics",
    volume: "必修第一册",
    volumeTag: "bx1",
    desc: "牛顿三定律、力学单位制、超重失重、板块与传送带动力学模型",
    keywords: [
      "牛顿第一定律惯性",
      "牛顿第二定律 F=ma",
      "超重失重判断",
      "连接体整体隔离法",
      "板块模型",
      "水平与倾斜传送带",
    ],
    link: "/03%20牛顿运动定律与动力学应用/01%20牛顿第一定律",
  },
  {
    num: "04",
    title: "抛体运动与曲线运动",
    group: "mechanics",
    volume: "必修第二册",
    volumeTag: "bx2",
    desc: "曲线运动条件、平抛运动运动学与轨迹方程、斜面平抛解题模型",
    keywords: [
      "曲线运动条件",
      "运动的合成与分解",
      "小船渡河",
      "平抛分解与时间规律",
      "速度偏角与位移偏角",
      "斜面平抛模型",
    ],
    link: "/04%20抛体运动与曲线运动/01%20曲线运动的特征与条件",
  },
  {
    num: "05",
    title: "圆周运动及其应用",
    group: "mechanics",
    volume: "必修第二册",
    volumeTag: "bx2",
    desc: "线速度角速度、向心加速度、轻绳与轻杆竖直圆周临界模型",
    keywords: [
      "线速度与角速度",
      "向心力与向心加速度",
      "圆锥摆模型",
      "火车转弯外轨超高",
      "轻绳竖直圆周临界",
      "轻杆竖直圆周模型",
    ],
    link: "/05%20圆周运动及其应用/01%20描述圆周运动的物理量",
  },
  {
    num: "06",
    title: "万有引力与宇宙航行",
    group: "mechanics",
    volume: "必修第二册",
    volumeTag: "bx2",
    desc: "开普勒三定律、万有引力定律、三大宇宙速度、卫星变轨与双星",
    keywords: [
      "开普勒三定律",
      "万有引力公式",
      "黄金代换 GM=gR²",
      "三大宇宙速度",
      "卫星高轨低速大周期",
      "卫星椭圆变轨",
      "双星与多星系统",
    ],
    link: "/06%20万有引力与宇宙航行/01%20行星的运动与开普勒定律",
  },
  {
    num: "07",
    title: "机械能守恒与功能关系",
    group: "mechanics",
    volume: "必修第二册",
    volumeTag: "bx2",
    desc: "功与功率、机车启动、动能定理、机械能守恒定律、摩擦生热",
    keywords: [
      "恒力与变力做功",
      "机车恒功率与恒牵引力启动",
      "动能定理 W合=ΔEk",
      "机械能守恒判据",
      "功能关系",
      "摩擦生热 Q=f·Δs相对",
    ],
    link: "/07%20机械能守恒与功能关系/01%20功与功率",
  },
  {
    num: "08",
    title: "动量守恒定律与碰撞",
    group: "mechanics",
    volume: "选必第一册",
    volumeTag: "xb1",
    desc: "动量定理、动量守恒定律、完全弹性/非弹性碰撞、反冲与弹簧振子",
    keywords: [
      "动量与冲量",
      "动量定理 I=Δp",
      "动量守恒条件",
      "弹性碰撞速度公式",
      "完全非弹性碰撞最大能量损",
      "人船模型",
      "反冲与火箭",
    ],
    link: "/08%20动量守恒定律与碰撞/01%20动量与动量定理",
  },
  {
    num: "09",
    title: "静电场与电能",
    group: "electromagnetism",
    volume: "必修第三册",
    volumeTag: "bx3",
    desc: "库仑定律、场强与电场线、电势能与等势面、匀强电场 U=Ed、电容动态分析",
    keywords: [
      "库仑定律",
      "电场强度叠加",
      "电场线与等势面",
      "电势能与电势",
      "电场力做功 W=-ΔEp",
      "匀强电场 U=Ed",
      "平行板电容器动态分析",
    ],
    link: "/09%20静电场与电能/01%20电荷守恒与库仑定律",
  },
  {
    num: "10",
    title: "带电粒子在电场中的运动",
    group: "electromagnetism",
    volume: "必修第三册",
    volumeTag: "bx3",
    desc: "带电粒子在电场中的加速、类平抛偏转轨迹、示波管原理、交变电场运动",
    keywords: [
      "电场直线加速",
      "匀强电场类平抛偏转",
      "偏转角与侧移距离",
      "示波管工作原理",
      "交变方波电场周期性运动",
    ],
    link: "/10%20带电粒子在电场中的运动/01%20带电粒子在电场中的加速",
  },
  {
    num: "11",
    title: "电路与恒定电流",
    group: "electromagnetism",
    volume: "必修第三册",
    volumeTag: "bx3",
    desc: "电流微观式、电阻定律、电表改装、闭合电路欧姆定律与电源输出极值",
    keywords: [
      "电流微观表达式 I=neSv",
      "电阻定律与电阻率",
      "电流表电压表改装",
      "闭合电路欧姆定律",
      "U-I 图线与内外阻",
      "电源输出功率最大条件",
    ],
    link: "/11%20电路与恒定电流/01%20电流与电阻定律",
  },
  {
    num: "12",
    title: "磁场与安培力洛伦兹力",
    group: "electromagnetism",
    volume: "选必第二册",
    volumeTag: "xb2",
    desc: "磁感应强度、安培力与左手定则、洛伦兹力、匀强磁场圆周运动几何轨迹与质谱仪",
    keywords: [
      "磁感应强度 B",
      "安培力 F=BIL 与左手定则",
      "洛伦兹力 F=qvB",
      "带电粒子磁场匀速圆周",
      "轨道半径与周期公式",
      "找圆心定半径定时间",
      "质谱仪与回旋加速器",
    ],
    link: "/12%20磁场与安培力洛伦兹力/01%20磁场与磁感应强度",
  },
  {
    num: "13",
    title: "电磁感应与综合应用",
    group: "electromagnetism",
    volume: "选必第二册",
    volumeTag: "xb2",
    desc: "楞次定律、法拉第电磁感应定律、动生感生电动势、导轨滑棒力电能量综合",
    keywords: [
      "磁通量变化",
      "楞次定律增反减同",
      "法拉第电磁感应定律 E=nΔΦ/Δt",
      "动生电动势 E=BLv",
      "感生电场",
      "单棒导轨收尾速度",
      "双棒与电容导轨系统",
    ],
    link: "/13%20电磁感应与综合应用/01%20电磁感应现象与楞次定律",
  },
  {
    num: "14",
    title: "交变电流与电磁波",
    group: "electromagnetism",
    volume: "选必第二册",
    volumeTag: "xb2",
    desc: "正弦交变电流四值、理想变压器规律、远距离高压输电、电磁振荡与传感器",
    keywords: [
      "正弦交流电产生与四值",
      "有效值计算",
      "理想变压器电压电流功率关系",
      "远距离输电回路计算",
      "LC 电磁振荡周期",
      "麦克斯韦电磁场理论",
    ],
    link: "/14%20交变电流与电磁波/01%20正弦交变电流的产生与描述",
  },
  {
    num: "15",
    title: "机械振动与机械波",
    group: "waves_modern",
    volume: "选必第一册",
    volumeTag: "xb1",
    desc: "简谐运动回复力与能量、单摆与共振、机械波图像与振动图像互化",
    keywords: [
      "简谐运动特征 F=-kx",
      "单摆周期公式 T=2π√(L/g)",
      "受迫振动与共振",
      "横波波速波长周期关系",
      "振动图像与波动图像互化",
      "波的干涉衍射与多普勒效应",
    ],
    link: "/15%20机械振动与机械波/01%20简谐运动与描述",
  },
  {
    num: "16",
    title: "光学",
    group: "waves_modern",
    volume: "选必第一册",
    volumeTag: "xb1",
    desc: "折射率与全反射、杨氏双缝干涉、薄膜干涉、衍射偏振与激光技术",
    keywords: [
      "折射定律 n=sinθ1/sinθ2",
      "全反射临界角 sinC=1/n",
      "光的色散与棱镜",
      "双缝干涉条纹间距公式 Δx=Lλ/d",
      "薄膜干涉增透膜",
      "光的衍射偏振与激光",
    ],
    link: "/16%20光学/01%20光的折射与折射率",
  },
  {
    num: "17",
    title: "热学与分子动理论",
    group: "waves_modern",
    volume: "选必第三册",
    volumeTag: "xb3",
    desc: "分子动理论微观量估算、气体实验三定律与理想气体状态方程、热力学定律",
    keywords: [
      "阿伏加德罗常数微观估算",
      "分子力与分子势能曲线",
      "玻意耳查理盖吕萨克定律",
      "理想气体状态方程 pV/T=C",
      "p-V/p-T/V-T 图像",
      "热力学第一定律 ΔU=W+Q",
    ],
    link: "/17%20热学与分子动理论/01%20分子动理论与微观量估算",
  },
  {
    num: "18",
    title: "原子物理与近代物理",
    group: "waves_modern",
    volume: "选必第三册",
    volumeTag: "xb3",
    desc: "黑体辐射与光电效应光子说、玻尔氢原子跃迁、衰变半衰期与结合能质能方程",
    keywords: [
      "普朗克量子假说",
      "光电效应方程 Ek=hν-W0",
      "玻尔氢原子轨道与能级",
      "α/β/γ 射线与衰变规律",
      "半衰期公式",
      "核反应方程与结合能",
      "爱因斯坦质能方程 ΔE=Δmc²",
    ],
    link: "/18%20原子物理与近代物理/01%20黑体辐射与光电效应",
  },
  {
    num: "19",
    title: "物理实验专题",
    group: "experiments",
    volume: "实验专题",
    volumeTag: "exp",
    desc: "游标卡尺螺旋测微器读数、打点计时器力学验证、伏安法电表内外接分压限流设计与误差分析",
    keywords: [
      "游标卡尺10/20/50分度",
      "螺旋测微器千分尺读数",
      "打点计时器纸带加速度逐差法",
      "验证机械能守恒",
      "伏安法测电阻内外接判据",
      "滑动变阻器分压与限流接法",
      "电表半偏法与等效替代法",
    ],
    link: "/19%20物理实验专题/01%20基本仪器使用与读数规范",
  },
];

const specialCards: SpecialItem[] = [
  {
    title: "50 大黄金结论与临界条件",
    badge: "秒杀定理矩阵",
    tagClass: "yellow",
    desc: "聚合力学、天体、电磁、近代物理高频临界判据、代换式与速算模型，高考考前压轴提分利器。",
    link: "/golden-conclusions",
    actionText: "速查结论",
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  },
  {
    title: "全专题防踩坑排雷白皮书",
    badge: "考前避坑指南",
    tagClass: "red",
    desc: "系统梳理 19 大专题易错陷阱、公式适用边界条件与审题雷区，考前 1 小时速通排雷。",
    link: "/warning-cheatsheet",
    actionText: "查阅排雷",
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  },
  {
    title: "高考物理可视化交互空间",
    badge: "动态物理仿真",
    tagClass: "blue",
    desc: "微元积分、平抛轨迹合成、斜面受力分解、磁场回旋等 6 大核心模型动态仿真，直观物理直通考场。",
    link: "/interactive",
    actionText: "进入空间",
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m3.6 9 16.8 6"/><path d="m3.6 15 16.8-6"/></svg>`,
  },
];

// 交互状态：搜索与筛选
const searchQuery = ref("");
const activeGroup = ref<string>("all");
const activeVolume = ref<string>("all");

// 分组标签
const groupTabs = [
  { key: "all", label: "全部 19 专题", count: 19 },
  { key: "mechanics", label: "经典力学 (01-08)", count: 8 },
  { key: "electromagnetism", label: "电磁学 (09-14)", count: 6 },
  { key: "waves_modern", label: "波·光·热·原 (15-18)", count: 4 },
  { key: "experiments", label: "实验专题 (19)", count: 1 },
];

// 教材版本细筛
const volumeTabs = [
  { key: "all", label: "全部教材" },
  { key: "bx1", label: "必修第一册" },
  { key: "bx2", label: "必修第二册" },
  { key: "bx3", label: "必修第三册" },
  { key: "xb1", label: "选必第一册" },
  { key: "xb2", label: "选必第二册" },
  { key: "xb3", label: "选必第三册" },
];

const setGroup = (key: string) => {
  activeGroup.value = key;
  activeVolume.value = "all";
};

const setVolume = (key: string) => {
  activeVolume.value = key;
  activeGroup.value = "all";
};

const clearFilters = () => {
  searchQuery.value = "";
  activeGroup.value = "all";
  activeVolume.value = "all";
};

// 过滤计算属性
const filteredChapters = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return chapters.filter((item) => {
    // 1. 学科分组筛选
    if (activeGroup.value !== "all" && item.group !== activeGroup.value) {
      return false;
    }
    // 2. 教材版本筛选
    if (activeVolume.value !== "all" && item.volumeTag !== activeVolume.value) {
      return false;
    }
    // 3. 搜索匹配
    if (query) {
      const matchNum = item.num.includes(query);
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchDesc = item.desc.toLowerCase().includes(query);
      const matchKeywords = item.keywords.some((kw) => kw.toLowerCase().includes(query));
      const matchVolume = item.volume.toLowerCase().includes(query);
      return matchNum || matchTitle || matchDesc || matchKeywords || matchVolume;
    }
    return true;
  });
});
</script>

<template>
  <div class="ci-master-container">
    <!-- ============================================================
         1. Master Index Hero Header (顶级学术总索引巨幕)
         ============================================================ -->
    <header class="ci-hero-section">
      <!-- 顶部发布胶囊 -->
      <div class="ci-pill-badge">
        <span class="ci-pill-dot" aria-hidden="true" />
        <span class="ci-pill-text">人教版新课标 6 册教材深度重构 · 2026 高考物理知识库</span>
        <span class="ci-pill-arrow">→</span>
      </div>

      <!-- 宏大主标题 -->
      <h1 class="ci-hero-title">
        <span class="ci-hero-title-main">高考物理知识库</span>
        <span class="ci-hero-title-tag">Yulaoshizuikeai's Physics Note</span>
      </h1>

      <!-- 核心定位导言 -->
      <p class="ci-hero-tagline">
        融合中国普通高中物理教科书（人教版必修 1-3 与选必 1-3 全套 6 册）与可汗学院直观微元思维。
        涵盖 <strong>19 大体系板块</strong>、<strong>78 幅自研高清矢量图解</strong> 与
        <strong>50 大黄金临界模型</strong>，助你建立完整清晰的物理图景，告别题海死记硬背。
      </p>

      <!-- 核心快捷入口按钮组 -->
      <div class="ci-actions-group">
        <a :href="withBase('/00%20说明/Readme')" class="ci-btn ci-btn-primary">
          <svg
            class="ci-btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <span>立即开始研读</span>
          <span class="ci-btn-arrow">→</span>
        </a>

        <a :href="withBase('/golden-conclusions')" class="ci-btn ci-btn-alt">
          <svg
            class="ci-btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            />
          </svg>
          <span>50 大黄金结论</span>
        </a>

        <a :href="withBase('/warning-cheatsheet')" class="ci-btn ci-btn-alt">
          <svg
            class="ci-btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>防踩坑排雷白皮书</span>
        </a>

        <a :href="withBase('/interactive')" class="ci-btn ci-btn-alt">
          <svg
            class="ci-btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="m3.6 9 16.8 6" />
            <path d="m3.6 15 16.8-6" />
          </svg>
          <span>可视化交互空间</span>
        </a>
      </div>

      <!-- 四联硬核指标背书条 -->
      <div class="ci-metrics-deck">
        <div class="ci-metric-item">
          <span class="ci-metric-val">19</span>
          <span class="ci-metric-label">大体系专题板块</span>
        </div>
        <div class="ci-metric-sep" />
        <div class="ci-metric-item">
          <span class="ci-metric-val">78</span>
          <span class="ci-metric-label">幅自研高清矢量图解</span>
        </div>
        <div class="ci-metric-sep" />
        <div class="ci-metric-item">
          <span class="ci-metric-val">50</span>
          <span class="ci-metric-label">大黄金结论与临界条件</span>
        </div>
        <div class="ci-metric-sep" />
        <div class="ci-metric-item">
          <span class="ci-metric-val">100%</span>
          <span class="ci-metric-label">离线可用 · 零外部依赖</span>
        </div>
      </div>

      <!-- 每日速记微电台嵌入栏 -->
      <div class="ci-quote-dock">
        <ClientOnly>
          <CCDailyQuote />
        </ClientOnly>
      </div>
    </header>

    <!-- ============================================================
         2. Quick Chapter Directory (快捷章节索引中枢)
         ============================================================ -->
    <section id="chapter-directory" class="ci-directory-section">
      <!-- 索引区域标题与说明 -->
      <div class="ci-directory-head">
        <div class="ci-head-left">
          <span class="ci-directory-tag">CHAPTER DIRECTORY</span>
          <h2 class="ci-directory-title">快捷章节索引</h2>
          <p class="ci-directory-sub">
            点击任意章节卡片即可直达核心推导与典型题型模型，支持关键字模糊匹配与多维筛选。
          </p>
        </div>
        <div class="ci-head-count">
          共 <span class="ci-highlight">{{ filteredChapters.length }}</span> / 19 个专题
        </div>
      </div>

      <!-- 交互控制台中枢：搜索框 + 分类筛选胶囊 -->
      <div class="ci-control-panel">
        <!-- 实时搜索框 -->
        <div class="ci-search-box">
          <svg class="ci-search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <circle cx="8.5" cy="8.5" r="5.5" stroke-width="1.8" />
            <path d="M12.5 12.5L16.5 16.5" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="ci-search-input"
            placeholder="快速检索章节或考点，如：追及相遇、板块、圆周、双星、电容、变压器、衰变..."
            aria-label="快速检索章节"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="ci-search-clear"
            title="清除搜索"
            @click="searchQuery = ''"
          >
            ✕
          </button>
        </div>

        <!-- 学科大类筛选标签 -->
        <div class="ci-filter-row">
          <div class="ci-filter-label">学科体系:</div>
          <div class="ci-filter-tabs">
            <button
              v-for="tab in groupTabs"
              :key="tab.key"
              type="button"
              class="ci-tab-btn"
              :class="{ 'is-active': activeGroup === tab.key && activeVolume === 'all' }"
              @click="setGroup(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- 教材版本细筛标签 -->
        <div class="ci-filter-row ci-filter-row--sub">
          <div class="ci-filter-label">按教材:</div>
          <div class="ci-filter-pills">
            <button
              v-for="v in volumeTabs"
              :key="v.key"
              type="button"
              class="ci-pill-btn"
              :class="{ 'is-active': activeVolume === v.key }"
              @click="setVolume(v.key)"
            >
              {{ v.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- 19 章节精工卡片网格 -->
      <div v-if="filteredChapters.length > 0" class="ci-chapter-grid">
        <a
          v-for="ch in filteredChapters"
          :key="ch.num"
          :href="withBase(ch.link)"
          class="ci-chapter-card"
        >
          <!-- 顶部序号与教材徽章 -->
          <div class="ci-card-header">
            <span class="ci-card-num">{{ ch.num }}</span>
            <span class="ci-card-vol-badge" :class="`vol-${ch.volumeTag}`">{{ ch.volume }}</span>
          </div>

          <!-- 章节标题 -->
          <h3 class="ci-card-title">{{ ch.title }}</h3>

          <!-- 章节概述 -->
          <p class="ci-card-desc">{{ ch.desc }}</p>

          <!-- 核心关键词标签提炼 -->
          <div class="ci-card-keywords">
            <span v-for="(kw, idx) in ch.keywords.slice(0, 4)" :key="idx" class="ci-keyword-tag">
              {{ kw }}
            </span>
            <span v-if="ch.keywords.length > 4" class="ci-keyword-more">...</span>
          </div>

          <!-- 底部直达提示与悬浮微动箭头 -->
          <div class="ci-card-footer">
            <span class="ci-card-action">研读本章模型</span>
            <svg class="ci-card-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor">
              <path
                d="M6 12l4-4-4-4"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </a>
      </div>

      <!-- 无搜索结果时友好回退 -->
      <div v-else class="ci-empty-state">
        <div class="ci-empty-icon">🔍</div>
        <h4 class="ci-empty-title">未找到匹配的物理章节</h4>
        <p class="ci-empty-desc">
          没有与 “{{ searchQuery }}” 相关的知识板块，请尝试换一个关键词或重置筛选。
        </p>
        <button type="button" class="ci-empty-reset" @click="clearFilters">重置所有筛选条件</button>
      </div>
    </section>

    <!-- ============================================================
         3. Special Highlights Section (考前必看三大特刊)
         ============================================================ -->
    <section class="ci-specials-section">
      <div class="ci-specials-head">
        <span class="ci-specials-tag">SPECIAL ARCHIVES</span>
        <h2 class="ci-specials-title">考前专项突破特刊</h2>
      </div>

      <div class="ci-specials-grid">
        <a
          v-for="item in specialCards"
          :key="item.title"
          :href="withBase(item.link)"
          class="ci-special-card"
          :class="`is-${item.tagClass}`"
        >
          <div class="ci-special-top">
            <span class="ci-special-badge" :class="`badge-${item.tagClass}`">{{ item.badge }}</span>
            <div class="ci-special-icon" v-html="item.iconSvg" />
          </div>
          <h3 class="ci-special-name">{{ item.title }}</h3>
          <p class="ci-special-desc">{{ item.desc }}</p>
          <div class="ci-special-action">
            <span>{{ item.actionText }}</span>
            <svg class="ci-special-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor">
              <path
                d="M6 12l4-4-4-4"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ============================================================
   Master Container & Global Spacing
   ============================================================ */
.ci-master-container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
  box-sizing: border-box;
}

/* ============================================================
   1. Master Index Hero Header
   ============================================================ */
.ci-hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 0 3.2rem;
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 3.2rem;
}

/* 顶部发布胶囊 */
.ci-pill-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 8%, var(--vp-c-bg-elv));
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 25%, var(--vp-c-border));
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 550;
  color: var(--vp-c-text-1);
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.ci-pill-badge:hover {
  border-color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, var(--vp-c-bg-elv));
}

.ci-pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--vp-c-brand-1) 20%, transparent);
}

.ci-pill-arrow {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

/* 宏伟主标题 */
.ci-hero-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1.25rem 0;
  border: none !important;
  padding: 0 !important;
}

.ci-hero-title-main {
  font-family: var(--vp-font-family-serif);
  font-size: 3.4rem;
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1.12;
  color: var(--vp-c-text-1);
  background: var(
    --vp-home-hero-name-background,
    linear-gradient(135deg, #374ea3 0%, #5672cd 50%, #758ee6 100%)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.ci-hero-title-tag {
  font-family: var(--vp-font-family-mono);
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
}

/* 核心导言 */
.ci-hero-tagline {
  max-width: 820px;
  font-size: 1.08rem;
  line-height: 1.75;
  color: var(--vp-c-text-2);
  margin: 0 0 2rem 0;
}

.ci-hero-tagline strong {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

/* 快捷行动按钮组 */
.ci-actions-group {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 2.2rem;
}

.ci-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 8px 18px;
  font-size: 0.92rem;
  font-weight: 600;
  border-radius: 9999px;
  text-decoration: none !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
}

.ci-btn-primary {
  background: var(--vp-c-brand-1);
  color: #ffffff !important;
  border: 1px solid var(--vp-c-brand-1);
  box-shadow: 0 4px 14px rgba(76, 103, 185, 0.28);
}

.ci-btn-primary:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 103, 185, 0.38);
}

.ci-btn-arrow {
  transition: transform 0.2s ease;
}

.ci-btn-primary:hover .ci-btn-arrow {
  transform: translateX(3px);
}

.ci-btn-alt {
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1) !important;
  border: 1px solid var(--vp-c-border);
  box-shadow: var(--vp-shadow-1);
}

.ci-btn-alt:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1) !important;
  transform: translateY(-1px);
  box-shadow: var(--vp-shadow-2);
}

.ci-btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 四联硬核指标背书条 */
.ci-metrics-deck {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  padding: 12px 24px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  gap: 20px;
  margin-bottom: 1.8rem;
  box-shadow: var(--vp-shadow-1);
}

.ci-metric-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.ci-metric-val {
  font-family: var(--vp-font-family-mono);
  font-size: 1.28rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.ci-metric-label {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.ci-metric-sep {
  width: 1px;
  height: 16px;
  background: var(--vp-c-divider);
}

/* 每日速记微电台嵌入栏 */
.ci-quote-dock {
  width: 100%;
  max-width: 780px;
  margin: 0 auto;
}

/* ============================================================
   2. Quick Chapter Directory (快捷章节索引中枢)
   ============================================================ */
.ci-directory-section {
  margin-bottom: 4rem;
}

.ci-directory-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 1.5rem;
}

.ci-directory-tag {
  font-family: var(--vp-font-family-mono);
  font-size: 0.76rem;
  letter-spacing: 0.1em;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.ci-directory-title {
  font-family: var(--vp-font-family-serif);
  font-size: 2.1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  letter-spacing: -0.02em;
  margin: 0 0 0.35rem 0;
  border: none !important;
  padding: 0 !important;
}

.ci-directory-sub {
  font-size: 0.92rem;
  color: var(--vp-c-text-2);
  margin: 0;
}

.ci-head-count {
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
}

.ci-highlight {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

/* 交互控制台面板 */
.ci-control-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem 1.4rem;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
  border-radius: 14px;
  box-shadow: var(--vp-shadow-1);
  margin-bottom: 2rem;
}

/* 搜索框 */
.ci-search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.ci-search-icon {
  position: absolute;
  left: 14px;
  width: 18px;
  height: 18px;
  color: var(--vp-c-text-3);
  pointer-events: none;
}

.ci-search-input {
  width: 100%;
  min-height: 46px;
  padding: 10px 40px 10px 42px;
  font-size: 0.92rem;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 10px;
  box-sizing: border-box;
  outline: none;
  transition: all 0.2s ease;
}

.ci-search-input:focus {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-elv);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--vp-c-brand-1) 15%, transparent);
}

.ci-search-clear {
  position: absolute;
  right: 12px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: var(--vp-c-text-3);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.16s ease;
}

.ci-search-clear:hover {
  background: var(--vp-c-gutter);
  color: var(--vp-c-text-1);
}

/* 筛选按钮行 */
.ci-filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.ci-filter-row--sub {
  padding-top: 0.5rem;
  border-top: 1px dashed var(--vp-c-divider);
}

.ci-filter-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  width: 60px;
  flex-shrink: 0;
}

.ci-filter-tabs,
.ci-filter-pills {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.ci-tab-btn {
  min-height: 34px;
  padding: 6px 13px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.ci-tab-btn:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-brand-1);
}

.ci-tab-btn.is-active {
  color: #ffffff;
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 2px 8px rgba(76, 103, 185, 0.25);
}

.ci-pill-btn {
  min-height: 28px;
  padding: 3px 10px;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--vp-c-text-3);
  background: transparent;
  border: 1px solid var(--vp-c-divider);
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.16s ease;
}

.ci-pill-btn:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-border);
}

.ci-pill-btn.is-active {
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  border-color: var(--vp-c-brand-1);
  font-weight: 600;
}

/* 19 章节卡片网格 */
.ci-chapter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

.ci-chapter-card {
  display: flex;
  flex-direction: column;
  padding: 1.35rem 1.4rem;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  text-decoration: none !important;
  color: var(--vp-c-text-1) !important;
  box-shadow: var(--vp-shadow-card);
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.ci-chapter-card:hover {
  transform: translateY(-3px);
  border-color: var(--vp-c-brand-1);
  box-shadow: var(--vp-shadow-3);
}

.ci-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.ci-card-num {
  font-family: var(--vp-font-family-mono);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.ci-card-vol-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 0.72rem;
  font-weight: 600;
  border-radius: 9999px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
  border: 1px solid var(--vp-c-border);
}

.vol-bx1,
.vol-bx2,
.vol-bx3 {
  background: var(--vp-pastel-blue);
  color: var(--vp-pastel-blue-text);
  border-color: var(--vp-pastel-blue-border);
}

.vol-xb1,
.vol-xb2,
.vol-xb3 {
  background: var(--vp-pastel-purple);
  color: var(--vp-pastel-purple-text);
  border-color: var(--vp-pastel-purple-border);
}

.vol-exp {
  background: var(--vp-pastel-yellow);
  color: var(--vp-pastel-yellow-text);
  border-color: var(--vp-pastel-yellow-border);
}

.ci-card-title {
  font-size: 1.08rem;
  font-weight: 650;
  color: var(--vp-c-text-1);
  line-height: 1.35;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.015em;
  transition: color 0.18s ease;
}

.ci-chapter-card:hover .ci-card-title {
  color: var(--vp-c-brand-1);
}

.ci-card-desc {
  font-size: 0.84rem;
  color: var(--vp-c-text-2);
  line-height: 1.55;
  margin: 0 0 1rem 0;
  flex: 1;
}

/* 核心关键词标签 */
.ci-card-keywords {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 1rem;
}

.ci-keyword-tag {
  display: inline-block;
  padding: 2px 7px;
  font-size: 0.74rem;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
}

.ci-keyword-more {
  font-size: 0.74rem;
  color: var(--vp-c-text-3);
}

/* 卡片底栏 */
.ci-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.ci-card-arrow {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.ci-chapter-card:hover .ci-card-arrow {
  transform: translateX(4px);
}

/* 空搜索状态 */
.ci-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3.5rem 1rem;
  background: var(--vp-c-bg-elv);
  border: 1px dashed var(--vp-c-border);
  border-radius: 12px;
}

.ci-empty-icon {
  font-size: 2.2rem;
  margin-bottom: 0.75rem;
}

.ci-empty-title {
  font-size: 1.15rem;
  font-weight: 650;
  color: var(--vp-c-text-1);
  margin: 0 0 0.4rem 0;
}

.ci-empty-desc {
  font-size: 0.9rem;
  color: var(--vp-c-text-3);
  margin: 0 0 1.25rem 0;
}

.ci-empty-reset {
  padding: 8px 18px;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.ci-empty-reset:hover {
  background: var(--vp-c-brand-1);
  color: #ffffff;
}

/* ============================================================
   3. Special Highlights Section (考前必看三大特刊)
   ============================================================ */
.ci-specials-section {
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-divider);
}

.ci-specials-head {
  text-align: center;
  margin-bottom: 2rem;
}

.ci-specials-tag {
  font-family: var(--vp-font-family-mono);
  font-size: 0.76rem;
  letter-spacing: 0.1em;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.ci-specials-title {
  font-family: var(--vp-font-family-serif);
  font-size: 1.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0;
  letter-spacing: -0.02em;
  border: none !important;
  padding: 0 !important;
}

.ci-specials-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

.ci-special-card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1.4rem;
  background-color: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  text-decoration: none !important;
  color: var(--vp-c-text-1) !important;
  box-shadow: var(--vp-shadow-card);
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.ci-special-card:hover {
  transform: translateY(-2px);
  border-color: var(--vp-c-brand-1);
  box-shadow: var(--vp-shadow-2);
}

.ci-special-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.ci-special-icon {
  width: 22px;
  height: 22px;
  color: var(--vp-c-text-2);
}

.ci-special-card:hover .ci-special-icon {
  color: var(--vp-c-brand-1);
}

.ci-special-name {
  font-size: 1.12rem;
  font-weight: 650;
  line-height: 1.35;
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
  letter-spacing: -0.015em;
}

.ci-special-desc {
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0 0 1.25rem 0;
  flex: 1;
}

.ci-special-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.ci-special-arrow {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.ci-special-card:hover .ci-special-arrow {
  transform: translateX(3px);
}

.ci-special-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2em 0.65em;
  font-family: var(--vp-font-family-mono);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  border-radius: 9999px;
  line-height: 1.2;
}

/* ============================================================
   4. Responsive Breakpoints
   ============================================================ */
@media (max-width: 1024px) {
  .ci-chapter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .ci-hero-title-main {
    font-size: 2.5rem;
  }
  .ci-hero-tagline {
    font-size: 0.98rem;
  }
  .ci-metrics-deck {
    gap: 12px;
    padding: 10px 14px;
  }
  .ci-metric-sep {
    display: none;
  }
  .ci-chapter-grid,
  .ci-specials-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .ci-directory-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
