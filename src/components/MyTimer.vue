<template>
  <span class="timer-display">
    {{ show_text }}
  </span>
</template>

<script>

export default {
  name: 'Timer',
  props: {},
  data() {
    return {
      start_time: 0,
      show_text: null

    }
  },
  methods: {
    start() {
      this.start_time = new Date().getTime()
      this.cur_interval_pointer = setInterval(() => {
        //更新内容
        const time_last_seconds = parseInt((new Date().getTime() - this.start_time) / 1000)
        this.show_text = formatTime(time_last_seconds)
      }, 1000)
    },
    stop() {
      clearInterval(this.cur_interval_pointer)
      this.show_text = null
    },
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}
</script>
<style scoped>

.timer-display {
  color: var(--text-primary);
  font-weight: 500;
  font-family: 'Courier New', monospace;
  background-color: var(--bg-secondary);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-light);
  transition: all 0.3s ease-in-out;
}

</style>
