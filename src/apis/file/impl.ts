import type { UploadInput, UploadOutput, GetInput, GetOutput, ListInput, ListOutput, DeleteInput, DeleteOutput } from './types';

/**
 * 内部辅助：核心上传逻辑
 */
async function uploadFileInternal(base64: string, format: string, chName: string, fileName: string): Promise<string | null> {
  try {
    const ctx = window.SillyTavern.getContext();
    const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;

    const body = {
      image: cleanBase64,
      format: format.replace('.', ''),
      ch_name: chName,
      filename: fileName
    };

    const response = await fetch('/api/images/upload', {
      method: 'POST',
      headers: {
        ...ctx.getRequestHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
    
    const data = await response.json();
    return data.path || null;
  } catch (e) {
    console.error('[ST API] File upload failed:', e);
    return null;
  }
}

/**
 * 上传文件
 */
export async function upload(input: UploadInput): Promise<UploadOutput> {
  const ctx = window.SillyTavern.getContext();
  
  let targetChName = input.chName || 'uploads';
  if (input.useCharacterDir) {
    targetChName = ctx.name2 || 'default';
  }

  const path = await uploadFileInternal(input.data, input.format, targetChName, input.fileName);

  if (!path) {
    throw new Error('File upload failed.');
  }

  return { path };
}

/**
 * 获取文件内容 (Base64)
 */
export async function get(input: GetInput): Promise<GetOutput> {
  const url = constructPath(input);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }

  const blob = await response.blob();
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  return {
    data,
    mimeType: blob.type
  };
}

/**
 * 列出文件夹下的文件
 */
export async function list(input: ListInput): Promise<ListOutput> {
  const ctx = window.SillyTavern.getContext();
  let targetChName = input.chName || 'uploads';
  if (input.useCharacterDir) {
    targetChName = ctx.name2 || 'default';
  }

  const response = await fetch('/api/images/list', {
    method: 'POST',
    headers: {
      ...ctx.getRequestHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      folder: targetChName,
      type: 7 
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to list files: ${response.statusText}`);
  }

  const filenames: string[] = await response.json();
  
  const files = filenames.map(name => ({
    name,
    path: `/user/images/${targetChName}/${name}`,
    size: 0,
    mtime: 0
  }));

  return { files };
}

/**
 * 删除文件或清空文件夹
 */
export async function deleteFile(input: DeleteInput): Promise<DeleteOutput> {
  const ctx = window.SillyTavern.getContext();

  // 如果提供了 url 或特定的文件名，执行单文件删除
  if (input.url || (input.fileName && input.format)) {
    const url = constructPath(input);
    const response = await fetch('/api/images/delete', {
      method: 'POST',
      headers: {
        ...ctx.getRequestHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path: url })
    });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }
    return { success: true };
  }

  // 否则，意图是清空整个文件夹内容
  // 由于酒馆后端 unlinkSync 不支持删除目录，我们仅提供清空该目录下所有文件的功能
  const { files } = await list({ 
    chName: input.chName, 
    useCharacterDir: input.useCharacterDir 
  });

  for (const file of files) {
    await deleteFile({ url: file.path });
  }

  return { success: true };
}

/**
 * 辅助：构建文件路径
 */
function constructPath(input: GetInput | DeleteInput | ListInput): string {
  if ('url' in input && input.url) return input.url;

  const ctx = window.SillyTavern.getContext();
  let chName = input.chName || 'uploads';
  if (input.useCharacterDir) {
    chName = ctx.name2 || 'default';
  }

  if (!('fileName' in input) || !input.fileName) {
    return `/user/images/${chName}`;
  }

  const fileName = input.fileName;
  const format = (input as any).format;
  const ext = format ? `.${format.replace('.', '')}` : '';
  return `/user/images/${chName}/${fileName}${ext}`;
}
