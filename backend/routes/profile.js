import express from 'express';
import { run, get } from '../config/db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Retrieve user's profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const profile = await get('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found. Please create a profile.' });
    }
    return res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ error: 'Server error retrieving profile.' });
  }
});

// Create user's profile
router.post('/', authMiddleware, async (req, res) => {
  const { full_name, organization, research_domain, keywords, research_interests } = req.body;

  if (!full_name || !organization || !research_domain || !keywords || !research_interests) {
    return res.status(400).json({ error: 'Please provide all profile fields.' });
  }

  try {
    // Check if profile already exists
    const existingProfile = await get('SELECT id FROM profiles WHERE user_id = ?', [req.user.id]);
    if (existingProfile) {
      return res.status(400).json({ error: 'Profile already exists. Use PUT to update it.' });
    }

    const result = await run(`
      INSERT INTO profiles (user_id, full_name, organization, research_domain, keywords, research_interests)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      full_name,
      organization,
      research_domain,
      keywords,
      research_interests
    ]);

    return res.status(201).json({
      message: 'Profile created successfully',
      profile: {
        id: result.id,
        user_id: req.user.id,
        full_name,
        organization,
        research_domain,
        keywords,
        research_interests
      }
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    return res.status(500).json({ error: 'Server error creating profile.' });
  }
});

// Update user's profile
router.put('/', authMiddleware, async (req, res) => {
  const { full_name, organization, research_domain, keywords, research_interests } = req.body;

  if (!full_name || !organization || !research_domain || !keywords || !research_interests) {
    return res.status(400).json({ error: 'Please provide all profile fields for update.' });
  }

  try {
    // Check if profile exists
    const existingProfile = await get('SELECT id FROM profiles WHERE user_id = ?', [req.user.id]);
    if (!existingProfile) {
      return res.status(404).json({ error: 'Profile does not exist. Use POST to create one.' });
    }

    await run(`
      UPDATE profiles 
      SET full_name = ?, organization = ?, research_domain = ?, keywords = ?, research_interests = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [
      full_name,
      organization,
      research_domain,
      keywords,
      research_interests,
      req.user.id
    ]);

    return res.json({
      message: 'Profile updated successfully',
      profile: {
        user_id: req.user.id,
        full_name,
        organization,
        research_domain,
        keywords,
        research_interests
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Server error updating profile.' });
  }
});

// Delete user's profile
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const existingProfile = await get('SELECT id FROM profiles WHERE user_id = ?', [req.user.id]);
    if (!existingProfile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    await run('DELETE FROM profiles WHERE user_id = ?', [req.user.id]);
    return res.json({ message: 'Profile deleted successfully.' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    return res.status(500).json({ error: 'Server error deleting profile.' });
  }
});

export default router;
