# API Usage Guide

## Endpoint

**GET** `https://kisanschemes.vercel.app/api/schemes`

Returns all government schemes as JSON array.

## Response Format

```json
[
  {
    "idx": 0,
    "id": "document-id",
    "scheme_code": "KCC",
    "scheme_name": "Kisan Credit Card",
    "full_name": "Kisan Credit Card Scheme",
    "description": "Provides adequate and timely credit support...",
    "category": "credit",
    "eligibility": [
      "All farmers including tenant farmers",
      "Engaged in agriculture and allied activities"
    ],
    "required_documents": [
      "Aadhaar Card",
      "Bank Account Details",
      "Land Documents"
    ],
    "benefits": "Credit limit up to ₹3 lakh at 7% interest rate...",
    "application_process": "Apply at nearest bank branch...",
    "official_website": "https://www.nabard.org/...",
    "deadline": "Open year-round",
    "is_active": true,
    "contact_number": "1800-180-6060",
    "created_at": "2025-11-12T18:52:49.917Z",
    "updated_at": "2025-11-12T18:52:49.918Z"
  }
]
```

## Usage Examples

### JavaScript/TypeScript (Fetch API)

```javascript
// Get all schemes
async function getAllSchemes() {
  try {
    const response = await fetch('https://kisanschemes.vercel.app/api/schemes');
    const schemes = await response.json();
    return schemes;
  } catch (error) {
    console.error('Error fetching schemes:', error);
    return [];
  }
}

// Get active schemes only
async function getActiveSchemes() {
  const schemes = await getAllSchemes();
  return schemes.filter(scheme => scheme.is_active);
}

// Get schemes by category
async function getSchemesByCategory(category) {
  const schemes = await getAllSchemes();
  return schemes.filter(scheme => scheme.category === category);
}

// Get scheme by code
async function getSchemeByCode(code) {
  const schemes = await getAllSchemes();
  return schemes.find(scheme => scheme.scheme_code === code);
}

// Usage
getAllSchemes().then(schemes => {
  console.log(`Found ${schemes.length} schemes`);
  schemes.forEach(scheme => {
    console.log(`${scheme.scheme_code}: ${scheme.scheme_name}`);
  });
});
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

interface GovernmentScheme {
  idx: number;
  id: string;
  scheme_code: string;
  scheme_name: string;
  full_name: string;
  description: string;
  category: string;
  eligibility: string[];
  required_documents: string[];
  benefits: string;
  application_process: string;
  official_website?: string;
  deadline?: string;
  is_active: boolean;
  contact_number?: string;
  created_at: string;
  updated_at: string;
}

function useSchemes() {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://kisanschemes.vercel.app/api/schemes')
      .then(res => res.json())
      .then(data => {
        setSchemes(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { schemes, loading, error };
}

// Usage in component
function SchemesList() {
  const { schemes, loading, error } = useSchemes();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {schemes.map(scheme => (
        <div key={scheme.id}>
          <h3>{scheme.scheme_name}</h3>
          <p>{scheme.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Python Example

```python
import requests

def get_all_schemes():
    """Fetch all government schemes from API"""
    url = "https://kisanschemes.vercel.app/api/schemes"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching schemes: {e}")
        return []

# Usage
schemes = get_all_schemes()
print(f"Found {len(schemes)} schemes")

# Filter active schemes
active_schemes = [s for s in schemes if s.get('is_active', False)]
print(f"Active schemes: {len(active_schemes)}")

# Get by category
credit_schemes = [s for s in schemes if s.get('category') == 'credit']
print(f"Credit schemes: {len(credit_schemes)}")
```

### Node.js Example

```javascript
const https = require('https');

function fetchSchemes() {
  return new Promise((resolve, reject) => {
    https.get('https://kisanschemes.vercel.app/api/schemes', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const schemes = JSON.parse(data);
          resolve(schemes);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Usage
fetchSchemes()
  .then(schemes => {
    console.log(`Found ${schemes.length} schemes`);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### cURL Example

```bash
# Get all schemes
curl https://kisanschemes.vercel.app/api/schemes

# Save to file
curl https://kisanschemes.vercel.app/api/schemes -o schemes.json

# Pretty print with jq
curl https://kisanschemes.vercel.app/api/schemes | jq '.'
```

## Filtering and Querying

Since the API returns all schemes, you can filter client-side:

```javascript
// Filter by category
const creditSchemes = schemes.filter(s => s.category === 'credit');

// Filter active schemes
const activeSchemes = schemes.filter(s => s.is_active);

// Search by name
const searchResults = schemes.filter(s => 
  s.scheme_name.toLowerCase().includes('kisan')
);

// Get by scheme code
const kccScheme = schemes.find(s => s.scheme_code === 'KCC');
```

## Rate Limiting

The API is currently public with no rate limiting. For production use, consider:
- Caching responses client-side
- Implementing request throttling
- Using a CDN for better performance

## CORS

The API endpoint allows cross-origin requests, so you can use it from any web application.

## Error Handling

Always handle errors gracefully:

```javascript
async function fetchSchemes() {
  try {
    const response = await fetch('https://kisanschemes.vercel.app/api/schemes');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const schemes = await response.json();
    return schemes;
  } catch (error) {
    console.error('Failed to fetch schemes:', error);
    // Return empty array or cached data as fallback
    return [];
  }
}
```

