import type {
  GetAvatarInput,
  AvatarOutput,
  ListAvatarsInput,
  ListAvatarsOutput,
  AvatarType,
} from './types';

/**
 * 等待或检查 APP_READY
 */
async function waitAppReady(): Promise<void> {
  const ctx = (window as any).SillyTavern?.getContext?.();
  if (!ctx) return;

  const { eventSource, event_types } = ctx;

  if (typeof eventSource?.once === 'function' && event_types?.APP_READY) {
    await new Promise<void>((resolve) => {
      if (document.getElementById('form_create')) {
        resolve();
        return;
      }
      eventSource.once(event_types.APP_READY, () => resolve());
    });
  }
}

/**
 * 确保文件名以 .png 结尾
 */
function ensurePngExtension(name: string): string {
  const trimmed = name.trim();
  if (trimmed.toLowerCase().endsWith('.png')) {
    return trimmed;
  }
  return `${trimmed}.png`;
}

/**
 * 将图片 URL 转换为 Base64
 */
async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Failed to read image as base64'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return '';
  }
}

/**
 * 获取 SillyTavern 上下文
 */
function getContext(): any {
  return (window as any).SillyTavern?.getContext?.();
}

/**
 * 获取当前角色的头像文件名
 */
function getCurrentCharacterAvatarFileName(): string | null {
  const ctx = getContext();
  if (!ctx) return null;

  const characterId = ctx.characterId;
  if (characterId === undefined || characterId === null || characterId < 0) {
    return null;
  }

  const character = ctx.characters?.[characterId];
  if (!character) return null;

  const avatarFileName = character.avatar || '';
  if (!avatarFileName || avatarFileName === 'none') {
    return null;
  }

  return avatarFileName;
}

/**
 * 获取当前用户的头像文件名
 */
function getCurrentUserAvatarFileName(): string | null {
  const ctx = getContext();
  if (!ctx) return null;

  // 从 powerUserSettings.personas 获取（已配置的 persona 列表）
  const personas = ctx.powerUserSettings?.personas;
  if (personas && typeof personas === 'object') {
    const keys = Object.keys(personas);
    if (keys.length > 0) {
      // 优先使用 default_persona，否则使用第一个
      const defaultPersona = ctx.powerUserSettings?.default_persona;
      if (defaultPersona && keys.includes(defaultPersona)) {
        return defaultPersona;
      }
      return keys[0];
    }
  }

  // 如果没有配置的 persona，返回默认头像
  return 'user-default.png';
}

/**
 * 从 API 获取所有用户头像文件名列表
 */
async function fetchUserAvatarsList(): Promise<string[]> {
  try {
    const ctx = getContext();
    const headers = ctx?.getRequestHeaders?.({ omitContentType: true }) || {};

    const response = await fetch('/api/avatars/get', {
      method: 'POST',
      headers,
    });

    if (response.ok) {
      const avatars = await response.json();
      if (Array.isArray(avatars)) {
        return avatars;
      }
    }
  } catch (error) {
    console.error('Error fetching user avatars:', error);
  }
  return [];
}

/**
 * 构建单个头像输出
 * @param includeFullBase64 是否获取完整图片的 base64（默认 true）
 */
async function buildAvatarOutput(
  type: AvatarType,
  fileName: string,
  isCurrent: boolean,
  includeFullBase64: boolean = true
): Promise<AvatarOutput> {
  const ctx = getContext();

  let url: string;
  let thumbnailUrl: string;

  if (type === 'character') {
    // 角色头像完整路径
    url = `characters/${fileName}`;
    // 缩略图使用 thumbnail API
    thumbnailUrl = ctx?.getThumbnailUrl?.('avatar', fileName) || `/thumbnail?type=avatar&file=${encodeURIComponent(fileName)}`;
  } else {
    // 用户头像完整路径
    url = `User Avatars/${fileName}`;
    // 缩略图使用 thumbnail API
    thumbnailUrl = ctx?.getThumbnailUrl?.('persona', fileName) || `/thumbnail?type=persona&file=${encodeURIComponent(fileName)}`;
  }

  // 获取 base64
  let base64 = '';
  let thumbnailBase64 = '';

  if (includeFullBase64) {
    // 并行获取完整图片和缩略图的 base64
    [base64, thumbnailBase64] = await Promise.all([
      imageUrlToBase64(url),
      imageUrlToBase64(thumbnailUrl),
    ]);
  } else {
    // 仅获取缩略图的 base64
    thumbnailBase64 = await imageUrlToBase64(thumbnailUrl);
  }

  const name = fileName.replace(/\.png$/i, '');

  return {
    type,
    name,
    url,
    thumbnailUrl,
    base64,
    thumbnailBase64,
    isCurrent,
  };
}

/**
 * 获取头像
 */
export async function get(input: GetAvatarInput): Promise<AvatarOutput> {
  await waitAppReady();

  const { type, name } = input;

  if (!type) {
    throw new Error('type is required');
  }

  let fileName: string;
  let isCurrent = false;

  if (name) {
    // 用户指定了名称
    fileName = ensurePngExtension(name);
  } else {
    // 获取当前的头像
    isCurrent = true;

    if (type === 'character') {
      const currentFileName = getCurrentCharacterAvatarFileName();
      if (!currentFileName) {
        throw new Error('No character selected in current chat');
      }
      fileName = currentFileName;
    } else {
      const currentFileName = getCurrentUserAvatarFileName();
      if (!currentFileName) {
        throw new Error('No user avatar found');
      }
      fileName = currentFileName;
    }
  }

  return buildAvatarOutput(type, fileName, isCurrent);
}

/**
 * 批量获取头像
 */
export async function list(input: ListAvatarsInput): Promise<ListAvatarsOutput> {
  await waitAppReady();

  const { type, includeFullBase64 = false } = input;

  if (!type) {
    throw new Error('type is required');
  }

  const ctx = getContext();
  if (!ctx) {
    throw new Error('SillyTavern context not available');
  }

  const result: ListAvatarsOutput = {
    characters: [],
    users: [],
    total: 0,
  };

  // 获取当前选中的头像用于标记
  const currentCharacterFileName = getCurrentCharacterAvatarFileName();
  const currentUserFileName = getCurrentUserAvatarFileName();

  // 获取角色头像列表
  if (type === 'character' || type === 'all') {
    const characters = ctx.characters || [];
    const avatarPromises: Promise<AvatarOutput>[] = [];

    for (const char of characters) {
      const avatar = char?.avatar;
      if (avatar && avatar !== 'none') {
        const isCurrent = avatar === currentCharacterFileName;
        avatarPromises.push(buildAvatarOutput('character', avatar, isCurrent, includeFullBase64));
      }
    }

    result.characters = await Promise.all(avatarPromises);
  }

  // 获取用户头像列表
  if (type === 'user' || type === 'all') {
    // 从 API 获取所有用户头像
    const userAvatarFiles = await fetchUserAvatarsList();
    const avatarPromises: Promise<AvatarOutput>[] = [];

    for (const fileName of userAvatarFiles) {
      if (fileName) {
        const isCurrent = fileName === currentUserFileName;
        avatarPromises.push(buildAvatarOutput('user', fileName, isCurrent, includeFullBase64));
      }
    }

    result.users = await Promise.all(avatarPromises);
  }

  result.total = result.characters.length + result.users.length;

  return result;
}
