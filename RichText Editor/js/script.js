Editor = {
    element: {},
    defaultOptions: {
        width: 600,
        height: 400,
        boxEditorClass: 'box-editor',
        iframeEditorClass: 'iframe-editor',
    },
    interfaceUi: {
        defaultClass: {
            buttons: 'button-editor',
            selects: 'select-editor'
        },
        types: ['bold', 'italic', 'underline', 'strikethrough', 'justifyLeft', 'justifyCenter', 'justifyRight',
                'toggleSource', 'hiliteColor', 'viewerMode'],
        icons: ['fas fa-bold', 'fas fa-italic', 'fas fa-underline', 'fas fa-strikethrough', 'fas fa-align-left', 'fas fa-align-center', 'fas fa-align-right', 
                'fas fa-code', 'fas fa-fill-drip', 'fas fa-eye'],
        selects: {
            fontSize: [1, 2, 3, 4, 5, 6],
            fontName: ['Arial', 'Comic Sans MS', 'Courier', 'Georgia', 'Tahoma', 'Times New Roman', 'Verdana'],
            formatBlock: ['p', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']
        },
        selectIndex: 0,
        asViewer: false,
    },
    showingSourceCode: false,

    init(el, options) {
        this.element = {
            default: document.querySelector(el),
            parent: document.querySelector(el).parentElement,
            ...options
        }
        this.element.position = this.getIndexElement(this.element.default)

        this.element.default.style.display = 'none'
        this.prepareBoxParent()
    },

    getIndexElement(element) {
        return [...element.parentNode.children].indexOf(element)
    },

    prepareBoxParent() {
        if(!this.element.parent) return

        const _parent = document.createElement('div')
        _parent.setAttribute('class', this.defaultOptions.boxEditorClass)

        this.element.parent.insertBefore(_parent, this.element.parent.children[this.element.position])
        this.element.box = document.querySelector(`.${this.defaultOptions.boxEditorClass}`)

        this.renderEditorButtons()
        this.prepareFrame()
    },

    createDefaultButton(index) {
        let button = document.createElement('button')
            button.setAttribute('class', this.interfaceUi.defaultClass.buttons)
            button.setAttribute('data-richeditor', this.interfaceUi.types[index])
            button.setAttribute('tabindex', '-1')
            button.setAttribute('role', 'button')
            button.setAttribute('hidefocus', true)

        return button
    },

    createDefaultSelect(iconIndex, name, values) {
        let select = document.createElement('select')
            select.setAttribute('class', this.interfaceUi.defaultClass.selects)
            select.setAttribute('data-richeditor', name)

        if(Array.isArray(values)) {
            values.forEach((value) => {
                let option = document.createElement('option')
                option.setAttribute('value', value)
                option.innerHTML = value != 'p' ? value : 'Default'

                select.appendChild(option)
            })
        }

        this.interfaceUi.selectIndex++
        return select
    },

    renderEditorButtons() {
        let _interface = this.interfaceUi,
            buttonsLength = _interface.types.length,
            selectsLength = Object.values(_interface.selects).length,
            totalLength = buttonsLength + selectsLength,
            buttons = []

        for(let i = 0; i < totalLength; i++) {
            if(i < buttonsLength) {
                buttons[i] = this.createDefaultButton(i)
            } else {
                buttons[i] = this.createDefaultSelect(
                    i,
                    Object.keys(_interface.selects)[_interface.selectIndex],
                    Object.values(_interface.selects)[_interface.selectIndex]
                )
            }

            var icon = document.createElement('i')
            icon.setAttribute('class', _interface.icons[i])
            
            buttons[i].appendChild(icon)

            this.element.box.prepend(...buttons)
        }

        this.watchButtons()
    },

    watchButtons() {
        const buttons = document.querySelectorAll(`button.${this.interfaceUi.defaultClass.buttons}`)
        const selects = document.querySelectorAll(`select.${this.interfaceUi.defaultClass.selects}`)

        buttons.forEach((element, index) => {
            element.addEventListener('click', (event) => {
                event.preventDefault()
                element.classList.toggle('active')

                if(element.hasAttribute('data-richeditor')) {
                    let attribute = element.dataset.richeditor

                    switch(attribute) {
                        case 'toggleSource':
                            this.toggleSource()
                            break;
                        case 'viewerMode':
                            this.toggleViewer()
                            break;
                        default:
                            this.execCommand(attribute)
                            break;
                    }          
                }
            })
        })

        selects.forEach((element, index) => {
            element.addEventListener('change', (event) => {
                event.preventDefault()

                if(element.hasAttribute('data-richeditor')) {
                    let attribute = element.dataset.richeditor

                    this.execCommand(attribute, false, element.value)
                }
            })
        })
    },

    prepareFrame() {
        if(!this.element.box) return

        const _frame = document.createElement('iframe')
        _frame.setAttribute('class', this.defaultOptions.iframeEditorClass)
        _frame.style.width = this.getRenderWidth() + 'px'
        _frame.style.height = this.getRenderHeight() + 'px'

        this.element.box.appendChild(_frame)
        this.element.frame = document.querySelector(`.${this.defaultOptions.iframeEditorClass}`)

        this.applySettingsFrame()
    },

    applySettingsFrame() {
        if(!this.element.frame) return

        const contentDocument = this.element.frame.contentDocument

        this.changeDesignMode()
        contentDocument.body.setAttribute('spellcheck', false)
        contentDocument.body.style.padding = '10px'

        this.execCommand('defaultParagraphSeparator', false, 'p')
    },

    changeDesignMode(option = 'on') {
        let modes = ['on', 'off']

        if(modes.indexOf(option) >= 0) {
            this.element.frame.contentDocument.designMode = option
        }
    },

    clearSize(string) {
        return Number(string.toString().replace(/\D/g, ''))
    },

    getRenderWidth() {
        return (this.element.width && this.clearSize(this.element.width))|| this.defaultOptions.width
    },

    getRenderHeight() {
        return (this.element.height && this.clearSize(this.element.height)) || this.defaultOptions.height
    },

    execCommand(command, interface = false, value = null) {
        if(!this.element.frame) return

        this.element.frame.contentDocument.execCommand(command, interface, value)
    },
    
    toggleSource() {
        const bodyFrame = this.element.frame.contentDocument.getElementsByTagName('body')[0]

        if(!bodyFrame) return;

        if(this.showingSourceCode) {
            bodyFrame.innerHTML = bodyFrame.textContent
        } else {
            bodyFrame.textContent = bodyFrame.innerHTML
        }
        this.showingSourceCode = !this.showingSourceCode
    },

    toggleViewer() {
        if(this.asViewer) {
            this.changeDesignMode('off')
        } else {
            this.changeDesignMode()
        }

        this.asViewer = !this.asViewer
    }
}