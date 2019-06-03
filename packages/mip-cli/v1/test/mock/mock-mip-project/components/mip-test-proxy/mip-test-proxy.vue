<template>
  <div class="wrapper">
    <h1>MIP 2.0 component example</h1>
    <h3>This is my first custom component !</h3>
  </div>
</template>

<style scoped>
.wrapper {
  margin: 0 auto;
  text-align: center;
}
</style>

<script>
export default {
  mounted () {
    console.log('str with prefix http://www.baidu.com/')
    console.log('http://www.baidu.com/ str with ext')
    console.log('http://www.baidu.com')
  }
}
</script>
