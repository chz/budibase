export default `<html>
  <head>
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Mono">
    <style>
      body, html {
        height: 100%!important;
        font-family: Inter !important;
        margin: 0px!important;
      }
      *, *:before, *:after {
        box-sizing: border-box;
      }
      .container-screenslot-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        text-align: center;
        border-style: dashed !important;
        border-width: 1px;
        color: #000000;
        background-color: rgba(0, 0, 0, 0.05);
        flex: 1 1 auto;
      }
      .container-screenslot-placeholder span {
        display: block;
        margin-bottom: 10px;
      }
    </style>
    <script src='/assets/budibase-client.js'></script>
    <script>
      function receiveMessage(event) { 

        if (!event.data) return

        const data = JSON.parse(event.data)

        try {
          if (styles) document.head.removeChild(styles)
        } catch(_) { }

        try {
          if (selectedComponentStyle) document.head.removeChild(selectedComponentStyle)
        } catch(_) { }

        selectedComponentStyle = document.createElement('style');
        document.head.appendChild(selectedComponentStyle)
        var selectedCss = '.' + data.selectedComponentType + '-' + data.selectedComponentId + '{ border: 2px solid #0055ff;  }'
        selectedComponentStyle.appendChild(document.createTextNode(selectedCss))

        styles = document.createElement('style')
        document.head.appendChild(styles)
        styles.appendChild(document.createTextNode(data.styles))

        window["##BUDIBASE_FRONTEND_DEFINITION##"] = data.frontendDefinition;
        if (window.loadBudibase) {
          loadBudibase({ window, localStorage })
        }
      }
      let styles
      let selectedComponentStyle

      document.addEventListener("click", function(e) {
        e.preventDefault()
        e.stopPropagation()
        return false;
      }, true)

      window.addEventListener('message', receiveMessage)
      window.dispatchEvent(new Event('bb-ready'))
      
    </script>
  </head>
  <body>
  </body>
</html>`
