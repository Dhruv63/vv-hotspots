
import { fetchFriends, removeFriend } from '../friendsService';
import { createClient } from '../supabase/client';

// Mock Supabase client and data
jest.mock('../supabase/client', () => ({
  createClient: jest.fn(),
}));

describe('friendsService', () => {
  const mockSupabase = {
    from: jest.fn(),
  };

  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    jest.clearAllMocks();
  });

  describe('fetchFriends', () => {
    it('should fetch friends and map data correctly', async () => {
      const userId = 'user-123';
      const friendshipsData = [
        { id: 'fs-1', user_id_1: 'user-123', user_id_2: 'friend-1', created_at: '2023-01-01' },
        { id: 'fs-2', user_id_1: 'friend-2', user_id_2: 'user-123', created_at: '2023-01-02' },
      ];
      const profilesData = [
        { id: 'friend-1', username: 'Friend 1', avatar_url: 'url1', bio: 'bio1', city: 'City1', instagram_username: 'ig1', twitter_username: 'tw1' },
        { id: 'friend-2', username: 'Friend 2', avatar_url: 'url2', bio: 'bio2', city: 'City2', instagram_username: 'ig2', twitter_username: 'tw2' },
      ];

      // Mock chain for friendships query
      const mockSelectFriendships = jest.fn().mockReturnValue({
        or: jest.fn().mockResolvedValue({ data: friendshipsData, error: null })
      });
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'friendships') {
          return { select: mockSelectFriendships };
        }
        if (table === 'profiles') {
          return { select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ data: profilesData, error: null })
          })};
        }
        return {};
      });

      const result = await fetchFriends(userId);

      expect(mockSupabase.from).toHaveBeenCalledWith('friendships');
      expect(mockSelectFriendships).toHaveBeenCalledWith('id, user_id_1, user_id_2, created_at');
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        friendshipId: 'fs-1',
        friendId: 'friend-1',
        username: 'Friend 1',
        avatarUrl: 'url1',
        bio: 'bio1',
        city: 'City1',
        instagramUsername: 'ig1',
        twitterUsername: 'tw1',
        createdAt: '2023-01-01'
      });
      expect(result[1]).toEqual({
        friendshipId: 'fs-2',
        friendId: 'friend-2',
        username: 'Friend 2',
        avatarUrl: 'url2',
        bio: 'bio2',
        city: 'City2',
        instagramUsername: 'ig2',
        twitter_username: undefined, // twitter_username mapped to twitterUsername in service
        twitterUsername: 'tw2',
        createdAt: '2023-01-02'
      });
    });

    it('should return empty array if no friendships found', async () => {
        const mockSelectFriendships = jest.fn().mockReturnValue({
            or: jest.fn().mockResolvedValue({ data: [], error: null })
          });
          mockSupabase.from.mockImplementation((table) => {
            if (table === 'friendships') return { select: mockSelectFriendships };
            return {};
          });

          const result = await fetchFriends('user-123');
          expect(result).toEqual([]);
    });
  });

  describe('removeFriend', () => {
    it('should call delete on friendships table', async () => {
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      });
      mockSupabase.from.mockImplementation(() => ({
        delete: mockDelete
      }));

      await removeFriend('fs-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('friendships');
      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
