import 'dotenv/config';
import express from 'express';
import voiceRoute from './routes/voice';

const app = express();

app.use(express.json());
app.use('/voice', voiceRoute);

app.get('/', (_req, res) => {
  res.send('LinguaFlowAI81 Gemini backend is running');
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
  console.log('GEMINI MODEL:', process.env.GEMINI_MODEL);
  console.log('GEMINI KEY PREFIX:', process.env.GEMINI_API_KEY?.slice(0, 12));
});
