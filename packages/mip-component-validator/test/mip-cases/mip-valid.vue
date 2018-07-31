<template>
    <h3> component styles not scoped </h3>
</template>

<style scoped>
.mip-test {
    color: red;
}
</style>

<script>
const a = {
    b : 'hello',
    c : 'world'
}
console.log(a.b);
</script>