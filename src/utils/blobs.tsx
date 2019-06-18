export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const downloadLink = Object.assign(document.createElement('a'), {
    href: url,
    download: name,
  });
  document.body.appendChild(downloadLink);
  downloadLink.click();
  setTimeout(() => {
    if (downloadLink.parentNode) {
      downloadLink.parentNode.removeChild(downloadLink);
    }
    URL.revokeObjectURL(url);
  }, 500);
}
