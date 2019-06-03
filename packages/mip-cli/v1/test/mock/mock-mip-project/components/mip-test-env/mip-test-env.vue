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
    console.log('This is my first custom component !')
    if (process.env.NODE_ENV === 'development') {
      console.log('test env development')
    }

    if (process.env.NODE_ENV === 'production') {
      console.log('test env production')
    }

    if (process.env.NODE_ENV === 'test') {
      console.log('test env test')
    }
  }
}
</script>
