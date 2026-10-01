<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { FilePlus2, Plus, History, Download, Database, Search, ShieldCheck, Sparkles } from "@lucide/vue";
import DatabaseIcon from "@/components/icons/DatabaseIcon.vue";
import TruncatedTextTooltip from "@/components/ui/TruncatedTextTooltip.vue";
import { connectionDriverLabel, connectionIconType, connectionRedactedNameLabel, connectionRedactedOptionSubtitle } from "@/lib/connection/connectionPresentation";
import type { ConnectionConfig } from "@/types/database";

export interface WelcomeSavedSqlHistoryItem {
  id: string;
  name: string;
  connectionName: string;
  database?: string;
  folderName?: string;
  openCount?: number;
}

defineProps<{
  connectionStats: { total: number; connected: number; types: number };
  recentConnections: ConnectionConfig[];
  savedSqlHistoryItems: WelcomeSavedSqlHistoryItem[];
  appVersion: string;
  canNewQuery: boolean;
}>();

const emit = defineEmits<{
  "open-connection-query": [connectionId: string];
  "open-saved-sql": [fileId: string];
  "new-connection": [];
  "new-query": [];
  "show-history": [];
  "import-config": [];
  "open-github": [];
  "open-mcp-guide": [];
}>();

const { t } = useI18n();

function welcomeConnectionSubtitle(connection: ConnectionConfig): string {
  return connectionRedactedOptionSubtitle(connection) || connectionDriverLabel(connection);
}
</script>

<template>
  <div class="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-background">
    <div class="s7-home mx-auto flex min-h-full w-full max-w-6xl flex-col gap-6 px-8 py-10">
      <section class="s7-hero relative overflow-hidden rounded-2xl border border-border/70 bg-card">
        <div class="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div class="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div class="relative px-7 py-8 md:px-9 md:py-10">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-3xl">
              <div class="mb-4 flex items-center gap-3">
                <div class="s7-mark flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-lg font-bold text-primary">
                  S7
                </div>
                <div>
                  <div class="text-xs font-semibold uppercase tracking-[0.22em] text-primary">SIMBIOSIS7</div>
                  <div class="text-[11px] text-muted-foreground">AI Engineering Platform</div>
                </div>
              </div>
              <h1 class="text-3xl font-semibold tracking-tight md:text-4xl">
                Your engineering workspace.
              </h1>
              <p class="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Connect code, data, AI, agents, cloud infrastructure and knowledge in one workspace.
                Simbiosis7 turns your engineering environment into an intelligent control plane.
              </p>
            </div>
            <div class="flex shrink-0 flex-wrap gap-2">
              <button class="s7-primary-action rounded-lg px-4 py-2.5 text-sm font-medium" @click="emit('new-connection')">
                New database
              </button>
              <button v-if="canNewQuery" class="rounded-lg border bg-background/70 px-4 py-2.5 text-sm font-medium hover:bg-muted" @click="emit('new-query')">
                New query
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="s7-stat rounded-xl border bg-card px-5 py-4">
          <div class="text-xs uppercase tracking-wider text-muted-foreground">Connections</div>
          <div class="mt-2 text-2xl font-semibold">{{ connectionStats.total }}</div>
          <div class="mt-1 text-xs text-muted-foreground">{{ connectionStats.connected }} currently connected</div>
        </div>
        <div class="s7-stat rounded-xl border bg-card px-5 py-4">
          <div class="text-xs uppercase tracking-wider text-muted-foreground">Data engines</div>
          <div class="mt-2 text-2xl font-semibold">{{ connectionStats.types }}</div>
          <div class="mt-1 text-xs text-muted-foreground">Database technologies available</div>
        </div>
        <div class="s7-stat rounded-xl border bg-card px-5 py-4">
          <div class="text-xs uppercase tracking-wider text-muted-foreground">Workspace</div>
          <div class="mt-2 text-2xl font-semibold">Ready</div>
          <div class="mt-1 text-xs text-muted-foreground">Code · Data · AI · Cloud</div>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="rounded-xl border bg-card p-5 lg:col-span-2">
          <div class="mb-5 flex items-center justify-between">
            <div>
              <h2 class="text-sm font-semibold">Engineering workspace</h2>
              <p class="mt-1 text-xs text-muted-foreground">The Simbiosis7 platform is built around projects, not isolated connections.</p>
            </div>
            <span class="rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Core</span>
          </div>
          <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div class="s7-module rounded-lg border bg-muted/15 p-4">
              <div class="text-sm font-medium">Code</div>
              <div class="mt-1 text-xs text-muted-foreground">Repositories & APIs</div>
            </div>
            <div class="s7-module rounded-lg border bg-muted/15 p-4">
              <div class="text-sm font-medium">Data</div>
              <div class="mt-1 text-xs text-muted-foreground">SQL & databases</div>
            </div>
            <div class="s7-module rounded-lg border bg-muted/15 p-4">
              <div class="text-sm font-medium">AI</div>
              <div class="mt-1 text-xs text-muted-foreground">Models & RAG</div>
            </div>
            <div class="s7-module rounded-lg border bg-muted/15 p-4">
              <div class="text-sm font-medium">Agents</div>
              <div class="mt-1 text-xs text-muted-foreground">Tools & automation</div>
            </div>
            <div class="s7-module rounded-lg border bg-muted/15 p-4">
              <div class="text-sm font-medium">Cloud</div>
              <div class="mt-1 text-xs text-muted-foreground">AWS · Azure · K8s</div>
            </div>
            <div class="s7-module rounded-lg border bg-muted/15 p-4">
              <div class="text-sm font-medium">Knowledge</div>
              <div class="mt-1 text-xs text-muted-foreground">Docs & context</div>
            </div>
            <div class="s7-module rounded-lg border bg-muted/15 p-4">
              <div class="text-sm font-medium">MCP</div>
              <div class="mt-1 text-xs text-muted-foreground">Connected tools</div>
            </div>
            <div class="s7-module rounded-lg border bg-muted/15 p-4">
              <div class="text-sm font-medium">Observability</div>
              <div class="mt-1 text-xs text-muted-foreground">Logs & events</div>
            </div>
          </div>
        </div>

        <div class="rounded-xl border bg-card p-5">
          <h2 class="text-sm font-semibold">Quick actions</h2>
          <div class="mt-4 grid gap-1">
            <button class="s7-action" @click="emit('new-connection')">Add database connection</button>
            <button v-if="canNewQuery" class="s7-action" @click="emit('new-query')">Open SQL workspace</button>
            <button class="s7-action" @click="emit('show-history')">View query history</button>
            <button class="s7-action" @click="emit('import-config')">Import connections</button>
            <button class="s7-action" @click="emit('open-mcp-guide')">Configure MCP</button>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div class="overflow-hidden rounded-xl border bg-card">
          <div class="border-b px-5 py-4">
            <h2 class="text-sm font-semibold">Recent databases</h2>
            <p class="mt-1 text-xs text-muted-foreground">Continue where you left off.</p>
          </div>
          <div class="divide-y">
            <button
              v-for="connection in recentConnections"
              :key="connection.id"
              class="flex w-full min-w-0 items-center gap-3 px-5 py-3 text-left hover:bg-muted/40"
              @click="emit('open-connection-query', connection.id)"
            >
              <DatabaseIcon :db-type="connectionIconType(connection)" class="h-4 w-4 shrink-0" />
              <div class="min-w-0 flex-1">
                <TruncatedTextTooltip :text="connectionRedactedNameLabel(connection)" class="block text-sm font-medium" />
                <TruncatedTextTooltip :text="welcomeConnectionSubtitle(connection)" class="block text-xs text-muted-foreground" />
              </div>
              <FilePlus2 class="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
            <div v-if="recentConnections.length === 0" class="px-5 py-8 text-sm text-muted-foreground">
              No database connections yet.
            </div>
          </div>
        </div>

        <div class="overflow-hidden rounded-xl border bg-card">
          <div class="border-b px-5 py-4">
            <h2 class="text-sm font-semibold">Recent SQL</h2>
            <p class="mt-1 text-xs text-muted-foreground">Saved queries and frequently used work.</p>
          </div>
          <div class="divide-y">
            <button
              v-for="item in savedSqlHistoryItems"
              :key="item.id"
              class="flex w-full min-w-0 items-center gap-3 px-5 py-3 text-left hover:bg-muted/40"
              @click="emit('open-saved-sql', item.id)"
            >
              <History class="h-4 w-4 shrink-0 text-muted-foreground" />
              <div class="min-w-0 flex-1">
                <div class="truncate text-sm font-medium">{{ item.name }}</div>
                <div class="truncate text-xs text-muted-foreground">
                  {{ item.connectionName }}<span v-if="item.database"> · {{ item.database }}</span>
                </div>
              </div>
            </button>
            <div v-if="savedSqlHistoryItems.length === 0" class="px-5 py-8 text-sm text-muted-foreground">
              No saved SQL yet.
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-xl border bg-muted/10 px-5 py-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div class="text-sm font-medium">MCP & AI-ready infrastructure</div>
            <p class="mt-1 text-xs leading-5 text-muted-foreground">
              Connect external AI clients and agents to your engineering workspace through MCP.
            </p>
          </div>
          <button class="rounded-lg border bg-background px-3 py-2 text-xs font-medium hover:bg-muted" @click="emit('open-mcp-guide')">
            Learn about MCP
          </button>
        </div>
      </section>

      <footer class="flex items-center justify-between border-t pt-4 text-[11px] text-muted-foreground/60">
        <span>Simbiosis7{{ appVersion ? " · v" + appVersion : "" }}</span>
        <button class="hover:text-foreground" @click="emit('open-github')">GitHub</button>
      </footer>
    </div>
  </div>
</template>

<style>
.s7-home {
  max-width: 72rem;
}

.s7-hero {
  box-shadow: 0 18px 50px -35px hsl(var(--primary) / 0.45);
}

.s7-primary-action {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.s7-primary-action:hover {
  opacity: 0.9;
}

.s7-action {
  width: 100%;
  border-radius: 0.5rem;
  padding: 0.6rem 0.75rem;
  text-align: left;
  font-size: 0.8rem;
}

.s7-action:hover,
.s7-module:hover {
  background: hsl(var(--muted) / 0.55);
}

.s7-module {
  transition: background-color 120ms ease;
}
</style>
