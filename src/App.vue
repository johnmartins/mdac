<template>
  <div style="height: 100%;">
    <router-view class="content-window"/>
  </div>
</template>

<style lang="scss">

@import "@/scss/GlobalStyles.scss";

$nav-height: 60px;

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  height: $nav-height;
  border-bottom: 2px solid darkgrey;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.content-window {
  height: calc(100vh - $nav-height - 2px);
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
