export const cleanFilename = (path: string) => {
  const withoutTrailingSlash = removeTrailingSlash(path)
  const parts = withoutTrailingSlash.split('/')
  const dir = parts.slice(0, parts.length - 1).join('/')
  const fname = parts[parts.length - 1]
  const extension = `.${fname.split('.').pop()}`
  return removeLeadingSlash(
    `${dir}/${fname.replace(extension, '').replace(/[\W_]+/g, '')}${extension}`
  )
}

export const removeLeadingSlash = (path: string) => {
  return path.charAt(0) === '/' ? path.slice(1) : path
}

export const removeTrailingSlash = (path: string) => {
  return path.charAt(path.length - 1) === '/' ? path.slice(0, path.length - 1) : path
}
