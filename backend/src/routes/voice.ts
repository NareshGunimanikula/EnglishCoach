import express from 'express';
import { translateToEnglish } from '../services/translator';
import { buildCoachResponse } from '../services/coach';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { audio, history = [], mode = 'coach' } = req.body;

    if (!audio || typeof audio !== 'string') {
      return res
        .status(400)
        .json({ error: 'audio must be a non-empty string' });
    }

    const translated = await translateToEnglish(audio);

    console.log('Original Telugu:', audio);
    console.log('Translated English:', translated);
    console.log('Mode:', mode);

    const agentResult = await buildCoachResponse(
      audio,
      translated,
      history,
      mode,
    );

    return res.json({
      ...agentResult,
      source: 'gemini',
    });
  } catch (error) {
    console.error('Voice route error:', error);
    return res.status(500).json({ error: 'Processing failed' });
  }
});

export default router;
