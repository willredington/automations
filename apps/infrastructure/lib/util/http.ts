export const JSON_HEADERS = {
  "Content-Type": "application/json",
};

export const TEXT_HEADERS = {
  "Content-Type": "text",
};

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Credentials": "true",
};

export function jsonResponse(props: { statusCode: number; body: unknown }) {
  return {
    statusCode: props.statusCode,
    headers: { ...JSON_HEADERS, ...CORS_HEADERS },
    body: JSON.stringify(props.body),
  };
}

export function textResponse(props: { statusCode: number; body: string }) {
  return {
    statusCode: props.statusCode,
    headers: { ...TEXT_HEADERS, ...CORS_HEADERS },
    body: props.body,
  };
}
