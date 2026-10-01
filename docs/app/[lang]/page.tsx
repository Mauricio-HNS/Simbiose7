import Link from "next/link";
import type { Metadata } from "next";
import { Starfield } from "@/components/landing/Starfield";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { InstallTabs } from "@/components/landing/InstallTabs";
import { RevealSection } from "@/components/landing/RevealSection";
import { DatabasePillMarquee } from "@/components/landing/DatabasePillMarquee";
import { databaseSupport } from "@/data/databaseSupport";
import { getAppVersion } from "@/lib/appVersion";
import { fetchLatestReleaseInfo } from "@/lib/latestRelease";
import { buildMetadata, getHtmlLang } from "@/lib/metadata";
import { buildSoftwareApplicationStructuredData, serializeStructuredData } from "@/lib/structuredData";
import { ArrowRight, Bot, Boxes, Cloud, Database, FileCode, Network, Shield, Sparkles, Workflow } from "lucide-react";
import { resolveLang, type DocsLang } from "@/lib/i18n";

const copy: Record<DocsLang, {
  title: string; subtitle: string; start: string; docs: string;
  platform: string; platformDesc: string; database: string; databaseDesc: string;
  ai: string; agents: string; knowledge: string; cloud: string; automation: string; mcp: string;
  architecture: string; architectureDesc: string; final: string; finalDesc: string; release: string;
}> = {
  en: {
    title: "The engineering workspace for the AI era.",
    subtitle: "Simbiosis7 connects code, data, AI, agents, knowledge, cloud infrastructure and automation in one intelligent workspace.",
    start: "Start building", docs: "Explore the platform",
    platform: "One workspace. Every engineering context.", platformDesc: "Projects become the center of your engineering environment.",
    database: "Data foundation", databaseDesc: "Work with SQL and NoSQL systems from a single data workspace.",
    ai: "AI", agents: "Agents", knowledge: "Knowledge", cloud: "Cloud", automation: "Automation", mcp: "MCP",
    architecture: "Designed for connected engineering", architectureDesc: "Project context flows into AI tools, agents and controlled execution.",
    final: "Build with Simbiosis7.", finalDesc: "A unified foundation for software engineering, AI and automation.",
    release: "Open release",
  },
  cn: {
    title: "面向 AI 时代的工程工作空间。",
    subtitle: "Simbiosis7 将代码、数据、AI、智能体、知识、云基础设施和自动化连接到一个统一工作空间。",
    start: "开始构建", docs: "探索平台",
    platform: "一个工作区，连接所有工程上下文。", platformDesc: "Project 成为整个工程环境的中心。",
    database: "数据基础", databaseDesc: "在统一的数据工作空间中管理 SQL 与 NoSQL 系统。",
    ai: "AI", agents: "智能体", knowledge: "知识", cloud: "云", automation: "自动化", mcp: "MCP",
    architecture: "为互联工程而设计", architectureDesc: "项目上下文可以流入 AI 工具、智能体和受控执行流程。",
    final: "使用 Simbios7 构建。", finalDesc: "软件工程、AI 与自动化的统一基础。",
    release: "最新版本",
  },
};

const modules = [
  { icon: FileCode, key: "code", title: "Code", desc: "Repositories, APIs and architecture" },
  { icon: Database, key: "database", title: "Data", desc: "SQL, NoSQL and data operations" },
  { icon: Sparkles, key: "ai", title: "AI", desc: "LLMs and project-aware intelligence" },
  { icon: Bot, key: "agents", title: "Agents", desc: "Planning, tools and execution" },
  { icon: Boxes, key: "knowledge", title: "Knowledge", desc: "Docs, context and RAG" },
  { icon: Cloud, key: "cloud", title: "Cloud", desc: "Infrastructure and containers" },
  { icon: Workflow, key: "automation", title: "Automation", desc: "Repeatable engineering workflows" },
  { icon: Network, key: "mcp", title: "MCP", desc: "Models, tools and integrations" },
];

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const l = resolveLang(lang);
  return buildMetadata({
    title: l === "cn" ? "Simbiosis7 - AI 工程平台" : "Simbiosis7 - AI Engineering Platform",
    description: copy[l].subtitle,
    path: `/${l}`,
    lang: l,
    ogType: "website",
  });
}

export default async function LandingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = resolveLang(lang);
  const t = copy[l];
  const appVersion = getAppVersion();
  const latest = await fetchLatestReleaseInfo();
  const version = latest?.version ?? appVersion;
  const structuredData = buildSoftwareApplicationStructuredData(l, version);

  return (
    <main className="landing" lang={getHtmlLang(l)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData) }} />
      <Starfield />
      <LandingNav lang={l} active="home" />

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="relative z-[1] mx-auto max-w-[1180px] px-7 py-20 text-center max-[760px]:px-[18px]">
          <div className="mx-auto max-w-[900px]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-landing-line bg-landing-panel px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-blue">
              <Sparkles size={13} /> SIMBIOSIS7
            </div>
            <h1 id="landing-title" className="m-0 text-[clamp(38px,5vw,64px)] font-[820] leading-[1.04] text-landing-ink">
              {t.title}
            </h1>
            <p className="mx-auto mt-6 max-w-[760px] text-[17px] leading-[1.8] text-landing-muted max-[760px]:text-[15px]">
              {t.subtitle}
            </p>
            <div className="mx-auto mt-9 max-w-[520px]"><InstallTabs lang={l} version={version} /></div>
            <Link href={`/${l}/docs/getting-started`} className="landing-inline-link mt-6 inline-flex items-center gap-2 text-sm font-[650]">
              {t.docs} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <RevealSection className="mx-auto grid max-w-[1180px] grid-cols-4 gap-3 px-7 pb-12 max-[760px]:grid-cols-2 max-[760px]:px-[18px]">
        {[
          ["1", "Workspace"],
          ["∞", "Connected context"],
          ["AI", "Native intelligence"],
          ["MCP", "Tool ecosystem"],
        ].map(([value, label]) => (
          <div key={label} className="landing-glass-card min-h-[105px] rounded-[10px] p-5">
            <strong className="block text-2xl font-[720] text-landing-ink">{value}</strong>
            <span className="mt-1 block text-[13px] text-landing-muted">{label}</span>
          </div>
        ))}
      </RevealSection>

      <RevealSection className="mx-auto max-w-[1180px] px-7 pt-12 max-[760px]:px-[18px]">
        <div className="mb-7 max-w-[720px]">
          <h2 className="m-0 text-[28px] font-[720] text-landing-ink">{t.platform}</h2>
          <p className="mt-2.5 text-sm leading-[1.7] text-landing-muted">{t.platformDesc}</p>
        </div>
        <div className="grid grid-cols-4 overflow-hidden rounded-[10px] border border-landing-line max-[900px]:grid-cols-2 max-[500px]:grid-cols-1">
          {modules.map((item) => (
            <div key={item.key} className="border-b border-r border-landing-line p-6 transition-colors hover:bg-landing-panel">
              <item.icon size={20} className="text-landing-blue" />
              <h3 className="mt-4 text-base font-[700] text-landing-ink">{item.title}</h3>
              <p className="mt-2 text-[13px] leading-[1.6] text-landing-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="mx-auto max-w-[1180px] px-7 pt-[80px] max-[760px]:px-[18px]">
        <div className="grid gap-9 lg:grid-cols-2">
          <div>
            <h2 className="text-[28px] font-[720] text-landing-ink">{t.architecture}</h2>
            <p className="mt-3 max-w-[560px] text-sm leading-[1.75] text-landing-muted">{t.architectureDesc}</p>
          </div>
          <div className="landing-glass-card rounded-[10px] p-6 font-mono text-xs leading-7 text-landing-muted">
            <div className="text-landing-blue">Project</div>
            <div>├── Code</div>
            <div>├── Data</div>
            <div>├── AI</div>
            <div>├── Agents</div>
            <div>├── Knowledge</div>
            <div>├── Cloud</div>
            <div>├── MCP</div>
            <div>└── Automation</div>
            <div className="mt-3 border-t border-landing-line pt-3 text-landing-ink">Context → Tools → Execution → Verification</div>
          </div>
        </div>
      </RevealSection>

      <RevealSection className="mx-auto max-w-[1180px] px-7 pt-[80px] max-[760px]:px-[18px]">
        <div className="mb-7">
          <h2 className="text-[28px] font-[720] text-landing-ink">{t.database}</h2>
          <p className="mt-2.5 text-sm leading-[1.7] text-landing-muted">{t.databaseDesc}</p>
        </div>
        <DatabasePillMarquee items={databaseSupport.filter((db) => !db.href)} />
      </RevealSection>

      <RevealSection className="mx-auto mt-[80px] mb-14 flex max-w-[1180px] items-center justify-between gap-6 rounded-[10px] border border-landing-line bg-landing-panel px-7 py-8 max-[760px]:block max-[760px]:mx-[18px] max-[760px]:px-[18px]">
        <div>
          <h2 className="text-[28px] font-[720] text-landing-ink">{t.final}</h2>
          <p className="mt-2 text-sm leading-[1.7] text-landing-muted">{t.finalDesc}</p>
        </div>
        <Link href={`/${l}/docs/getting-started`} className="landing-final-link inline-flex items-center gap-2 rounded-[7px] px-4 py-2.5 text-sm font-[650]">
          {t.release} <ArrowRight size={15} />
        </Link>
      </RevealSection>

      <LandingFooter lang={l} />
    </main>
  );
}
