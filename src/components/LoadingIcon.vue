<template>
  <div style="text-align: center">
    <div class="lds-ripple">
      <div></div>
      <div></div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'LoadingIcon',
  props: {},
  data() {
    return {}
  },
  methods: {}


}


</script>
<style scoped>
.lds-ripple {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
  background-color: var(--loading-bg);
  border-radius: 8px;
  padding: 10px;
  transition: background-color 0.3s ease-in-out;
}

.lds-ripple div {
  position: absolute;
  border: 4px solid var(--button-primary);
  opacity: 1;
  border-radius: 50%;
  animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
  transition: border-color 0.3s ease-in-out;
}

.lds-ripple div:nth-child(2) {
  animation-delay: -0.5s;
}

@keyframes lds-ripple {
  0% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 0;
  }
  4.9% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 0;
  }
  5% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: 0px;
    left: 0px;
    width: 72px;
    height: 72px;
    opacity: 0;
  }
}


</style>
