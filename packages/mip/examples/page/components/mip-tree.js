/**
 * @file mip-tree
 * @author sfe
 */

/* global MIP */

MIP.registerVueCustomElement('mip-tree', {
  template: `
    <li>
      <div :class="{ bold: isFolder }" @click="toggle" @dblclick="changeType">
        {{ model.name }}
        <span v-if="isFolder">[{{ open ? '-' : '+' }}]</span>
      </div>
      <ul v-show="open" v-if="isFolder">
        <mip-tree
          class="item"
          v-for="(item, index) in model.children"
          :model="stringify(item)"
          :key="index"
        ></mip-tree>
        <li class="add" @click="addChild">+</li>
      </ul>
      <slot></slot>
    </li>
  `,
  props: {
    model: {
      default () {
        return {}
      },
      type: Object
    }
  },
  data: function () {
    return {
      open: false
    }
  },
  computed: {
    isFolder: function () {
      return this.model.children && this.model.children.length
    }
  },
  methods: {
    toggle: function () {
      if (this.isFolder) {
        this.open = !this.open
      }
    },
    changeType: function () {
      if (!this.isFolder) {
        MIP.Vue.set(this.model, 'children', [])
        this.addChild()
        this.open = true
      }
    },
    addChild: function () {
      this.model.children.push({
        name: 'new stuff'
      })
    },

    stringify (data) {
      return JSON.stringify(data)
    }
  }
})
