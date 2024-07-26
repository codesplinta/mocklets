export const fakeResizeObserverFactory = () => (function () {
  class ResizeObserver {
    constructor (callback) {
      if (typeof callback !== 'function') {
        throw new TypeError(
          typeof callback === 'undefined'
            ? "Failed to construct 'ResizeObserver': 1 argument required, but only 0 present."
            : "Failed to construct 'ResizeObserver': parameter 1 is not of type 'Function'."
        )
      }

      this.entries = []

      this.$callback = callback
    }

    observe (target = null, options = { box: '' }) {
      if (!target || !(target instanceof window.HTMLElement)) {
        throw new TypeError(
          typeof target === 'undefined'
            ? "Failed to execute 'observe' on 'ResizeObserver': 1 argument required, but only 0 present."
            : "Failed to execute 'observe' on 'ResizeObserver': parameter 1 is not of type 'Element'."
        )
      }

      const box = (options || { box: '' }).box
      const boxSizeMap = {
        'content-box': {
          contentBoxSize: [{ inlineSize: 0, blockSize: 0 }]
        },
        'border-box': {
          borderBoxSize: [{ inlineSize: 0, blockSize: 0 }]
        },
        'device-pixel-content-box': {
          devicePixelContentBoxSize: [{ inlineSize: 0, blockSize: 0 }]
        }
      }

      this.entries.push(
        {
          target,
          contentRect: Object.freeze({
            get width () {
              return parseInt(window.getComputedStyle(target).width)
            },
            get height () {
              return parseInt(window.getComputedStyle(target).height)
            }
          })
        }
      )

      window.addEventListener('resize', () => {
        const $target = target
        const $callback = this.callback
        const $entries = this.entries
        const $observer = this

        const boxSize = (box in boxSizeMap)
          ? JSON.parse(JSON.stringify(boxSizeMap[box]))
          : {}

        window.setTimeout(() => {
          const direction = window.getComputedStyle(
            window.document.documentElement || window.document.body
          ).direction || 'ltr'
          const writingMode = window.getComputedStyle(
            window.document.documentElement || window.document.body
          )['writing-mode'] || 'horizontal-tb'

          if (box === 'content-box' || box === 'device-pixel-content-box') {
            const paddingTop = parseInt(
              window.getComputedStyle($target)['padding-top']
            )
            const paddingBottom = parseInt(
              window.getComputedStyle($target)['padding-bottom']
            )
            const paddingLeft = parseInt(
              window.getComputedStyle($target)['padding-left']
            )
            const paddingRight = parseInt(
              window.getComputedStyle($target)['padding-right']
            )

            const contentBoxBlockSize = writingMode.startsWith('vertical-')
              ? $target.clientWidth - paddingLeft - paddingRight
              : $target.clientHeight - paddingTop - paddingBottom

            const contentBoxInlineSize = writingMode.startsWith('horizontal-') && direction === 'ltr'
              ? $target.clientWidth - paddingLeft - paddingRight
              : $target.clientHeight - paddingTop - paddingBottom

            if (box === 'content-box') {
              boxSize.contentBoxSize = [
                {
                  inlineSize: contentBoxInlineSize,
                  blockSize: contentBoxBlockSize
                }
              ]
            } else {
              boxSize.devicePixelContentBoxSize = [
                {
                  inlineSize: contentBoxInlineSize,
                  blockSize: contentBoxBlockSize
                }
              ]
            }
          } else if (box === 'border-box') {
            const borderBoxBlockSize = writingMode.startsWith('horizontal-')
              ? $target.offsetHeight
              : $target.offsetWidth
            const borderBoxInlineSize = writingMode.startsWith('vertical-')
              ? $target.offsetHeight
              : $target.offsetWidth

            boxSize.borderBoxSize = [
              {
                inlineSize: borderBoxInlineSize,
                blockSize: borderBoxBlockSize
              }
            ]
          }

          const $index = $entries.findIndex(
            (entry) => entry.target === $target
          )

          if ($index !== -1) {
            let entry = $entries[$index]
            entry = { ...entry, ...boxSize }
            $entries[$index] = entry

            $callback(
              $entries.slice(0).map(
                ($entry) => Object.freeze($entry)
              ),
              $observer
            )
          }
        }, 0)
      }, false)
    }

    unobserve (target = null) {
      this.entries = this.entries.filter((entry) => entry.target !== target)
    }

    disconnect () {
      this.entries = []
    }
  }

  return ResizeObserver
})()
