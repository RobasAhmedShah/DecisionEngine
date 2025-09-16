/**
 * DataService Configuration
 * Multiple URL options to handle different network configurations
 */

export class DataServiceConfig {
  /**
   * Get API URLs to try in order of preference
   */
  static getApiUrls(applicationId: number): string[] {
    return [
      // Next.js API route (relative path)
      `/api/applications/${applicationId}`,
      
      // Next.js development server (default port 3000)
      `http://localhost:3000/api/applications/${applicationId}`,
      
      // IPv4 explicit for Next.js
      `http://127.0.0.1:3000/api/applications/${applicationId}`,
      
      // Alternative port fallback
      `http://localhost:3001/api/applications/${applicationId}`,
    ];
  }

  /**
   * Get CBS API URLs to try in order of preference
   */
  static getCbsApiUrls(applicationId: number): string[] {
    return [
      // Next.js API route (relative path)
      `/api/cbs/${applicationId}`,
      
      // Next.js development server (default port 3000)
      `http://localhost:3000/api/cbs/${applicationId}`,
      
      // IPv4 explicit for Next.js
      `http://127.0.0.1:3000/api/cbs/${applicationId}`,
      
      // Alternative port fallback
      `http://localhost:3001/api/cbs/${applicationId}`,
    ];
  }

  /**
   * Try multiple URLs until one works
   */
  static async tryMultipleUrls(urls: string[], options: RequestInit = {}): Promise<Response | null> {
    for (const url of urls) {
      try {
        console.log(`🔄 Trying URL: ${url}`);
        const response = await fetch(url, {
          ...options,
          signal: AbortSignal.timeout(5000) // 5 second timeout per URL
        });
        
        if (response.ok) {
          console.log(`✅ Success with URL: ${url}`);
          return response;
        } else {
          console.log(`⚠️ URL ${url} returned: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`❌ URL ${url} failed:`, error instanceof Error ? error.message : error);
      }
    }
    
    console.log(`❌ All URLs failed`);
    return null;
  }
}
