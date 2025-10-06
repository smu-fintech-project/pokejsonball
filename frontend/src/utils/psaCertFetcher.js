/**
 * PSA Certificate Fetcher - Production-Ready Client-Side Utility
 * 
 * Fetches and renders PSA certificate metadata dynamically from the API.
 * No hardcoded values - all data is API-derived with safe fallbacks.
 * 
 * @module psaCertFetcher
 */

/**
 * Safely resolve certificate fields from API response
 * Handles multiple response structures with defensive fallbacks
 * 
 * @param {Object} data - Raw API response
 * @returns {Object} Resolved certificate fields
 * 
 * @example Response structures handled:
 * // Structure 1: Nested card object
 * { card: { name: "Charizard", year: 1999, grade: "GEM MT 10" } }
 * 
 * // Structure 2: Flat structure
 * { name: "Charizard", year: 1999, grade: "10" }
 * 
 * // Structure 3: PSA API standard (capitalized keys)
 * { CardName: "Charizard", Year: "1999", Grade: "10", GradeDescription: "GEM MT" }
 */
function resolveCertFields(data) {
  // Defensive: handle null/undefined data
  if (!data || typeof data !== 'object') {
    return { name: null, grade: null, year: null };
  }

  // Name resolution with multiple fallback paths
  const name = data.card?.name 
    ?? data.card?.Name 
    ?? data.name 
    ?? data.Name 
    ?? data.CardName 
    ?? null;

  // Grade resolution - handle both string and numeric grades
  const grade = data.card?.grade 
    ?? data.card?.Grade 
    ?? data.grade 
    ?? data.Grade 
    ?? data.GradeDescription 
    ?? null;

  // Year resolution - handle both string and numeric years
  const year = data.card?.year 
    ?? data.card?.Year 
    ?? data.year 
    ?? data.Year 
    ?? null;

  return { name, grade, year };
}

/**
 * Create error message element
 * 
 * @param {string} message - Error message to display
 * @returns {HTMLElement} Styled error div
 */
function createErrorElement(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.style.cssText = `
    color: #ef4444;
    background-color: #fee;
    border: 1px solid #fcc;
    border-radius: 4px;
    padding: 12px;
    margin: 8px 0;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
  `;
  errorDiv.textContent = message;
  return errorDiv;
}

/**
 * Render certificate metadata fields
 * 
 * @param {Object} fields - Resolved certificate fields
 * @param {string} title - Section title
 * @returns {HTMLElement} Rendered metadata container
 */
function renderMetadata(fields, title) {
  const container = document.createElement('div');
  container.className = 'cert-metadata';
  container.style.cssText = `
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    margin: 12px 0;
    font-family: system-ui, -apple-system, sans-serif;
  `;

  // Title
  const titleEl = document.createElement('h3');
  titleEl.style.cssText = `
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  `;
  titleEl.textContent = title;
  container.appendChild(titleEl);

  // Fields container
  const fieldsContainer = document.createElement('div');
  fieldsContainer.style.cssText = 'display: grid; gap: 8px;';

  // Render each field with "Unknown" fallback for missing values
  const fieldData = [
    { label: 'Name', value: fields.name ?? 'Unknown' },
    { label: 'Grade', value: fields.grade ?? 'Unknown' },
    { label: 'Year', value: fields.year ?? 'Unknown' },
  ];

  fieldData.forEach(({ label, value }) => {
    const fieldRow = document.createElement('div');
    fieldRow.style.cssText = `
      display: flex;
      justify-content: space-between;
      padding: 8px;
      background: white;
      border-radius: 4px;
    `;

    const labelEl = document.createElement('span');
    labelEl.style.cssText = 'font-weight: 500; color: #6b7280;';
    labelEl.textContent = `${label}:`;

    const valueEl = document.createElement('span');
    valueEl.style.cssText = 'color: #111827;';
    valueEl.textContent = String(value);

    fieldRow.appendChild(labelEl);
    fieldRow.appendChild(valueEl);
    fieldsContainer.appendChild(fieldRow);
  });

  container.appendChild(fieldsContainer);
  return container;
}

/**
 * Fetch and render PSA certificate metadata
 * 
 * Main entry point - fetches certificate data from API and renders it dynamically.
 * All values are API-derived with safe fallbacks to "Unknown".
 * 
 * @param {string} metaUrl - Full PSA API endpoint URL for certificate metadata
 * @param {string} PSA_TOKEN - Bearer token for PSA API authentication
 * @param {HTMLElement} metadataDiv - Container element to append rendered metadata
 * @returns {Promise<Object>} Resolved certificate data
 * 
 * @throws {Error} Network or API errors (caught and rendered as error messages)
 * 
 * @example
 * const container = document.getElementById('cert-metadata');
 * const data = await fetchAndRenderCert(
 *   'https://api.psacard.com/publicapi/v1/cert/12345678',
 *   'your-api-token',
 *   container
 * );
 */
export async function fetchAndRenderCert(metaUrl, PSA_TOKEN, metadataDiv) {
  // Clear previous content
  metadataDiv.innerHTML = '';

  try {
    // Fetch certificate metadata with Bearer token authentication
    const res = await fetch(metaUrl, {
      headers: {
        Authorization: `Bearer ${PSA_TOKEN}`,
        Accept: 'application/json',
      },
    });

    // Get response text for detailed error reporting
    const text = await res.text();

    // Handle non-OK responses with detailed error message
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    // Parse JSON response with error handling
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      // JSON parsing failed - render error and return early
      metadataDiv.textContent = 'Cert metadata response is not JSON.';
      console.error('Parse error:', parseError);
      console.error('Response text:', text);
      return null;
    }

    // Resolve certificate fields using safe resolver
    const fields = resolveCertFields(data);

    // Log resolved data for debugging
    console.log('Resolved certificate fields:', fields);
    console.log('Raw API response:', data);

    // Render metadata with resolved fields (no hardcoding)
    const metadataElement = renderMetadata(fields, 'PSA Certificate Metadata');
    metadataDiv.appendChild(metadataElement);

    // Return resolved data for programmatic use
    return { success: true, fields, raw: data };

  } catch (err) {
    // Create and append error message element
    const errorDiv = createErrorElement(`Failed to fetch certificate meta: ${err.message}`);
    metadataDiv.appendChild(errorDiv);

    // Log detailed error for debugging
    console.error('Metadata fetch error:', err);
    console.error('Request URL:', metaUrl);

    // Return error state for programmatic use
    return { success: false, error: err.message };
  }
}

/**
 * Batch fetch multiple certificates
 * 
 * @param {Array<{metaUrl: string}>} certRequests - Array of certificate requests
 * @param {string} PSA_TOKEN - Bearer token for authentication
 * @returns {Promise<Array<Object>>} Array of resolved certificate data
 * 
 * @example
 * const certs = await batchFetchCerts([
 *   { metaUrl: 'https://api.psacard.com/publicapi/v1/cert/12345678' },
 *   { metaUrl: 'https://api.psacard.com/publicapi/v1/cert/87654321' },
 * ], token);
 */
export async function batchFetchCerts(certRequests, PSA_TOKEN) {
  const results = await Promise.allSettled(
    certRequests.map(async ({ metaUrl }) => {
      const res = await fetch(metaUrl, {
        headers: {
          Authorization: `Bearer ${PSA_TOKEN}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      return resolveCertFields(data);
    })
  );

  return results.map((result, index) => ({
    certNumber: certRequests[index].metaUrl.split('/').pop(),
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason.message : null,
  }));
}

// Export utilities for testing/custom use
export { resolveCertFields, createErrorElement, renderMetadata };

