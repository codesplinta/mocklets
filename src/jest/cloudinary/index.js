
export const fakeCloudinaryUploaderInstanceFactory = () => {
  const path = require('path')
  const fs = require('fs')
  const eos = require('end-of-stream')

  const assetPublicIds = {}
  const __baseLocation = `${path.resolve(process.cwd(), '__cloudinary_fake_remote_placeholder_folder')}`

  const Cloudinary = { v2: {} }

  Cloudinary.uploader = {
    /* eslint-disable-next-line */
    upload_stream: jest.fn(function (callback = () => undefined, options = {}) {
      const location = `${__baseLocation.replace(
        '__cloudinary_fake_remote_placeholder_folder', options.folder || '__cloudinary_fake_remote_placeholder_folder'
      )}` +
      (typeof options.folder === 'string' && options.folder.indexOf('.')
        ? ''
        /* eslint-disable-next-line */
        : `${options.public_id}${typeof options.format === 'string' ? '.' + options.format : ''}`)
      if (!fs.existsSync(__baseLocation) || !path.existsSync(location)) {
        fs.mkdirSync(__baseLocation)
      }

      fs.open(location, 'w', function (error) {
        if (error) throw error
      })

      const writableStream = fs.createWriteStream(location)

      eos(writableStream, (error) => {
        const createdAt = new Date()
        const timestampID = (createdAt.getTime()) / 1000

        if (!error) {
          const args = {
            version: timestampID,
            created_at: createdAt.toISOString(),
            format: options.format || '',
            url: `http://res.cloudinary.com/${process.env.CLOUDINARY_NAME || 'test'}/${options.resource_type || 'raw'}/upload/v${timestampID}/${path.basename((writableStream.path || '\\').replace(/\\/g, '/'))}`,
            secure_url: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME || 'test'}/${options.resource_type || 'raw'}/upload/v${timestampID}/${path.basename((writableStream.path || '\\').replace(/\\/g, '/'))}`,
            public_id: options.public_id,
            tags: [],
            /* eslint-disable-next-line */
            resource_type: options.resource_type || 'raw',
            /* eslint-disable-next-line */
            display_name: options.public_id,
            type: 'upload',
            placeholder: false
          }

          /* eslint-disable-next-line */
          assetPublicIds[options.public_id] = JSON.parse(JSON.stringify(
            args
          ))

          if (typeof callback === 'function') {
            callback(args)
          }
        } else {
          writableStream.destroy()
          fs.unlink(writableStream.path)
            .then(() => console.info('unlink successfully'))
            .catch((err) => console.error(err))
        }
      })

      return writableStream
    }),
    destroy: jest.fn(function destroy (publicId, callback) {
      if (fs.existsSync(publicId)) {
        fs.unlink(publicId)
      }

      delete assetPublicIds[publicId]

      if (typeof callback === 'function') {
        callback(publicId)
      }
    })
  }

  Cloudinary.v2.uploader = {
    /* eslint-disable-next-line */
    upload_stream: Cloudinary.uploader.upload_stream,
    rename: jest.fn(function (fromPublicId, toPublicId, options = {}) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (fromPublicId in assetPublicIds) {
            /* eslint-disable-next-line */
            return reject()
          }

          const formerAsset = assetPublicIds[fromPublicId]
          const timestampID = (new Date(formerAsset.createdAt).getTime()) / 1000

          assetPublicIds[toPublicId] = Object.assign({}, formerAsset, {
            public_id: toPublicId,
            version: timestampID,
            /* eslint-disable-next-line */
            resource_type: options.resource_type || 'raw',
            tags: [],
            type: options.type || 'upload',
            placeholder: false,
            url: `http://res.cloudinary.com/${process.env.CLOUDINARY_NAME || 'test'}/image/upload/v${timestampID}/${toPublicId}.jpg`,
            secure_url: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME || 'test'}/image/upload/v${timestampID}/${toPublicId}.jpg`,
            asset_folder: '',
            /* eslint-disable-next-line */
            display_name: toPublicId
          })
          delete assetPublicIds[fromPublicId]

          resolve(assetPublicIds[toPublicId])
        }, 1500)
      })
    }),
    /* eslint-disable-next-line */
    unsigned_upload: jest.fn(function (filePath, upload_preset = 'folder', options = {}) {
      const location = `${__baseLocation.replace(
        '__cloudinary_fake_remote_placeholder_folder', options.asset_folder || '__cloudinary_fake_remote_placeholder_folder'
      )}`
      if (!fs.existsSync(__baseLocation) || !path.existsSync(location)) {
        fs.mkdirSync(__baseLocation)
      }

      const [filename] = filePath.split('/').reverse()
      return new Promise((resolve, reject) => {
        fs.opendir(location, 'w', function (error, dir) {
          if (error) reject(error)
          dir.closeSync()
          fs.writeFile(path.join(dir.path, path.basename(filename)), fs.readFileSync(filePath), (err) => {
            if (err) reject(err)
            /* eslint-disable-next-line */
            resolve({ upload_preset })
          })
        })
      })
    }),
    /* eslint-disable-next-line */
    download_backedup_asset: jest.fn(function (assetId, versionId) {
      return `${assetId}/${versionId}`
    }),
    upload: jest.fn(function (filePath, options = {}) {
      const location = `${__baseLocation.replace(
        /* eslint-disable-next-line */
        '__cloudinary_fake_remote_placeholder_folder', options.asset_folder || options.folder || '__cloudinary_fake_remote_placeholder_folder'
      )}`
      if (!fs.existsSync(__baseLocation) || !path.existsSync(location)) {
        fs.mkdirSync(__baseLocation)
      }

      const [filename] = filePath.split('/').reverse()
      return new Promise((resolve, reject) => {
        fs.opendir(location, 'w', function (error, dir) {
          if (error) reject(error)
          dir.closeSync()
          fs.writeFile(path.join(dir.path, path.basename(filename)), fs.readFileSync(filePath), (err) => {
            if (err) reject(err)
            resolve()
          })
        })
      })
    }),
    destroy: jest.fn(function (publicId, options = {}) {
      return new Promise((resolve) => {
        if (fs.existsSync(publicId)) {
          fs.unlink(publicId)
        }

        delete assetPublicIds[publicId]

        resolve(publicId, options)
      })
    })
  }

  Cloudinary.uploader.__mocks = Cloudinary.v2.uploader = {
    uploadedFileExists: (publicId) => {
      return fs.existsSync(publicId)
    }
  }

  Cloudinary.uploader.__refresh = () => {
    if (fs.existsSync(__baseLocation)) {
      fs.rmdirSync(__baseLocation, { recursive: true })
    }
  }

  return Cloudinary
}
