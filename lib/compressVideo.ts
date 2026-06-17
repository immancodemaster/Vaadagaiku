const MAX_MB = 15;

export async function compressVideo(
  file: File,
  onProgress?: (msg: string) => void
): Promise<File> {
  if (file.size <= MAX_MB * 1024 * 1024) return file;

  onProgress?.('Loading compression engine...');

  const { FFmpeg } = await import('@ffmpeg/ffmpeg');
  const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

  const ffmpeg = new FFmpeg();

  await ffmpeg.load({
    coreURL: await toBlobURL(
      'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
      'text/javascript'
    ),
    wasmURL: await toBlobURL(
      'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
      'application/wasm'
    ),
  });

  onProgress?.('Compressing video...');

  const ext = file.name.split('.').pop() || 'mp4';
  const inputName = `input.${ext}`;

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  await ffmpeg.exec([
    '-i', inputName,
    '-vf', 'scale=1280:-2',
    '-c:v', 'libx264',
    '-crf', '28',
    '-preset', 'fast',
    '-c:a', 'aac',
    '-b:a', '96k',
    '-movflags', 'faststart',
    'output.mp4',
  ]);

  const data = await ffmpeg.readFile('output.mp4');
  // FFmpeg returns Uint8Array; copy buffer to satisfy strict TS ArrayBuffer type
  const src = data as unknown as Uint8Array;
  const copy = src.buffer.slice(src.byteOffset, src.byteOffset + src.byteLength) as ArrayBuffer;
  return new File([copy], 'compressed.mp4', { type: 'video/mp4' });
}
