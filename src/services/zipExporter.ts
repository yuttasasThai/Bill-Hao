import JSZip from 'jszip';

interface ZipExportOptions {
  revision: string;
  appName: string;
}

export async function generateSourceZip(options: ZipExportOptions): Promise<Blob> {
  const zip = new JSZip();
  zip.file(
    'README.md',
    `# ${options.appName} (${options.revision})\n\nโปรแกรมค่าใช้จ่ายประจำวันและเดือน บิลเฮา\n`
  );
  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
