const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
};

const MINUTES_PER_DAY = 1440;

export const json = (payload, status = 200, extraHeaders = {}) => {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...extraHeaders,
    },
  });
};

export const error = (message, status = 500, code = 'INTERNAL_ERROR', details) => {
  const payload = {
    error: {
      code,
      message,
    },
  };

  if (details) {
    payload.error.details = details;
  }

  return json(payload, status);
};

export const getDbOrError = (env) => {
  if (!env?.DB) {
    return {
      db: null,
      response: error('未找到 D1 数据库绑定（DB）', 500, 'DB_BINDING_MISSING'),
    };
  }

  return {
    db: env.DB,
    response: null,
  };
};

export const ensureBackupPermission = (env, request) => {
  const configuredKey = String(env?.BACKUP_KEY || '').trim();

  if (!configuredKey) {
    return null;
  }

  const providedKey = request.headers.get('x-backup-key')?.trim() || '';
  if (providedKey !== configuredKey) {
    return error('缺少或错误的备份口令', 401, 'BACKUP_AUTH_FAILED');
  }

  return null;
};

export const readPathId = (pathParam) => {
  if (Array.isArray(pathParam)) {
    return pathParam.length > 0 ? pathParam[0] : null;
  }

  if (typeof pathParam === 'string') {
    return pathParam.length > 0 ? pathParam : null;
  }

  return null;
};

export const parseJsonArrayColumn = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string' || value.length === 0) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const normalizeDishRow = (row) => {
  return {
    ...row,
    image: row.image || '',
    tutorial_url: row.tutorial_url || '',
    ingredients: parseJsonArrayColumn(row.ingredients),
    instructions: parseJsonArrayColumn(row.instructions),
    tags: parseJsonArrayColumn(row.tags),
  };
};

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const sanitizeStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item ?? '').trim())
    .filter((item) => item.length > 0);
};

const sanitizeOptionalText = (value) => {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim();
};

export const validateDishPayload = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {
      ok: false,
      errors: ['请求体必须为 JSON 对象'],
      data: null,
    };
  }

  const name = sanitizeOptionalText(input.name);
  const category = sanitizeOptionalText(input.category) || '家常菜';
  const difficulty = toPositiveInt(input.difficulty, 1);
  const cookingTime = toPositiveInt(input.cooking_time, 30);
  const servings = toPositiveInt(input.servings, 2);

  const ingredients = sanitizeStringArray(input.ingredients);
  const instructions = sanitizeStringArray(input.instructions);
  const tags = sanitizeStringArray(input.tags);
  const image = sanitizeOptionalText(input.image);
  const tutorialUrl = sanitizeOptionalText(input.tutorial_url);

  const errors = [];

  if (!name) {
    errors.push('菜名不能为空');
  }

  if (ingredients.length === 0) {
    errors.push('至少需要一个食材');
  }

  if (instructions.length === 0) {
    errors.push('至少需要一个制作步骤');
  }

  if (difficulty < 1 || difficulty > 5) {
    errors.push('难度必须在 1 到 5 之间');
  }

  if (cookingTime < 1 || cookingTime > MINUTES_PER_DAY) {
    errors.push('制作时长必须在 1 到 1440 分钟之间');
  }

  if (servings < 1 || servings > 50) {
    errors.push('份量必须在 1 到 50 之间');
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
      data: null,
    };
  }

  return {
    ok: true,
    errors: [],
    data: {
      name,
      category,
      difficulty,
      cooking_time: cookingTime,
      servings,
      ingredients,
      instructions,
      image,
      tags,
      tutorial_url: tutorialUrl,
    },
  };
};

export const toDishId = (rawId) => {
  const id = Number.parseInt(String(rawId ?? ''), 10);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
};
