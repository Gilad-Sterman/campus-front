import api from './api';

const studyBuddyApi = {
    /**
     * Get Discord invite link for the current authenticated user
     * @returns {Promise} API response with Discord link and group info
     */
    getDiscordLink: async () => {
        return api.get('/study-buddy/discord-link');
    },

    /**
     * Get user's group assignment info (for debugging)
     * @returns {Promise} API response with detailed group info
     */
    getGroupInfo: async () => {
        return api.get('/study-buddy/group-info');
    }
};

export default studyBuddyApi;
