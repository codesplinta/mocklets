export const fakeCloudinaryUploaderInstanceFactory = () => {
  const fs = require('fs')
  const path = require('path')
  const eos = require('end-of-stream')

  const Cloudinary = {}

  Cloudinary.uploader = {
    __baseLocation: './',
    upload_stream: jest.fn(function (callback, options = {}) {
      const location = `${this.__baseLocation}${options.public_id}`
      if (!fs.existsSync(this.__baseLocation) || !path.existsSync(location)) {
        fs.mkdirSync(this.__baseLocation)
      }
      fs.open(location, 'w', function (error, file) {
        if (error) throw error

        const writableStream = fs.createWriteStream(location)
        eos(writableStream, (error) => {
          if (!error) {
            const args = { secure_url: writableStream.path, public_id: 'xxxxxxxxxxxx' }
            callback(args)
          } else {
            writableStream.destroy()
            fs.unlink(writableStream.path)
              .then(() => console.log('unlink successfully'))
              .catch((err) => console.log(err))
          }
        })

        return writableStream
      })
    }),
    destroy: jest.fn(function destroy (publicId, callback) {
      if (fs.existsSync(publicId)) {
        fs.unlink(publicId)
      }

      if (typeof callback === 'function') {
        callback(publicId)
      }
    })
  }

  Cloudinary.uploader.__refresh = () => {
    if (fs.existsSync(this.__baseLocation)) {
      fs.rmdirSync(this.__baseLocation, { recursive: true })
    }
  }

  return Cloudinary
}
