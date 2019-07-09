/**
 * @file mip-tree
 * @author sfe
 */

/* global MIP */

MIP.registerVueCustomElement('mip-test-slot', {
  template: `
    <div>
      <div v-for="i in [1, 2, 3, 4, 5, 6,7]" :key="i">
        {{ i }}
        <slot></slot>
      </div>
    </div>
  `
})
