<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { translateBackendError } from "@/i18n/backend-errors";
import { Upload, Download, ArrowDownUp, FolderPlus, FolderOpen, RefreshCw, ChevronsLeft, ChevronsDownUp, Trash2, FolderInput, Check, Minus, Square, X } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import LightDropdown from "@/components/ui/LightDropdown.vue";
import LightTooltip from "@/components/ui/LightTooltip.vue";
import PluginShortcutBar from "@/components/plugins/PluginShortcutBar.vue";
import { useSettingsStore } from "@/stores/settingsStore";
import ConnectionTree from "@/components/sidebar/ConnectionTree.vue";
import { applyConnectionMultiSelection, emptyConnectionMultiSelection, isExitConnectionMultiSelectionShortcut } from "@/lib/sidebar/sidebarConnectionMultiSelect";
import { connectionGroupDestinationRows } from "@/lib/sidebar/sidebarLayout";
import { useConnectionStore } from "@/stores/connectionStore";
import { useToast } from "@/composables/useToast";
import type { QueryTab, TreeNode } from "@/types/database";

defineProps<{
  sidebarWidth: number;
  classicLayout?: boolean;
}>();

const emit = defineEmits<{
  import: [source: "dbx" | "navicat" | "dbeaver" | "datagrip"];
  export: [];
  startResize: [event: PointerEvent];
  collapse: [];
  "open-settings": [initialTab: string];
  "add-to-ai": [nodes: TreeNode | TreeNode[]];
}>();

type ImportSource = "dbx" | "navicat" | "dbeaver" | "datagrip";

const { t } = useI18n();
const connectionStore = useConnectionStore();
const settingsStore = useSettingsStore();
const { toast } = useToast();
const connectionTreeRef = ref<InstanceType<typeof ConnectionTree>>();
const showDeleteSelectedConfirm = ref(false);
const showCreateSelectedGroupDialog = ref(false);
const selectedGroupName = ref("");
const UNGROUPED_GROUP_VALUE = "__ungrouped";
const importSourceItems = computed(() => [
  { value: "dbx", label: t("sidebar.importDbx") },
  { value: "navicat", label: t("sidebar.importNavicat") },
  { value: "dbeaver", label: t("sidebar.importDbeaver") },
  { value: "datagrip", label: t("sidebar.importDatagrip") },
]);
const connectionTransferItems = computed(() => [
  ...importSourceItems.value.map((item) => ({
    ...item,
    value: `import:${item.value}`,
    icon: Download,
  })),
  {
    value: "export",
    label: t("sidebar.export"),
    icon: Upload,
    separatorBefore: true,
  },
]);
const connectionTransferLabel = computed(() => t("sidebar.importExport"));
const connectionIdSet = computed(() => new Set(connectionStore.connections.map((connection) => connection.id)));
const allConnectionIds = computed(() => connectionStore.connections.map((connection) => connection.id));
const selectedConnectionIds = computed(() => (connectionStore.connectionMultiSelectActive ? connectionStore.selectedTreeNodeIds.filter((id) => connectionIdSet.value.has(id)) : []));
const selectedConnectionCount = computed(() => selectedConnectionIds.value.length);
const showConnectionMultiSelectToolbar = computed(() => connectionStore.connectionMultiSelectActive && selectedConnectionCount.value > 0);
const allConnectionsSelected = computed(() => allConnectionIds.value.length > 0 && selectedConnectionCount.value === allConnectionIds.value.length);
const selectAllIcon = computed(() => (allConnectionsSelected.value ? Check : selectedConnectionCount.value > 0 ? Minus : Square));
const selectAllLabel = computed(() => (allConnectionsSelected.value ? t("connectionGroup.deselectAllConnections") : t("connectionGroup.selectAllConnections")));
const moveGroupItems = computed(() => [
  ...connectionGroupDestinationRows(connectionStore.sidebarLayout).map((group) => ({
    value: group.id,
    label: group.name,
    title: group.path.join(" / "),
    icon: FolderOpen,
    indentLevel: group.depth,
  })),
  {
    value: UNGROUPED_GROUP_VALUE,
    label: t("connectionGroup.ungrouped"),
    separatorBefore: connectionStore.sidebarLayout.groups.length > 0,
  },
]);

async function refreshTree() {
  try {
    await connectionStore.reloadFromDisk();
    await connectionStore.refreshAllTree();
  } catch (e: any) {
    toast(t("connection.connectFailed", { message: translateBackendError(t, e) }), 5000);
  }
}

function createNewGroup() {
  void connectionTreeRef.value?.createNewGroup();
}

function selectImportSource(source: string) {
  emit("import", source as ImportSource);
}

function selectConnectionTransferAction(action: string) {
  if (action === "export") {
    emit("export");
    return;
  }
  if (action.startsWith("import:")) selectImportSource(action.slice("import:".length));
}

function collapseAllTreeNodes() {
  connectionTreeRef.value?.collapseAllTreeNodes();
}

function focusSearch(target: Element | null = null): boolean {
  return connectionTreeRef.value?.focusSearch(target) ?? false;
}

function locateTabInSidebar(tab: QueryTab) {
  return connectionTreeRef.value?.locateTabInSidebar(tab);
}

function clearConnectionMultiSelection() {
  applyConnectionMultiSelection(connectionStore, emptyConnectionMultiSelection());
}

function isEditableSidebarTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target.isContentEditable || !!target.closest("[contenteditable='true'], [role='textbox']");
}

function onSidebarKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented || !connectionStore.connectionMultiSelectActive || !isExitConnectionMultiSelectionShortcut(event) || isEditableSidebarTarget(event.target)) return;
  event.preventDefault();
  event.stopPropagation();
  clearConnectionMultiSelection();
}

function toggleAllConnectionsSelected() {
  if (allConnectionsSelected.value) {
    clearConnectionMultiSelection();
    return;
  }

  const ids = allConnectionIds.value;
  connectionStore.connectionMultiSelectActive = ids.length > 0;
  connectionStore.selectedTreeNodeIds = ids;
  connectionStore.selectedTreeNodeId = ids[0] ?? null;
  connectionStore.treeSelectionAnchorId = ids[0] ?? null;
}

async function confirmDeleteSelectedConnections() {
  const ids = selectedConnectionIds.value;
  if (ids.length === 0) return;
  try {
    await connectionStore.removeConnections(ids);
    for (const connectionId of ids) {
      // 页签已由 removeConnections 按「删除连接」策略处理，这里只清会话。
      connectionStore.disconnect(connectionId, { skipTabHandling: true }).catch((error) => {
        console.warn("[DBX][connection:delete:disconnect-failed]", { connectionId, error });
      });
    }
    clearConnectionMultiSelection();
    showDeleteSelectedConfirm.value = false;
    toast(t("connection.deletedSelected", { count: ids.length }), 2000);
  } catch (e: any) {
    toast(t("connection.saveFailed", { message: e?.message || String(e) }), 5000);
  }
}

function moveSelectedConnectionsToGroup(value: string) {
  const groupId = value === UNGROUPED_GROUP_VALUE ? null : value;
  const ids = selectedConnectionIds.value;
  for (const connectionId of ids) {
    connectionStore.moveConnectionToGroup(connectionId, groupId);
  }
  // The moved connections stay selected otherwise, so the next batch would be
  // moved together with them (issue #5758).
  clearConnectionMultiSelection();
}

function openCreateSelectedGroupDialog() {
  selectedGroupName.value = "";
  showCreateSelectedGroupDialog.value = true;
}

function confirmCreateSelectedGroup() {
  const name = selectedGroupName.value.trim();
  const ids = selectedConnectionIds.value;
  if (!name || ids.length === 0) return;
  const groupId = connectionStore.createConnectionGroup(name);
  for (const connectionId of ids) {
    connectionStore.moveConnectionToGroup(connectionId, groupId);
  }
  clearConnectionMultiSelection();
  showCreateSelectedGroupDialog.value = false;
}

defineExpose({ focusSearch, locateTabInSidebar });
</script>

<template>
  <div
    data-app-sidebar
    class="app-sidebar-panel relative h-full shrink-0 select-none"
    :class="classicLayout ? '' : 'rounded-md border border-border/80 bg-background'"
    :style="{ width: sidebarWidth + 'px' }"
    @keydown="onSidebarKeydown"
  >
    <div class="flex h-full flex-col overflow-hidden">
      <div class="s7-sidebar-brand border-b px-3 py-3">
        <div class="flex items-center gap-2.5">
          <div class="s7-sidebar-mark flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-xs font-bold text-primary">
            S7
          </div>
          <div class="min-w-0">
            <div class="truncate text-xs font-bold tracking-[0.18em] text-foreground">SIMBIOSIS7</div>
            <div class="truncate text-[10px] text-muted-foreground">Engineering Workspace</div>
          </div>
        </div>
      </div>

      <div class="s7-nav-section px-2 py-3">
        <div class="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">Workspace</div>
        <button class="s7-nav-item s7-nav-active">
          <span class="s7-nav-icon">⌂</span>
          <span>Overview</span>
        </button>
        <button class="s7-nav-item">
          <span class="s7-nav-icon">▣</span>
          <span>Projects</span>
        </button>
        <button class="s7-nav-item">
          <span class="s7-nav-icon">✦</span>
          <span>AI & Agents</span>
        </button>
        <button class="s7-nav-item">
          <span class="s7-nav-icon">◇</span>
          <span>Knowledge</span>
        </button>
        <button class="s7-nav-item">
          <span class="s7-nav-icon">⌘</span>
          <span>MCP & Integrations</span>
        </button>
      </div>

      <div class="s7-sidebar-divider mx-3" />

      <div class="flex min-h-0 flex-1 flex-col">
        <div class="app-sidebar-toolbar flex h-10 shrink-0 items-center gap-px border-b bg-muted/10 px-3 text-xs font-medium text-muted-foreground">
          <span v-if="showConnectionMultiSelectToolbar" class="flex min-w-0 self-stretch items-center">
            <span class="truncate">{{ t("sidebar.connections") }}</span>
            <span class="ml-1.5 shrink-0 text-[11px] font-normal text-muted-foreground/80">
              {{ t("connectionGroup.selectedConnections", { count: selectedConnectionCount }) }}
            </span>
          </span>
          <LightDropdown
            v-else
            model-value=""
            :items="connectionTransferItems"
            :aria-label="connectionTransferLabel"
            :trigger-title="connectionTransferLabel"
            :trigger-icon="ArrowDownUp"
            :trigger-label="connectionTransferLabel"
            trigger-class="inline-flex h-7 min-w-0 items-center gap-1 rounded-md px-1 outline-none hover:bg-muted hover:text-foreground focus-visible:ring-0"
            trigger-icon-class="h-3.5 w-3.5 shrink-0"
            item-icon-class="h-3.5 w-3.5"
            content-class="w-48"
            :show-trigger-label="true"
            :show-chevron="true"
            :highlight-selected="false"
            check-position="none"
            align="start"
            @update:model-value="selectConnectionTransferAction"
          />
          <span class="flex-1 self-stretch" />
          <template v-if="showConnectionMultiSelectToolbar">
            <LightTooltip :text="t('connectionGroup.createGroup')" side="bottom" :delay="0" :close-delay="0" nowrap>
              <Button variant="ghost" size="icon" class="h-5 w-5" @click="openCreateSelectedGroupDialog">
                <FolderPlus class="h-3 w-3" />
              </Button>
            </LightTooltip>
            <LightTooltip :text="t('connectionGroup.moveToGroup')" side="bottom" :delay="0" :close-delay="0" nowrap>
              <span class="inline-flex">
                <LightDropdown
                  model-value=""
                  :items="moveGroupItems"
                  :aria-label="t('connectionGroup.moveToGroup')"
                  :trigger-icon="FolderInput"
                  trigger-class="inline-flex h-5 w-5 items-center justify-center rounded-md outline-none hover:bg-muted hover:text-foreground focus-visible:ring-0"
                  trigger-icon-class="h-3.5 w-3.5"
                  content-class="w-44"
                  :show-trigger-label="false"
                  :show-chevron="false"
                  :highlight-selected="false"
                  check-position="none"
                  align="end"
                  @update:model-value="moveSelectedConnectionsToGroup"
                />
              </span>
            </LightTooltip>
            <LightTooltip :text="t('contextMenu.deleteSelectedConnections', { count: selectedConnectionCount })" side="bottom" :delay="0" :close-delay="0" nowrap>
              <Button variant="ghost" size="icon" class="h-5 w-5 text-destructive hover:text-destructive" @click="showDeleteSelectedConfirm = true">
                <Trash2 class="h-3 w-3" />
              </Button>
            </LightTooltip>
            <LightTooltip :text="selectAllLabel" side="bottom" :delay="0" :close-delay="0" nowrap>
              <Button variant="ghost" size="icon" class="h-5 w-5" @click="toggleAllConnectionsSelected">
                <component :is="selectAllIcon" class="h-3 w-3" />
              </Button>
            </LightTooltip>
            <LightTooltip :text="t('connectionGroup.exitMultiSelect')" side="bottom" :delay="0" :close-delay="0" nowrap>
              <Button variant="ghost" size="icon" class="h-5 w-5" @click="clearConnectionMultiSelection">
                <X class="h-3 w-3" />
              </Button>
            </LightTooltip>
          </template>
          <template v-else>
            <span data-sidebar-toolbar-actions class="flex shrink-0 items-center gap-0.5">
              <LightTooltip :text="t('sidebar.collapseAll')" side="bottom" :delay="0" :close-delay="0" nowrap>
                <Button variant="ghost" size="icon" class="h-5 w-5" @click="collapseAllTreeNodes">
                  <ChevronsDownUp class="h-3 w-3" />
                </Button>
              </LightTooltip>
              <LightTooltip :text="t('connectionGroup.createGroup')" side="bottom" :delay="0" :close-delay="0" nowrap>
                <Button variant="ghost" size="icon" class="h-5 w-5" @click="createNewGroup">
                  <FolderPlus class="h-3 w-3" />
                </Button>
              </LightTooltip>
              <LightTooltip :text="t('contextMenu.refreshChildren')" side="bottom" :delay="0" :close-delay="0" nowrap>
                <Button variant="ghost" size="icon" class="h-5 w-5" @click="refreshTree">
                  <RefreshCw class="h-3 w-3" />
                </Button>
              </LightTooltip>
              <LightTooltip :text="t('sidebar.collapse')" side="bottom" :delay="0" :close-delay="0" nowrap>
                <Button variant="ghost" size="icon" class="h-6 w-6" @click="emit('collapse')">
                  <ChevronsLeft class="h-3.5 w-3.5" />
                </Button>
              </LightTooltip>
            </span>
          </template>
        </div>

        <div class="s7-db-heading flex items-center justify-between px-3 py-2">
          <div>
            <div class="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">Data</div>
            <div class="text-xs font-medium">Database connections</div>
          </div>
          <span class="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{{ connectionStore.connections.length }}</span>
        </div>

        <div class="min-h-0 flex-1">
          <ConnectionTree ref="connectionTreeRef" @open-settings="(initialTab) => emit('open-settings', initialTab)" @add-to-ai="(nodes) => emit('add-to-ai', nodes)" />
        </div>
      </div>

      <div class="s7-sidebar-footer border-t px-3 py-2">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-muted-foreground/70">Simbiosis7 Platform</span>
          <button class="text-[10px] text-muted-foreground hover:text-foreground" @click="emit('open-settings', 'general')">Settings</button>
        </div>
      </div>

      <PluginShortcutBar v-if="settingsStore.editorSettings.pluginShortcuts.enabled && settingsStore.editorSettings.pluginShortcuts.position === 'sidebar-bottom'" position="sidebar-bottom" />
    </div>

    <div class="panel-resize-handle panel-resize-handle--right" @pointerdown="emit('startResize', $event)" />

    <Dialog v-model:open="showDeleteSelectedConfirm">
      <DialogContent class="sm:max-w-[400px]">
        <DialogHeader><DialogTitle>{{ t("contextMenu.confirmDeleteTitle") }}</DialogTitle></DialogHeader>
        <p class="text-sm text-muted-foreground">{{ t("contextMenu.confirmDeleteSelectedMessage", { count: selectedConnectionCount }) }}</p>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteSelectedConfirm = false">{{ t("dangerDialog.cancel") }}</Button>
          <Button variant="destructive" @click="confirmDeleteSelectedConnections">{{ t("contextMenu.deleteSelectedConnections", { count: selectedConnectionCount }) }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="showCreateSelectedGroupDialog">
      <DialogContent class="sm:max-w-[360px]">
        <DialogHeader><DialogTitle>{{ t("connectionGroup.createGroup") }}</DialogTitle></DialogHeader>
        <Input v-model="selectedGroupName" :placeholder="t('connectionGroup.groupNamePlaceholder')" @keydown.enter.prevent="confirmCreateSelectedGroup" />
        <DialogFooter>
          <Button variant="outline" @click="showCreateSelectedGroupDialog = false">{{ t("dangerDialog.cancel") }}</Button>
          <Button :disabled="!selectedGroupName.trim()" @click="confirmCreateSelectedGroup">{{ t("connectionGroup.createGroup") }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style>
.s7-sidebar-brand {
  background: linear-gradient(180deg, hsl(var(--muted) / 0.35), transparent);
}

.s7-sidebar-mark {
  box-shadow: 0 8px 24px -16px hsl(var(--primary) / 0.8);
}

.s7-nav-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.65rem;
  border-radius: 0.5rem;
  padding: 0.48rem 0.55rem;
  text-align: left;
  font-size: 0.76rem;
  color: hsl(var(--muted-foreground));
}

.s7-nav-item:hover {
  background: hsl(var(--muted) / 0.55);
  color: hsl(var(--foreground));
}

.s7-nav-active {
  background: hsl(var(--primary) / 0.10);
  color: hsl(var(--foreground));
  box-shadow: inset 2px 0 0 hsl(var(--primary));
}

.s7-nav-icon {
  width: 1rem;
  text-align: center;
  color: hsl(var(--primary));
}

.s7-sidebar-divider {
  border-top: 1px solid hsl(var(--border) / 0.7);
}

.s7-db-heading {
  background: hsl(var(--muted) / 0.12);
}
</style>
