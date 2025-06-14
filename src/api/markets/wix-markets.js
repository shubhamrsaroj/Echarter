import {getSecret} from 'wix-secrets-backend';
import {fetch} from 'wix-fetch';

export const getApiKey = async() => {
    try {
        const apiKey = await getSecret("instacharter");
        return apiKey;
    } catch (error) {
        console.error('Error retrieving API key:', error);
        // Fallback for development only - remove in production
        return "instacharter@2025";
    }
}

// Function to use a specific JWT token
export const getAvailabilitiesWithToken = async (pageNo = 1, token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiIzYWM2MjcxOC0wNDVmLTRmYTMtYTAzMy02OTY1MTE5MmI4ZDciLCJDb21JZCI6IjE5MjEiLCJOYW1lIjoiU2h1YmhhbSBTYXJvaiIsIkVtYWlsIjoic2h1YmhhbUBpbnN0YWNoYXJ0ZXIuYXBwIiwiUm9sZSI6IkFkbWluLCBCcm9rZXIsIFVzZXIsIE9wZXJhdG9yIiwiQ3VycmVuY3kiOiJJTlIiLCJQaG9uZU51bWJlciI6Iis5MSA4ODUwNDk3MzY0IiwiVGltZVpvbmUiOiIzMzAiLCJJc1ByZW1pdW0iOiJUcnVlIiwiZXhwIjoxOTA3NDAwNTcxLCJpc3MiOiJodHRwczovL2luc3RhY2hhcnRlcmFwcC1zZXJ2ZXItY2dmcWd1ZzVmMmZzYWVhZy5jZW50cmFsdXMtMDEuYXp1cmV3ZWJzaXRlcy5uZXQiLCJhdWQiOiJodHRwczovL2luc3RhY2hhcnRlcmFwcC1zZXJ2ZXItY2dmcWd1ZzVmMmZzYWVhZy5jZW50cmFsdXMtMDEuYXp1cmV3ZWJzaXRlcy5uZXQvIn0.9AsTY3ZBLL994XG6Kzt7OMhTpUG9Vi8YAuEUes1dcUU") => {
    try {
        // Get API key
        const apiKey = await getApiKey();
        
        // Use the provided token or the default one
        const authToken = token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiIzYWM2MjcxOC0wNDVmLTRmYTMtYTAzMy02OTY1MTE5MmI4ZDciLCJDb21JZCI6IjE5MjEiLCJOYW1lIjoiU2h1YmhhbSBTYXJvaiIsIkVtYWlsIjoic2h1YmhhbUBpbnN0YWNoYXJ0ZXIuYXBwIiwiUm9sZSI6IkFkbWluLCBCcm9rZXIsIFVzZXIsIE9wZXJhdG9yIiwiQ3VycmVuY3kiOiJJTlIiLCJQaG9uZU51bWJlciI6Iis5MSA4ODUwNDk3MzY0IiwiVGltZVpvbmUiOiIzMzAiLCJJc1ByZW1pdW0iOiJUcnVlIiwiZXhwIjoxOTA3NDAwNTcxLCJpc3MiOiJodHRwczovL2luc3RhY2hhcnRlcmFwcC1zZXJ2ZXItY2dmcWd1ZzVmMmZzYWVhZy5jZW50cmFsdXMtMDEuYXp1cmV3ZWJzaXRlcy5uZXQiLCJhdWQiOiJodHRwczovL2luc3RhY2hhcnRlcmFwcC1zZXJ2ZXItY2dmcWd1ZzVmMmZzYWVhZy5jZW50cmFsdXMtMDEuYXp1cmV3ZWJzaXRlcy5uZXQvIn0.9AsTY3ZBLL994XG6Kzt7OMhTpUG9Vi8YAuEUes1dcUU";
        
        // Prepare headers with the provided token
        const headers = {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
            'Authorization': `Bearer ${authToken}`
        };
        
        // Base URL - using the Azure websites URL from the JWT to avoid SSL issues
        const baseUrl = 'https://instacharterapp-server-cgfqgug5f2fsaeag.centralus-01.azurewebsites.net';
        
        // Make the API request
        const response = await fetch(`${baseUrl}/api/Markets/GetAvailabilities?PageNo=${pageNo}`, {
            method: 'GET',
            headers: headers
        });
        
        // Parse response
        const data = await response.json();
        
        if (data && data.success) {
            return data.data;
        } else {
            throw new Error(data?.message || 'Failed to fetch availabilities');
        }
    } catch (error) {
        console.error('Error fetching availabilities:', error);
        throw error;
    }
}

// Simple function that doesn't require token parameter
export const getAvailabilities = async (pageNo = 1) => {
    // Just call the token version with default token
    return getAvailabilitiesWithToken(pageNo);
}

/**
 * Example of how to use this in a Wix page:
 * 
 * In your page code (Page.js):
 * 
 * import { getAvailabilities } from 'backend/instacharter.jsw';
 * 
 * $w.onReady(function () {
 *   $w('#loadingState').show();
 *   
 *   getAvailabilities(1)
 *     .then(availabilities => {
 *       console.log('Availabilities:', availabilities);
 *       
 *       // Update your repeater or dataset
 *       $w('#availabilitiesRepeater').data = availabilities;
 *       
 *       // Show the repeater
 *       $w('#availabilitiesRepeater').show();
 *     })
 *     .catch(error => {
 *       console.error('Error:', error);
 *       $w('#errorText').text = 'Failed to load availabilities. Please try again.';
 *       $w('#errorText').show();
 *     })
 *     .finally(() => {
 *       $w('#loadingState').hide();
 *     });
 * });
 */ 