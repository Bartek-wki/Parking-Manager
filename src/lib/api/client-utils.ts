export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API Error ${response.status}: ${response.statusText}`;
    let payload: unknown = undefined;

    try {
      const errorJson = JSON.parse(errorText);
      payload = errorJson;
      if (errorJson.error) {
        errorMessage = errorJson.error;
      } else if (errorJson.message) {
        errorMessage = errorJson.message;
      } else if (errorJson.errors) {
        errorMessage = "Validation error"; // Placeholder, payload has details
      }
    } catch {
      // Ignore if not JSON
    }

    throw new ApiError(response.status, errorMessage, payload);
  }

  // Handle empty response (e.g. 204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  try {
    return await response.json();
  } catch {
    return {} as T; // Fallback for empty body with 200 OK
  }
}
