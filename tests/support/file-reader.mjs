globalThis.self = globalThis
globalThis.FileReader = class FileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer
      this.onloadend?.()
    })
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = `data:${blob.type};base64,${Buffer.from(buffer).toString('base64')}`
      this.onloadend?.()
    })
  }
}
if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = (blob) =>
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
}
if (typeof URL.revokeObjectURL !== 'function') {
  URL.revokeObjectURL = () => {}
}

class MockHTMLImageElement {
  constructor() {
    this._src = ''
    this.width = 500
    this.height = 500
    this.naturalWidth = 500
    this.naturalHeight = 500
    this.complete = true
    this.style = {}
    this._listeners = {}
  }
  addEventListener(event, handler) {
    if (!this._listeners[event]) this._listeners[event] = []
    this._listeners[event].push(handler)
  }
  removeEventListener(event, handler) {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event].filter((h) => h !== handler)
    }
  }
  setAttribute() {}
}

Object.defineProperty(MockHTMLImageElement.prototype, 'src', {
  set(val) {
    this._src = val
    setTimeout(() => {
      this.onload?.({ target: this })
      this._listeners['load']?.forEach((fn) => fn.call(this, { target: this }))
    }, 0)
  },
  get() {
    return this._src
  },
})

globalThis.HTMLImageElement = MockHTMLImageElement
globalThis.Image = MockHTMLImageElement

class MockHTMLCanvasElement {
  constructor() {
    this.width = 1024
    this.height = 1024
  }
  getContext() {
    return {
      save() {},
      restore() {},
      fillRect() {},
      strokeRect() {},
      drawImage() {},
      translate() {},
      rotate() {},
      scale() {},
      beginPath() {},
      rect() {},
      clip() {},
      arc() {},
      moveTo() {},
      lineTo() {},
      closePath() {},
      fill() {},
      stroke() {},
      fillText() {},
      strokeText() {},
      roundRect() {},
      putImageData() {},
      getImageData: () => ({ data: new Uint8ClampedArray(1024 * 1024 * 4) }),
    }
  }
  toDataURL() {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
  }
  toBlob(cb, mimeType) {
    setTimeout(() => {
      cb(
        new Blob(
          [
            Buffer.from(
              'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
              'base64'
            ),
          ],
          { type: mimeType || 'image/png' }
        )
      )
    }, 0)
  }
}

globalThis.HTMLCanvasElement = MockHTMLCanvasElement

if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    createElementNS(_ns, tag) {
      if (tag === 'img' || tag === 'image') {
        return new MockHTMLImageElement()
      }
      if (tag === 'canvas') {
        return new MockHTMLCanvasElement()
      }
      return this.createElement(tag)
    },
    createElement(tag) {
      if (tag === 'canvas') {
        return new MockHTMLCanvasElement()
      }
      if (tag === 'img' || tag === 'image') {
        return new MockHTMLImageElement()
      }
      return {
        style: {},
        setAttribute() {},
        addEventListener() {},
        removeEventListener() {},
      }
    },
  }
}
