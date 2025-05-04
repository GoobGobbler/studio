// src/lib/secrets.ts
// Client-side library for interacting with the Secrets Service

// --- Configuration ---
const SECRETS_API_URL = process.env.NEXT_PUBLIC_SECRETS_SERVICE_URL || '/api/proxy/secrets'; // Use a proxy route or direct URL

// Type for a secret key-value pair
export interface Secret {
  key: string;
  value: string; // Value is retrieved decrypted
  scope?: string; // Optional scope identifier
}

// --- API Functions ---

/**
 * Fetches a secret value by key from the secrets service for a specific scope.
 * Requires proper authentication handled by the fetch call or underlying setup.
 * @param key The key of the secret to retrieve.
 * @param scope Optional scope (e.g., 'project:id', 'account:id'). Defaults to global.
 * @param authToken Optional authentication token (e.g., JWT).
 * @returns The secret value string or null if not found or an error occurred.
 */
export async function getSecret(key: string, scope?: string, authToken?: string): Promise<string | null> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const url = new URL(`${SECRETS_API_URL}/${encodeURIComponent(key)}`, window.location.origin); // Base URL needed for URLSearchParams
    if (scope) {
        url.searchParams.append('scope', scope);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: headers,
    });

    if (response.status === 404) {
      console.log(`Secret not found for key: ${key} in scope: ${scope || '_global'}`);
      return null;
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Secrets service error: ${response.status} ${response.statusText}` }));
        throw new Error(errorData.message || `Secrets service error: ${response.status}`);
    }

    const data: Secret = await response.json();
    return data.value;

  } catch (error: any) {
    console.error(`Error fetching secret "${key}" (scope: ${scope || '_global'}):`, error.message);
    // Handle specific errors (network, parsing) if needed
    return null;
  }
}

/**
 * Stores or updates a secret in the secrets service for a specific scope.
 * Requires proper authentication.
 * @param key The key of the secret to store.
 * @param value The secret value (will be encrypted server-side).
 * @param scope Optional scope (e.g., 'project:id', 'account:id'). Defaults to global.
 * @param authToken Optional authentication token.
 * @returns True if successful, false otherwise.
 */
export async function setSecret(key: string, value: string, scope?: string, authToken?: string): Promise<boolean> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const url = new URL(`${SECRETS_API_URL}/${encodeURIComponent(key)}`, window.location.origin);
     if (scope) {
         url.searchParams.append('scope', scope);
     }

    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({ value }),
    });

    if (!response.ok) {
      // Log the error details server-side if possible
      console.error(`Secrets service error on set: ${response.status} ${response.statusText}`);
      // Attempt to read error message from response body
      try {
         const errorBody = await response.json();
         console.error("Error body:", errorBody);
          throw new Error(errorBody.error || `Secrets service error: ${response.status}`);
      } catch (e) {
          throw new Error(`Secrets service error: ${response.status} ${response.statusText}`);
      }
    }

    console.log(`Secret stored successfully for key: ${key} in scope: ${scope || '_global'}`);
    return true;

  } catch (error: any) {
    console.error(`Error setting secret "${key}" (scope: ${scope || '_global'}):`, error.message);
    return false;
  }
}

/**
 * Deletes a secret from the secrets service for a specific scope.
 * Requires proper authentication.
 * @param key The key of the secret to delete.
 * @param scope Optional scope (e.g., 'project:id', 'account:id'). Defaults to global.
 * @param authToken Optional authentication token.
 * @returns True if successful or not found, false on error.
 */
export async function deleteSecret(key: string, scope?: string, authToken?: string): Promise<boolean> {
   try {
    const headers: HeadersInit = {};
     if (authToken) {
       headers['Authorization'] = `Bearer ${authToken}`;
     }

     const url = new URL(`${SECRETS_API_URL}/${encodeURIComponent(key)}`, window.location.origin);
     if (scope) {
         url.searchParams.append('scope', scope);
     }

     const response = await fetch(url.toString(), {
       method: 'DELETE',
       headers: headers,
     });

     // Consider 404 as success for delete operations (idempotency)
     if (!response.ok && response.status !== 404) {
        const errorData = await response.json().catch(() => ({ message: `Secrets service error on delete: ${response.status} ${response.statusText}` }));
        throw new Error(errorData.message || `Secrets service error on delete: ${response.status}`);
     }

     console.log(`Secret deleted successfully for key: ${key} in scope: ${scope || '_global'} (or was not found)`);
     return true;

   } catch (error: any) {
     console.error(`Error deleting secret "${key}" (scope: ${scope || '_global'}):`, error.message);
     return false;
   }
}

/**
 * Lists the keys of available secrets for a specific scope.
 * Requires proper authentication and authorization. Use with caution.
 * @param scope Optional scope (e.g., 'project:id', 'account:id'). Defaults to global.
 * @param authToken Optional authentication token.
 * @returns An array of secret keys or null on error.
 */
export async function listSecretKeys(scope?: string, authToken?: string): Promise<string[] | null> {
    try {
        const headers: HeadersInit = {};
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const url = new URL(SECRETS_API_URL, window.location.origin);
        if (scope) {
            url.searchParams.append('scope', scope);
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Secrets service error on list: ${response.status} ${response.statusText}` }));
             throw new Error(errorData.message || `Secrets service error on list: ${response.status}`);
        }

        const data: { keys: string[] } = await response.json();
        return data.keys;

    } catch (error: any) {
        console.error(`Error listing secret keys (scope: ${scope || '_global'}):`, error.message);
        return null;
    }
}

// --- Potential Enhancements ---
// - Batch operations (get/set multiple secrets)
// - More sophisticated error handling and reporting
// - Caching strategies (with invalidation)
// - Integration with frontend state management
