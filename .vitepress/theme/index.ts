import type { App } from "vue";

import DefaultTheme from "vitepress/theme";

import CCActivitySparkline from "./components/CCActivitySparkline.vue";
import CCBackToTop from "./components/CCBackToTop.vue";
import CCChapterOverview from "./components/CCChapterOverview.vue";
import CCDailyQuote from "./components/CCDailyQuote.vue";
import CCPdfDownloadButton from "./components/CCPdfDownloadButton.vue";
import CCSiteSettings from "./components/CCSiteSettings.vue";
import "./style/index.css";
import "./custom.css";
import "@waline/client/style";

import CCInteractiveLab from "./components/interactive/CCInteractiveLab.vue";
import CCKnowledgeGraph from "./components/interactive/CCKnowledgeGraph.vue";
import CCPhysicsSimulator from "./components/interactive/CCPhysicsSimulator.vue";
import CCShare from "./components/shortUrl/CCShare.vue";
import layout from "./layout.vue";

export default {
  extends: DefaultTheme,
  Layout: layout,
  enhanceApp({ app }: { app: App }) {
    app.component("CCPdfDownloadButton", CCPdfDownloadButton);
    app.component("CCBackToTop", CCBackToTop);
    app.component("CCSiteSettings", CCSiteSettings);
    app.component("CCShare", CCShare);
    app.component("CCChapterOverview", CCChapterOverview);
    app.component("CCActivitySparkline", CCActivitySparkline);
    app.component("CCDailyQuote", CCDailyQuote);
    app.component("CCPhysicsSimulator", CCPhysicsSimulator);
    app.component("CCInteractiveLab", CCInteractiveLab);
    app.component("CCKnowledgeGraph", CCKnowledgeGraph);
  },
};
