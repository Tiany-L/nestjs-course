<script setup lang="ts">
import { withBase } from 'vitepress';
import HomeIcon from './HomeIcon.vue';

const nodes = [
  { label: '启动与 DI', icon: 'boxes', position: 'top' },
  { label: '请求生命周期', icon: 'workflow', position: 'left-top' },
  { label: '认证与授权', icon: 'key', position: 'right-top' },
  { label: 'Prisma ORM', icon: 'database', position: 'left-bottom' },
  { label: 'MySQL 8.4', icon: 'database', position: 'right-bottom' },
  { label: '生产部署', icon: 'cloud', position: 'bottom' },
] as const;
</script>

<template>
  <div
    class="home-hero-visual"
    role="img"
    aria-label="NestJS 连接启动与依赖注入、请求生命周期、认证授权、Prisma、MySQL 和生产部署"
  >
    <div class="home-hero-visual__scene" aria-hidden="true">
      <span class="home-hero-visual__track" />
      <span class="home-hero-visual__axis home-hero-visual__axis--horizontal" />
      <span class="home-hero-visual__axis home-hero-visual__axis--vertical" />

      <div class="home-hero-visual__hex home-hero-visual__hex--outer">
        <div class="home-hero-visual__hex home-hero-visual__hex--surface">
          <div class="home-hero-visual__hex home-hero-visual__hex--brand">
            <img :src="withBase('/favicon.png')" alt="" width="64" height="64" />
          </div>
        </div>
      </div>

      <div
        v-for="node in nodes"
        :key="node.label"
        class="home-hero-visual__node"
        :class="`home-hero-visual__node--${node.position}`"
      >
        <HomeIcon :name="node.icon" :size="18" />
        <span>{{ node.label }}</span>
      </div>
    </div>
  </div>
</template>
