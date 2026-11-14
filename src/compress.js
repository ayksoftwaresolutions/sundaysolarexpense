/**
 * Resize + JPEG-compress an image file for Drive upload.
 * Max edge ~1600px, quality ~0.8.
 */
export function compressImage(file, { maxEdge = 1600, quality = 0.8 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file.'))
      return
    }

    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      const scale = Math.min(1, maxEdge / Math.max(width, height))
      width = Math.round(width * scale)
      height = Math.round(height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not compress image.'))
            return
          }
          const reader = new FileReader()
          reader.onload = () => {
            const dataUrl = reader.result
            const base64 = String(dataUrl).split(',')[1] || ''
            resolve({
              blob,
              base64,
              mimeType: 'image/jpeg',
              previewUrl: dataUrl,
              fileName: file.name.replace(/\.[^.]+$/, '') + '.jpg',
            })
          }
          reader.onerror = () => reject(new Error('Could not read compressed image.'))
          reader.readAsDataURL(blob)
        },
        'image/jpeg',
        quality,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not load image.'))
    }

    img.src = url
  })
}
