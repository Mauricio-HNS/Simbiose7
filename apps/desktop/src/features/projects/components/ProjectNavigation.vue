<template>
  <nav class="project-navigation" aria-label="Project navigation">
    <button
      v-for="section in sections"
      :key="section.id"
      type="button"
      class="project-navigation__item"
      @click="$emit('select', section.id)"
    >
      {{ section.label }}
    </button>
  </nav>
</template>

<script setup lang="ts">
import type { ProjectSection } from "../types/project";

defineProps<{ sections: Array<{ id: ProjectSection; label: string }> }>();
defineEmits<{ select: [section: ProjectSection] }>();
</script>

<style scoped>
.project-navigation {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.project-navigation__item {
  border: 0;
  background: transparent;
  text-align: left;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
}
.project-navigation__item:hover {
  background: var(--surface-hover, rgba(127, 127, 127, 0.12));
}
</style>
