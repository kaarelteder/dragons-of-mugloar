export const decodeAdId = (adId: string, encrypted: number | null | undefined): string => {
  if (encrypted === 1) {
    return atob(adId)
  }
  if (encrypted === 2) {
    return rot13(adId)
  }
  return adId
}

export const rot13 = (str: string): string => {
  return str.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0)
    const base = code >= 97 ? 97 : 65
    return String.fromCharCode(((code - base + 13) % 26) + base)
  })
}
