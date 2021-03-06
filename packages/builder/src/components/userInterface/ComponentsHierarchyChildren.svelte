<script>
  import { goto } from "@sveltech/routify"
  import { store } from "builderStore"
  import { last } from "lodash/fp"
  import { pipe } from "../../helpers"
  import ComponentDropdownMenu from "./ComponentDropdownMenu.svelte"
  import NavItem from "components/common/NavItem.svelte"
  import { getComponentDefinition } from "builderStore/storeUtils"

  export let components = []
  export let currentComponent
  export let onSelect = () => {}
  export let level = 0

  /*
  "dragDropStore" is a svelte store.
  This component is recursive... a tree.
  Using a single, shared store, all the nodes in the tree can subscribe to state that is changed by other nodes, in the same tree.

  e.g. Say i have the structure
  - Heading 1
  - Container 
    - Heading 2
    - Heading 3
  - Heading 4

  1. When I dragover "Heading 1", a placeholder drop-slot appears below it
  2. I drag down a bit so the cursor is INSIDE the container (i.e. now in a child <ComponentsHierarchyChildren />)
  3. Using store subscribes... the original drop-slot now knows that it should disappear, and a new one is created inside the container.
  */
  export let dragDropStore

  let dropUnderComponent
  let componentToDrop

  const capitalise = s => s.substring(0, 1).toUpperCase() + s.substring(1)
  const get_name = s => (!s ? "" : last(s.split("/")))
  const get_capitalised_name = name => pipe(name, [get_name, capitalise])
  const isScreenslot = name => name === "##builtin/screenslot"

  const selectComponent = component => {
    // Set current component
    store.actions.components.select(component)

    // Get ID path
    const path = store.actions.components.findRoute(component)

    // Go to correct URL
    $goto(`./:page/:screen/${path}`)
  }

  const dragstart = component => e => {
    e.dataTransfer.dropEffect = "move"
    dragDropStore.update(s => {
      s.componentToDrop = component
      return s
    })
  }

  const dragover = (component, index) => e => {
    const canHaveChildrenButIsEmpty =
      getComponentDefinition($store, component._component).children &&
      component._children.length === 0

    e.dataTransfer.dropEffect = "copy"
    dragDropStore.update(s => {
      const isBottomHalf = e.offsetY > e.currentTarget.offsetHeight / 2
      s.targetComponent = component
      // only allow dropping inside when container type
      // is empty. If it has children, the user can drag over
      // it's existing children
      if (canHaveChildrenButIsEmpty) {
        if (index === 0) {
          // when its the first component in the screen,
          // we divide into 3, so we can paste above, inside or below
          const pos = e.offsetY / e.currentTarget.offsetHeight
          if (pos < 0.4) {
            s.dropPosition = "above"
          } else if (pos > 0.8) {
            // purposely giving this the least space as it is often covered
            // by the component below's "above" space
            s.dropPosition = "below"
          } else {
            s.dropPosition = "inside"
          }
        } else {
          s.dropPosition = isBottomHalf ? "below" : "inside"
        }
      } else {
        s.dropPosition = isBottomHalf ? "below" : "above"
      }
      return s
    })
    return false
  }

  const drop = () => {
    if ($dragDropStore.targetComponent !== $dragDropStore.componentToDrop) {
      store.actions.components.copy($dragDropStore.componentToDrop, true)
      store.actions.components.paste(
        $dragDropStore.targetComponent,
        $dragDropStore.dropPosition
      )
    }
    dragDropStore.update(s => {
      s.dropPosition = ""
      s.targetComponent = null
      s.componentToDrop = null
      return s
    })
  }

  const dragend = () => {
    dragDropStore.update(s => {
      s.dropPosition = ""
      s.targetComponent = null
      s.componentToDrop = null
      return s
    })
  }
</script>

<ul>
  {#each components as component, index (component._id)}
    <li on:click|stopPropagation={() => selectComponent(component)}>
      {#if $dragDropStore && $dragDropStore.targetComponent === component && $dragDropStore.dropPosition === 'above'}
        <div
          on:drop={drop}
          ondragover="return false"
          ondragenter="return false"
          class="drop-item"
          style="margin-left: {(level + 1) * 18}px" />
      {/if}

      <NavItem
        draggable
        on:dragend={dragend}
        on:dragstart={dragstart(component)}
        on:dragover={dragover(component, index)}
        on:drop={drop}
        text={isScreenslot(component._component) ? 'Screenslot' : component._instanceName}
        withArrow
        indentLevel={level + 1}
        selected={currentComponent === component}>
        <ComponentDropdownMenu {component} />
      </NavItem>

      {#if component._children}
        <svelte:self
          components={component._children}
          {currentComponent}
          {onSelect}
          {dragDropStore}
          level={level + 1} />
      {/if}

      {#if $dragDropStore && $dragDropStore.targetComponent === component && ($dragDropStore.dropPosition === 'inside' || $dragDropStore.dropPosition === 'below')}
        <div
          on:drop={drop}
          ondragover="return false"
          ondragenter="return false"
          class="drop-item"
          style="margin-left: {(level + ($dragDropStore.dropPosition === 'inside' ? 3 : 1)) * 18}px" />
      {/if}
    </li>
  {/each}
</ul>

<style>
  ul {
    list-style: none;
    padding-left: 0;
    margin: 0;
  }

  .drop-item {
    border-radius: var(--border-radius-m);
    height: 32px;
    background: var(--blue-light);
  }
</style>
