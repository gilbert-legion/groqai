<template>
  <div id="app" :class="{ 'dark-theme': isDarkMode }">
    <el-menu :default-active="$router.currentRoute.path" mode="horizontal" :router="true" class="main-nav">
      <el-menu-item index="/">Interview Copilot</el-menu-item>
      <el-menu-item index="/setting">Setting</el-menu-item>
      <div class="theme-toggle-container">
        <el-button
          class="theme-toggle-btn"
          :icon="isDarkMode ? 'el-icon-sunny' : 'el-icon-moon'"
          @click="toggleTheme"
          size="medium"
          type="text"
          :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
        </el-button>
      </div>
    </el-menu>
    <router-view class="router_view"/>
  </div>
</template>

<style>
/* CSS Variables for Light Theme (Default) */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f7fa;
  --bg-tertiary: #ffffff;
  --text-primary: #2c3e50;
  --text-secondary: #606266;
  --text-placeholder: #c0c4cc;
  --border-color: #dcdfe6;
  --border-light: #e4e7ed;
  --button-primary: #409eff;
  --button-primary-hover: #66b1ff;
  --button-secondary: #909399;
  --button-secondary-hover: #a6a9ad;
  --shadow-light: rgba(0, 0, 0, 0.1);
  --shadow-medium: rgba(0, 0, 0, 0.15);
  --nav-bg: #ffffff;
  --nav-text: #303133;
  --nav-active: #409eff;
  --panel-bg: #ffffff;
  --panel-border: #dcdfe6;
  --input-bg: #ffffff;
  --input-border: #dcdfe6;
  --loading-bg: rgba(255, 255, 255, 0.9);
}

/* Dark Theme Variables */
.dark-theme {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --bg-tertiary: #363636;
  --text-primary: #e4e7ed;
  --text-secondary: #c0c4cc;
  --text-placeholder: #909399;
  --border-color: #4c4d4f;
  --border-light: #414243;
  --button-primary: #409eff;
  --button-primary-hover: #66b1ff;
  --button-secondary: #606266;
  --button-secondary-hover: #737373;
  --shadow-light: rgba(0, 0, 0, 0.3);
  --shadow-medium: rgba(0, 0, 0, 0.5);
  --nav-bg: #2d2d2d;
  --nav-text: #e4e7ed;
  --nav-active: #409eff;
  --panel-bg: #363636;
  --panel-border: #4c4d4f;
  --input-bg: #2d2d2d;
  --input-border: #4c4d4f;
  --loading-bg: rgba(45, 45, 45, 0.9);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  min-height: 100vh;
  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
}

</style>
<script>
import {mapGetters} from 'vuex';

export default {
  name: 'App',
  props: {},
  computed: {},
  beforeMount() {
  },
  mounted() {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme_mode')
    if (savedTheme === 'dark') {
      this.isDarkMode = true
    }
  },
  data() {
    return {
      activeIndex: "/",
      isDarkMode: false // Default to light mode
    }
  },
  methods: {
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
      // Persist theme preference
      localStorage.setItem('theme_mode', this.isDarkMode ? 'dark' : 'light')
    }
  }
}

</script>

<style>
/* Navigation Styles */
.main-nav {
  background-color: var(--nav-bg) !important;
  border-bottom: 1px solid var(--border-color) !important;
  position: relative;
  transition: background-color 0.3s ease-in-out, border-color 0.3s ease-in-out;
}

.main-nav .el-menu-item {
  color: var(--nav-text) !important;
  transition: color 0.3s ease-in-out;
}

.main-nav .el-menu-item:hover {
  background-color: var(--bg-secondary) !important;
  color: var(--nav-active) !important;
}

.main-nav .el-menu-item.is-active {
  color: var(--nav-active) !important;
  border-bottom-color: var(--nav-active) !important;
}

/* Theme Toggle Button Container */
.theme-toggle-container {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
}

.theme-toggle-btn {
  color: var(--text-secondary) !important;
  font-size: 18px !important;
  padding: 8px !important;
  border-radius: 6px;
  transition: all 0.3s ease-in-out;
  background: transparent !important;
  border: none !important;
}

.theme-toggle-btn:hover {
  color: var(--button-primary) !important;
  background-color: var(--bg-secondary) !important;
  transform: scale(1.1);
}

.theme-toggle-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--button-primary);
}

.router_view {
  margin-top: 10px;
  background-color: var(--bg-primary);
  transition: background-color 0.3s ease-in-out;
}

/* Global Element UI theming */
.el-button {
  transition: all 0.3s ease-in-out;
}

.el-button--primary {
  background-color: var(--button-primary) !important;
  border-color: var(--button-primary) !important;
}

.el-button--primary:hover {
  background-color: var(--button-primary-hover) !important;
  border-color: var(--button-primary-hover) !important;
}

.el-button--success {
  background-color: #67c23a !important;
  border-color: #67c23a !important;
}

.el-button--success:hover {
  background-color: #85ce61 !important;
  border-color: #85ce61 !important;
}

.el-button[disabled] {
  background-color: var(--button-secondary) !important;
  border-color: var(--button-secondary) !important;
  color: var(--text-placeholder) !important;
}

.el-input__inner {
  background-color: var(--input-bg) !important;
  border-color: var(--input-border) !important;
  color: var(--text-primary) !important;
  transition: all 0.3s ease-in-out;
}

.el-input__inner:focus {
  border-color: var(--button-primary) !important;
}

.el-input__inner::placeholder {
  color: var(--text-placeholder) !important;
}
</style>