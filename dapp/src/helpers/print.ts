import FileSaver from 'file-saver'

export function saveAsFile(data: Blob, name: string) {
  FileSaver.saveAs(data, name)
}